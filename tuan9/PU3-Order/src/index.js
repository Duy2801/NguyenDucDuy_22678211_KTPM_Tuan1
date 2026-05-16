const express = require('express');
const redis = require('redis');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const mariadb = require('mariadb');

const app = express();
const PORT = 8083;

// MariaDB Config
const mariadbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'sapassword',
  database: 'flashsale_db',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
};

let pool;

// Initialize MariaDB Pool + orders table
async function initMariaDB() {
  try {
    pool = mariadb.createPool(mariadbConfig);
    const conn = await pool.getConnection();

    await conn.query('CREATE DATABASE IF NOT EXISTS flashsale_db');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id VARCHAR(100) PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(100),
        items_json LONGTEXT NOT NULL,
        total INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    conn.release();
    console.log('✅ MariaDB connected and orders table ready');
  } catch (error) {
    console.error('❌ MariaDB Error:', error.message);
    process.exit(1);
  }
}

async function persistOrderToMariaDB(orderData) {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      `INSERT INTO orders (
        order_id, session_id, customer_name, customer_email, customer_phone,
        items_json, total, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderData.orderId,
        orderData.sessionId,
        orderData.customerName,
        orderData.customerEmail,
        orderData.customerPhone,
        orderData.items,
        parseInt(orderData.total),
        orderData.status,
        new Date(orderData.createdAt),
      ]
    );
  } finally {
    conn.release();
  }
}

// Redis Client
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

app.use(cors());
app.use(express.json());

// API: Checkout
app.post('/checkout', async (req, res) => {
  try {
    const { sessionId, customerInfo } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId',
      });
    }

    const customer = customerInfo || {
      name: 'Anonymous Customer',
      email: 'anonymous@flash-sale.local',
      phone: 'N/A',
    };

    // Get cart from Data Grid
    const cartKey = `cart:${sessionId}`;
    const keys = await redisClient.keys(`${cartKey}:item:*`);

    if (keys.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty',
      });
    }

    // Retrieve cart items
    const items = [];
    let total = 0;

    for (const key of keys) {
      const item = await redisClient.hGetAll(key);
      if (Object.keys(item).length > 0) {
        const itemTotal = parseInt(item.price) * parseInt(item.quantity);
        total += itemTotal;
        items.push({
          productId: item.productId,
          name: item.name,
          price: parseInt(item.price),
          quantity: parseInt(item.quantity),
          subtotal: itemTotal,
        });
      }
    }

    // Create order
    const orderId = uuidv4();
    const orderData = {
      orderId,
      sessionId,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      items: JSON.stringify(items),
      total: total.toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Store order in Redis
    await redisClient.hSet(`order:${orderId}`, orderData);

    // Persist order to MariaDB (Redis remains the primary runtime data source)
    await persistOrderToMariaDB(orderData);

    // Add order ID to orders list
    const ordersList = JSON.parse(await redisClient.get('orders:list') || '[]');
    ordersList.push(orderId);
    await redisClient.set('orders:list', JSON.stringify(ordersList));

    // Clear cart after successful checkout
    await redisClient.del(keys);

    // Emit event for Inventory PU to consume and update stock
    const event = {
      type: 'order_created',
      orderId,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      timestamp: new Date().toISOString(),
    };
    await redisClient.publish('order_events', JSON.stringify(event));

    res.json({
      success: true,
      message: 'Order created successfully (inventory update sent via event)',
      order: {
        orderId,
        items,
        total,
        customerName: customer.name,
        status: 'pending',
        createdAt: orderData.createdAt,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Get order
app.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await redisClient.hGetAll(`order:${orderId}`);

    if (Object.keys(order).length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: {
        ...order,
        items: JSON.parse(order.items),
        total: parseInt(order.total),
      },
      message: 'Order retrieved from Data Grid',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: List all orders
app.get('/orders', async (req, res) => {
  try {
    const ordersList = JSON.parse(await redisClient.get('orders:list') || '[]');
    const orders = [];

    for (const orderId of ordersList) {
      const order = await redisClient.hGetAll(`order:${orderId}`);
      if (Object.keys(order).length > 0) {
        orders.push({
          ...order,
          items: JSON.parse(order.items),
          total: parseInt(order.total),
        });
      }
    }

    res.json({
      success: true,
      data: orders,
      count: orders.length,
      message: 'Orders retrieved from Data Grid',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'alive',
    service: 'PU3 - Order Processing Unit',
    port: PORT,
  });
});

// Start server
app.listen(PORT, async () => {
  await initMariaDB();
  console.log(`🚀 PU3 (Order) running on http://localhost:${PORT}`);
});
