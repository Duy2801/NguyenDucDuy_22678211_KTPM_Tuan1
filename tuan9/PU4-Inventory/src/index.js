const express = require('express');
const redis = require('redis');
const cors = require('cors');

const app = express();
const PORT = 8084;

// Redis Client
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

let subscriberClient;

async function reduceInventoryItems(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      success: false,
      error: 'Invalid items array',
      statusCode: 400,
    };
  }

  // Check stock availability first
  const insufficientItems = [];

  for (const item of items) {
    const product = await redisClient.hGetAll(`product:${item.productId}`);
    const currentStock = parseInt(product.stock);

    if (Number.isNaN(currentStock) || currentStock < item.quantity) {
      insufficientItems.push({
        productId: item.productId,
        name: product.name,
        available: Number.isNaN(currentStock) ? 0 : currentStock,
        requested: item.quantity,
      });
    }
  }

  if (insufficientItems.length > 0) {
    return {
      success: false,
      message: 'Insufficient stock',
      insufficientItems,
      statusCode: 400,
    };
  }

  const reductionResults = [];

  for (const item of items) {
    const newStock = await redisClient.hIncrBy(
      `product:${item.productId}`,
      'stock',
      -item.quantity
    );

    // Notify product service to persist stock update to DB
    const stockReducedEvent = {
      type: 'stock_reduced',
      productId: item.productId,
      quantity: item.quantity,
      newStock,
      timestamp: new Date().toISOString(),
    };
    await redisClient.publish('inventory_events', JSON.stringify(stockReducedEvent));

    reductionResults.push({
      productId: item.productId,
      quantity: item.quantity,
      newStock,
    });
  }

  return {
    success: true,
    message: 'Stock reduced successfully',
    reductions: reductionResults,
    timestamp: new Date().toISOString(),
    statusCode: 200,
  };
}

async function initOrderEventSubscriber() {
  try {
    subscriberClient = redisClient.duplicate();
    await subscriberClient.connect();

    await subscriberClient.subscribe('order_events', async (message) => {
      try {
        const event = JSON.parse(message);
        if (event.type !== 'order_created') {
          return;
        }

        const processedKey = `order:inventory:processed:${event.orderId}`;
        const alreadyProcessed = await redisClient.get(processedKey);
        if (alreadyProcessed) {
          return;
        }

        const result = await reduceInventoryItems(event.items || []);
        if (!result.success) {
          console.log(`⚠️ Inventory update failed for order ${event.orderId}: ${result.message || result.error}`);
          return;
        }

        // Mark processed to avoid duplicate stock reduction when event is replayed
        await redisClient.set(processedKey, '1');
        console.log(`✅ Inventory updated from order event: ${event.orderId}`);
      } catch (error) {
        console.error('Error processing order event:', error.message);
      }
    });

    console.log('📡 Subscribed to order_events for inventory updates');
  } catch (error) {
    console.error('Error initializing order event subscriber:', error.message);
  }
}

app.use(cors());
app.use(express.json());

// API: Get stock for a product
app.get('/stock/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await redisClient.hGetAll(`product:${productId}`);

    if (Object.keys(product).length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: {
        productId,
        name: product.name,
        stock: parseInt(product.stock),
        price: parseInt(product.price),
      },
      message: 'Stock retrieved from Data Grid (Redis)',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Reduce stock (called by Order PU)
app.post('/inventory/reduce', async (req, res) => {
  try {
    const { items } = req.body;
    const result = await reduceInventoryItems(items);
    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        error: result.error,
        message: result.message,
        insufficientItems: result.insufficientItems,
      });
    }

    res.json({
      success: true,
      message: 'Stock reduced successfully (Redis update + inventory event)',
      reductions: result.reductions,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error('Error reducing inventory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Check multiple stocks
app.post('/inventory/check', async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid productIds array',
      });
    }

    const stocks = [];

    for (const productId of productIds) {
      const product = await redisClient.hGetAll(`product:${productId}`);
      if (Object.keys(product).length > 0) {
        stocks.push({
          productId,
          name: product.name,
          stock: parseInt(product.stock),
          price: parseInt(product.price),
        });
      }
    }

    res.json({
      success: true,
      data: stocks,
      message: 'Stocks retrieved from Data Grid',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Get all products stock status
app.get('/inventory', async (req, res) => {
  try {
    const productIds = JSON.parse(await redisClient.get('product:ids') || '[]');
    const inventory = [];

    for (const id of productIds) {
      const product = await redisClient.hGetAll(`product:${id}`);
      if (Object.keys(product).length > 0) {
        inventory.push({
          productId: id,
          name: product.name,
          stock: parseInt(product.stock),
          price: parseInt(product.price),
          status: parseInt(product.stock) > 0 ? 'available' : 'out_of_stock',
        });
      }
    }

    res.json({
      success: true,
      data: inventory,
      message: 'Inventory status from Data Grid',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'alive',
    service: 'PU4 - Inventory Processing Unit',
    port: PORT,
  });
});

// Start server
app.listen(PORT, async () => {
  await initOrderEventSubscriber();
  console.log(`🚀 PU4 (Inventory) running on http://localhost:${PORT}`);
});
