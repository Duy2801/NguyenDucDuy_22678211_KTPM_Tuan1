const express = require('express');
const redis = require('redis');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 8083;
const ORDER_WRITE_QUEUE = 'order-write-commands';
const RESPONSE_TIMEOUT_SECONDS = 10;

function createRequestId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function sendQueueCommand(queue, payload) {
  const requestId = createRequestId();
  const responseKey = `product-response:${requestId}`;
  const responseClient = redisClient.duplicate();

  await responseClient.connect();

  try {
    await redisClient.lPush(queue, JSON.stringify({ ...payload, requestId }));

    const response = await responseClient.brPop(responseKey, RESPONSE_TIMEOUT_SECONDS);
    await redisClient.del(responseKey);

    if (!response) {
      const error = new Error('Service timeout');
      error.status = 504;
      throw error;
    }

    const result = JSON.parse(response.element);

    if (!result.ok) {
      const error = new Error(result.error || 'Service error');
      error.status = result.status || 500;
      throw error;
    }

    return result.data;
  } finally {
    await responseClient.quit();
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

    try {
      // Persist order through data-write worker instead of writing MariaDB directly
      await sendQueueCommand(ORDER_WRITE_QUEUE, {
        type: 'ORDER_CREATE',
        data: orderData,
      });
    } catch (error) {
      await redisClient.del(`order:${orderId}`);
      throw error;
    }

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
  console.log(`🚀 PU3 (Order) running on http://localhost:${PORT}`);
});
