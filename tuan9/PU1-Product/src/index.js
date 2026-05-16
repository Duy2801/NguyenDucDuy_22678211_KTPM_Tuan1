const express = require('express');
const redis = require('redis');
const cors = require('cors');
const mariadb = require('mariadb');

const app = express();
const PORT = 8081;

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

// Initialize MariaDB Pool
async function initMariaDB() {
  try {
    pool = mariadb.createPool(mariadbConfig);
    const conn = await pool.getConnection();
    
    // Create database if not exists
    await conn.query('CREATE DATABASE IF NOT EXISTS flashsale_db');
    
    // Create products table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        stock INT NOT NULL,
        image VARCHAR(500),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    conn.release();
    console.log('✅ MariaDB connected and tables created');
  } catch (error) {
    console.error('❌ MariaDB Error:', error.message);
    process.exit(1);
  }
}

// Redis Client
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

// Subscriber for inventory events (to persist changes to MariaDB)
let subscriber;

async function initSubscriber() {
  try {
    subscriber = redisClient.duplicate();
    await subscriber.connect();

    await subscriber.subscribe('inventory_events', async (message) => {
      try {
        const event = JSON.parse(message);
        if (event.type === 'stock_reduced') {
          const conn = await pool.getConnection();
          // Update MariaDB product stock to the new stock value
          await conn.query('UPDATE products SET stock = ? WHERE id = ?', [event.newStock, event.productId]);
          conn.release();
          console.log(`🔁 Persisted stock update for product ${event.productId} -> ${event.newStock}`);
        }
      } catch (err) {
        console.error('Error handling inventory event:', err.message);
      }
    });
  } catch (err) {
    console.error('Error initializing Redis subscriber:', err.message);
  }
}

app.use(cors());
app.use(express.json());

// Mock data - sẽ được đẩy vào Redis
const mockProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 999,
    stock: 100,
    image: 'https://via.placeholder.com/300',
    description: 'Flagship smartphone',
  },
  {
    id: '2',
    name: 'MacBook Pro',
    price: 1999,
    stock: 50,
    image: 'https://via.placeholder.com/300',
    description: 'High-performance laptop',
  },
  {
    id: '3',
    name: 'iPad Air',
    price: 599,
    stock: 200,
    image: 'https://via.placeholder.com/300',
    description: 'Tablet for productivity',
  },
  {
    id: '4',
    name: 'AirPods Pro',
    price: 249,
    stock: 500,
    image: 'https://via.placeholder.com/300',
    description: 'Wireless earbuds',
  },
  {
    id: '5',
    name: 'Apple Watch',
    price: 399,
    stock: 150,
    image: 'https://via.placeholder.com/300',
    description: 'Smart watch',
  },
];

// Initialize Redis with products
async function initializeData() {
  try {
    const conn = await pool.getConnection();
    
    for (const product of mockProducts) {
      // Write-Through: Save to Redis first
      await redisClient.hSet(`product:${product.id}`, {
        id: product.id,
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        image: product.image,
        description: product.description,
      });
      
      // Then save to MariaDB
      await conn.query(
        `INSERT IGNORE INTO products (id, name, price, stock, image, description) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product.id, product.name, product.price, product.stock, product.image, product.description]
      );
    }
    
    // Store product IDs list in Redis
    await redisClient.set('product:ids', JSON.stringify(mockProducts.map(p => p.id)));
    
    conn.release();
    console.log('✅ Redis + MariaDB initialized with products');
  } catch (error) {
    console.error('❌ Error initializing data:', error);
  }
}

// API: Get all products
app.get('/products', async (req, res) => {
  try {
    // Try Redis first
    let productIds = await redisClient.get('product:ids');
    
    if (!productIds) {
      // Cache miss: Read from MariaDB
      const conn = await pool.getConnection();
      const rows = await conn.query('SELECT id FROM products');
      conn.release();
      
      productIds = JSON.stringify(rows.map(r => r.id));
      // Update Redis cache
      await redisClient.set('product:ids', productIds);
    }
    
    productIds = JSON.parse(productIds || '[]');
    const products = [];

    for (const id of productIds) {
      let product = await redisClient.hGetAll(`product:${id}`);
      
      // If not in Redis, get from MariaDB
      if (Object.keys(product).length === 0) {
        const conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM products WHERE id = ?', [id]);
        conn.release();
        
        if (rows.length > 0) {
          const row = rows[0];
          product = {
            id: row.id,
            name: row.name,
            price: row.price.toString(),
            stock: row.stock.toString(),
            image: row.image,
            description: row.description,
          };
          // Update Redis cache
          await redisClient.hSet(`product:${id}`, product);
        }
      }
      
      if (Object.keys(product).length > 0) {
        products.push({
          ...product,
          price: parseInt(product.price),
          stock: parseInt(product.stock),
        });
      }
    }

    res.json({
      success: true,
      data: products,
      message: 'Products retrieved from Data Grid (Redis) or MariaDB',
      cache: productIds.length > 0 ? 'HIT' : 'MISS',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Get single product
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let product = await redisClient.hGetAll(`product:${id}`);
    let source = 'Redis';

    // If not in Redis, get from MariaDB
    if (Object.keys(product).length === 0) {
      const conn = await pool.getConnection();
      const rows = await conn.query('SELECT * FROM products WHERE id = ?', [id]);
      conn.release();
      
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }
      
      const row = rows[0];
      product = {
        id: row.id,
        name: row.name,
        price: row.price.toString(),
        stock: row.stock.toString(),
        image: row.image,
        description: row.description,
      };
      source = 'MariaDB';
      
      // Update Redis cache
      await redisClient.hSet(`product:${id}`, product);
    }

    res.json({
      success: true,
      data: {
        ...product,
        price: parseInt(product.price),
        stock: parseInt(product.stock),
      },
      message: `Product retrieved from ${source}`,
      source,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'alive',
    service: 'PU1 - Product Processing Unit',
    port: PORT,
  });
});

// Start server
app.listen(PORT, async () => {
  await initMariaDB();
  await initializeData();
  await initSubscriber();
  console.log(`🚀 PU1 (Product) running on http://localhost:${PORT}`);
  console.log(`📊 Using Redis + MariaDB Cache-Aside Pattern`);
});
