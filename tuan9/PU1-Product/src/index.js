const express = require('express');
const redis = require('redis');
const cors = require('cors');

const app = express();
const PORT = 8081;
const WRITE_QUEUE = 'product-write-commands';
const READ_QUEUE = 'product-read-commands';
const RESPONSE_TIMEOUT_SECONDS = 10;

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});

redisClient.on('error', (error) => console.log('Redis Client Error', error));

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

app.use(cors());
app.use(express.json());

app.get('/products', async (req, res) => {
  try {
    const cache = await redisClient.get('product:ids');

    if (cache) {
      const productIds = JSON.parse(cache || '[]');
      const products = [];

      for (const id of productIds) {
        const product = await redisClient.hGetAll(`product:${id}`);
        if (Object.keys(product).length > 0) {
          products.push({
            ...product,
            price: parseInt(product.price, 10),
            stock: parseInt(product.stock, 10),
          });
          continue;
        }

        try {
          const result = await sendQueueCommand(READ_QUEUE, { type: 'READ_ONE', data: { id } });
          if (result?.product) {
            products.push({
              ...result.product,
              price: parseInt(result.product.price, 10),
              stock: parseInt(result.product.stock, 10),
            });
          }
        } catch (error) {
          if (error.status !== 404) {
            throw error;
          }
        }
      }

      return res.json({
        success: true,
        data: products,
        message: 'Products retrieved from Redis cache',
        cache: 'HIT',
      });
    }

    const result = await sendQueueCommand(READ_QUEUE, { type: 'READ_ALL' });

    return res.json({
      success: true,
      data: result.products,
      message: 'Products retrieved through data-read worker',
      cache: result.source === 'redis' ? 'HIT' : 'MISS',
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let product = await redisClient.hGetAll(`product:${id}`);
    let source = 'Redis';

    if (Object.keys(product).length === 0) {
      const result = await sendQueueCommand(READ_QUEUE, { type: 'READ_ONE', data: { id } });
      product = result.product;
      source = result.source === 'db' ? 'MariaDB' : 'Redis';
    }

    res.json({
      success: true,
      data: {
        ...product,
        price: parseInt(product.price, 10),
        stock: parseInt(product.stock, 10),
      },
      message: `Product retrieved from ${source}`,
      source,
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
});

app.post('/products', async (req, res) => {
  try {
    const { name, price, stock, image, description } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name and price are required',
      });
    }

    const product = await sendQueueCommand(WRITE_QUEUE, {
      type: 'CREATE',
      data: {
        name,
        price: Number(price),
        stock: Number(stock ?? 0),
        image,
        description,
      },
    });

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created through data-write worker',
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, image, description } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, price and stock are required',
      });
    }

    const product = await sendQueueCommand(WRITE_QUEUE, {
      type: 'UPDATE',
      data: {
        id,
        name,
        price: Number(price),
        stock: Number(stock),
        image,
        description,
      },
    });

    res.json({
      success: true,
      data: product,
      message: 'Product updated through data-write worker',
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sendQueueCommand(WRITE_QUEUE, {
      type: 'DELETE',
      data: { id },
    });

    res.json({
      success: true,
      data: result,
      message: 'Product deleted through data-write worker',
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'alive',
    service: 'PU1 - Product API Gateway',
    port: PORT,
  });
});

async function start() {
  await redisClient.connect();

  app.listen(PORT, () => {
  console.log(`🚀 PU1 (Product) running on http://localhost:${PORT}`);
  console.log('📊 Using Redis queues with data-read and data-write workers');
  });
}

start().catch((error) => {
  console.error('Failed to start PU1:', error.message);
  process.exit(1);
});
