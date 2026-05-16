const express = require('express');
const redis = require('redis');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 8082;

// Redis Client
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

app.use(cors());
app.use(express.json());

// Middleware to get or create session
const sessionMiddleware = (req, res, next) => {
  let sessionId = req.headers['x-session-id'];
  
  if (!sessionId) {
    sessionId = uuidv4();
    res.setHeader('x-session-id', sessionId);
  }
  
  req.sessionId = sessionId;
  next();
};

app.use(sessionMiddleware);

// API: Add to cart
app.post('/cart/add', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const sessionId = req.sessionId;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid productId or quantity',
      });
    }

    // Get product from Data Grid to validate
    const product = await redisClient.hGetAll(`product:${productId}`);
    if (Object.keys(product).length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Add/update item in cart
    const cartKey = `cart:${sessionId}`;
    const cartItemKey = `${cartKey}:item:${productId}`;

    await redisClient.hSet(cartItemKey, {
      productId,
      name: product.name,
      price: product.price,
      quantity: quantity.toString(),
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Product added to cart',
      sessionId,
      cartItemKey,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Get cart
app.get('/cart', async (req, res) => {
  try {
    const sessionId = req.sessionId;
    const cartKey = `cart:${sessionId}`;

    // Get all items in cart
    const keys = await redisClient.keys(`${cartKey}:item:*`);
    const items = [];
    let total = 0;

    for (const key of keys) {
      const item = await redisClient.hGetAll(key);
      if (Object.keys(item).length > 0) {
        const itemTotal = parseInt(item.price) * parseInt(item.quantity);
        total += itemTotal;
        items.push({
          ...item,
          price: parseInt(item.price),
          quantity: parseInt(item.quantity),
          subtotal: itemTotal,
        });
      }
    }

    res.json({
      success: true,
      sessionId,
      cart: {
        items,
        total,
        itemCount: items.length,
      },
      message: 'Cart retrieved from Data Grid (Redis)',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Remove from cart
app.post('/cart/remove', async (req, res) => {
  try {
    const { productId } = req.body;
    const sessionId = req.sessionId;
    const cartItemKey = `cart:${sessionId}:item:${productId}`;

    await redisClient.del(cartItemKey);

    res.json({
      success: true,
      message: 'Product removed from cart',
      sessionId,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Clear cart
app.post('/cart/clear', async (req, res) => {
  try {
    const sessionId = req.sessionId;
    const cartKey = `cart:${sessionId}`;

    const keys = await redisClient.keys(`${cartKey}:item:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    res.json({
      success: true,
      message: 'Cart cleared',
      sessionId,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'alive',
    service: 'PU2 - Cart Processing Unit',
    port: PORT,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PU2 (Cart) running on http://localhost:${PORT}`);
});
