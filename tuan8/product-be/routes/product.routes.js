const express = require('express');
const router = express.Router();

const redis = require('../redis');

const COMMAND_QUEUE = 'product-commands';
const READ_QUEUE = 'product-read-commands';
const PRODUCTS_CACHE_KEY = 'products';
const RESPONSE_TIMEOUT_SECONDS = 10;

function createRequestId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function sendRedisCommand(queue, payload) {
  const requestId = createRequestId();
  const responseKey = `product-response:${requestId}`;
  const responseClient = redis.duplicate();

  await responseClient.connect();

  try {
    await redis.lPush(queue, JSON.stringify({ ...payload, requestId }));

    const response = await responseClient.brPop(responseKey, RESPONSE_TIMEOUT_SECONDS);
    await redis.del(responseKey);

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

// API only reads Redis cache. On cache miss, ask service-read through Redis.
router.get('/', async (req, res) => {
  try {
    const cache = await redis.get(PRODUCTS_CACHE_KEY);

    if (cache) {
      return res.json(JSON.parse(cache));
    }

    const products = await sendRedisCommand(READ_QUEUE, { type: 'READ_ALL' });
    res.json(products);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// API sends write commands to Redis. Only service-write touches the database.
router.post('/', async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const product = await sendRedisCommand(COMMAND_QUEUE, {
      type: 'CREATE',
      data: { name, price }
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const product = await sendRedisCommand(COMMAND_QUEUE, {
      type: 'UPDATE',
      data: { id: Number(id), name, price }
    });

    res.json(product);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sendRedisCommand(COMMAND_QUEUE, {
      type: 'DELETE',
      data: { id: Number(id) }
    });

    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

module.exports = router;
