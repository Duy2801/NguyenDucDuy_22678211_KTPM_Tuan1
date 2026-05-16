const redis = require('redis');
const mariadb = require('mariadb');

const READ_QUEUE = 'product-read-commands';
const PRODUCTS_CACHE_KEY = 'products';

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

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});

redisClient.on('error', (error) => console.log('Redis Client Error', error));

async function ensureMariaDB() {
  pool = mariadb.createPool(mariadbConfig);
  const conn = await pool.getConnection();

  try {
    await conn.query('CREATE DATABASE IF NOT EXISTS flashsale_db');
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
    console.log('✅ data-read MariaDB ready');
  } finally {
    conn.release();
  }
}

async function sendResponse(requestId, payload) {
  if (!requestId) {
    return;
  }

  await redisClient.lPush(`product-response:${requestId}`, JSON.stringify(payload));
}

function normalizeProduct(row) {
  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    name: row.name,
    price: String(row.price),
    stock: String(row.stock),
    image: row.image || '',
    description: row.description || '',
  };
}

async function readProductIdsFromDb() {
  const conn = await pool.getConnection();

  try {
    const rows = await conn.query('SELECT id FROM products ORDER BY id');
    return rows.map((row) => String(row.id));
  } finally {
    conn.release();
  }
}

async function readProductFromDb(productId) {
  const conn = await pool.getConnection();

  try {
    const rows = await conn.query('SELECT * FROM products WHERE id = ?', [productId]);
    return normalizeProduct(rows[0]);
  } finally {
    conn.release();
  }
}

async function hydrateProductCache(product) {
  await redisClient.hSet(`product:${product.id}`, {
    id: String(product.id),
    name: product.name,
    price: String(product.price),
    stock: String(product.stock),
    image: product.image || '',
    description: product.description || '',
  });
}

async function handleReadCommand(command) {
  const { type, data, requestId } = command;

  try {
    if (type === 'READ_ALL') {
      let productIds = await redisClient.get('product:ids');
      let source = 'redis';

      if (!productIds) {
        const idsFromDb = await readProductIdsFromDb();
        productIds = JSON.stringify(idsFromDb);
        await redisClient.set('product:ids', productIds);
        source = 'db';
      }

      const ids = JSON.parse(productIds || '[]');
      const products = [];

      for (const id of ids) {
        let product = await redisClient.hGetAll(`product:${id}`);

        if (Object.keys(product).length === 0) {
          const productFromDb = await readProductFromDb(id);
          if (productFromDb) {
            product = productFromDb;
            await hydrateProductCache(productFromDb);
            source = 'db';
          }
        }

        if (Object.keys(product).length > 0) {
          products.push({
            ...product,
            price: parseInt(product.price, 10),
            stock: parseInt(product.stock, 10),
          });
        }
      }

      await sendResponse(requestId, {
        ok: true,
        data: {
          products,
          source,
        },
      });
      return;
    }

    if (type === 'READ_ONE') {
      const productId = data.id;
      let product = await redisClient.hGetAll(`product:${productId}`);
      let source = 'redis';

      if (Object.keys(product).length === 0) {
        const productFromDb = await readProductFromDb(productId);

        if (!productFromDb) {
          await sendResponse(requestId, {
            ok: false,
            status: 404,
            error: 'Product not found',
          });
          return;
        }

        product = productFromDb;
        source = 'db';
        await hydrateProductCache(productFromDb);
      }

      await sendResponse(requestId, {
        ok: true,
        data: {
          product: {
            ...product,
            price: parseInt(product.price, 10),
            stock: parseInt(product.stock, 10),
          },
          source,
        },
      });
      return;
    }

    await sendResponse(requestId, {
      ok: false,
      status: 400,
      error: `Unsupported read command: ${type}`,
    });
  } catch (error) {
    await sendResponse(requestId, {
      ok: false,
      status: 500,
      error: error.message,
    });
  }
}

async function start() {
  await redisClient.connect();
  await ensureMariaDB();

  const worker = redisClient.duplicate();
  worker.on('error', (error) => console.error('Read worker Redis error:', error.message));
  await worker.connect();

  console.log('📡 data-read worker is listening for product read commands');

  while (true) {
    const item = await worker.brPop(READ_QUEUE, 0);
    const command = JSON.parse(item.element);
    await handleReadCommand(command);
  }
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
