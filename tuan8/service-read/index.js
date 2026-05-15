const redis = require('redis');
const mariadb = require('mariadb');

const READ_QUEUE = 'product-read-commands';
const PRODUCTS_CACHE_KEY = 'products';

const db = mariadb.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'product_db',
  connectionLimit: 5
});

function normalizeProducts(rows) {
  return rows.map((item) => ({
    id: Number(item.id),
    name: item.name,
    price: Number(item.price)
  }));
}

async function sendResponse(client, requestId, payload) {
  if (!requestId) {
    return;
  }

  await client.lPush(`product-response:${requestId}`, JSON.stringify(payload));
}

async function getProductsFromRedisOrDb(cacheClient) {
  const cache = await cacheClient.get(PRODUCTS_CACHE_KEY);

  if (cache) {
    try {
      return {
        products: JSON.parse(cache),
        source: 'redis'
      };
    } catch {
      await cacheClient.del(PRODUCTS_CACHE_KEY);
    }
  }

  const rows = await db.query('SELECT id, name, price FROM products');
  const products = normalizeProducts(rows);
  await cacheClient.set(PRODUCTS_CACHE_KEY, JSON.stringify(products));

  return {
    products,
    source: 'db'
  };
}

async function start() {
  const subscriber = redis.createClient({ url: 'redis://localhost:6379' });
  const cacheClient = redis.createClient({ url: 'redis://localhost:6379' });
  const worker = redis.createClient({ url: 'redis://localhost:6379' });

  subscriber.on('error', (error) => {
    console.error('Redis subscriber error:', error.message);
  });

  cacheClient.on('error', (error) => {
    console.error('Redis cache error:', error.message);
  });

  worker.on('error', (error) => {
    console.error('Redis worker error:', error.message);
  });

  await subscriber.connect();
  await cacheClient.connect();
  await worker.connect();

  await subscriber.subscribe('product-events', async () => {
    try {
      await cacheClient.del(PRODUCTS_CACHE_KEY);
    } catch (error) {
      console.error('Cache invalidation failed:', error.message);
    }
  });

  console.log('service-read is listening for Redis read commands');

  while (true) {
    const item = await worker.brPop(READ_QUEUE, 0);
    const command = JSON.parse(item.element);

    try {
      if (command.type !== 'READ_ALL') {
        await sendResponse(worker, command.requestId, {
          ok: false,
          status: 400,
          error: `Unsupported read command: ${command.type}`
        });
        continue;
      }

      const { products, source } = await getProductsFromRedisOrDb(cacheClient);
      await sendResponse(worker, command.requestId, {
        ok: true,
        data: products,
        source
      });
    } catch (error) {
      await sendResponse(worker, command.requestId, {
        ok: false,
        status: 500,
        error: error.message
      });
    }
  }
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
