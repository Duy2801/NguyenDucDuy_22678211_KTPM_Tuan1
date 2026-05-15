const redis = require('redis');
const mariadb = require('mariadb');

const COMMAND_QUEUE = 'product-commands';
const PRODUCTS_CACHE_KEY = 'products';

const db = mariadb.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'product_db',
  connectionLimit: 5
});

async function sendResponse(client, requestId, payload) {
  if (!requestId) {
    return;
  }

  await client.lPush(`product-response:${requestId}`, JSON.stringify(payload));
}

async function publishChanged(client, type, data) {
  await client.del(PRODUCTS_CACHE_KEY);
  await client.publish(
    'product-events',
    JSON.stringify({
      type,
      data
    })
  );
}

function normalizeProduct(raw) {
  if (!raw) return null;
  return {
    id: Number(raw.id),
    name: raw.name,
    price: Number(raw.price)
  };
}

async function getCachedProducts(client) {
  const cache = await client.get(PRODUCTS_CACHE_KEY);
  if (!cache) {
    return null;
  }

  try {
    const products = JSON.parse(cache);
    return Array.isArray(products) ? products : null;
  } catch {
    return null;
  }
}

async function findProductById(client, id) {
  const cachedProducts = await getCachedProducts(client);

  if (cachedProducts) {
    const found = cachedProducts.find((item) => Number(item.id) === Number(id));
    return {
      product: normalizeProduct(found),
      source: 'redis'
    };
  }

  const rows = await db.query('SELECT id, name, price FROM products WHERE id=?', [id]);
  return {
    product: normalizeProduct(rows[0]),
    source: 'db'
  };
}

async function findProductByName(client, name) {
  const cachedProducts = await getCachedProducts(client);

  if (cachedProducts) {
    const found = cachedProducts.find(
      (item) => String(item.name || '').trim().toLowerCase() === String(name || '').trim().toLowerCase()
    );
    return {
      product: normalizeProduct(found),
      source: 'redis'
    };
  }

  const rows = await db.query('SELECT id, name, price FROM products WHERE LOWER(name)=LOWER(?) LIMIT 1', [name]);
  return {
    product: normalizeProduct(rows[0]),
    source: 'db'
  };
}

async function handleCommand(client, command) {
  const { type, data, requestId } = command;

  try {
    if (type === 'CREATE') {
      const lookup = await findProductByName(client, data.name);
      if (lookup.product) {
        await sendResponse(client, requestId, {
          ok: false,
          status: 409,
          error: `Product name already exists (checked from ${lookup.source})`
        });
        return;
      }

      const result = await db.query(
        'INSERT INTO products(name, price) VALUES (?, ?)',
        [data.name, data.price]
      );

      const product = {
        id: Number(result.insertId),
        name: data.name,
        price: Number(data.price)
      };

      await publishChanged(client, 'CREATE', product);
      await sendResponse(client, requestId, { ok: true, data: product });
      return;
    }

    if (type === 'UPDATE') {
      const lookup = await findProductById(client, data.id);
      if (!lookup.product) {
        await sendResponse(client, requestId, {
          ok: false,
          status: 404,
          error: `Product not found (checked from ${lookup.source})`
        });
        return;
      }

      await db.query(
        'UPDATE products SET name=?, price=? WHERE id=?',
        [data.name, data.price, data.id]
      );

      const product = {
        id: Number(data.id),
        name: data.name,
        price: Number(data.price)
      };

      await publishChanged(client, 'UPDATE', product);
      await sendResponse(client, requestId, { ok: true, data: product });
      return;
    }

    if (type === 'DELETE') {
      const lookup = await findProductById(client, data.id);
      if (!lookup.product) {
        await sendResponse(client, requestId, {
          ok: false,
          status: 404,
          error: `Product not found (checked from ${lookup.source})`
        });
        return;
      }

      await db.query('DELETE FROM products WHERE id=?', [data.id]);

      const result = {
        message: 'Product deleted successfully',
        id: Number(data.id)
      };

      await publishChanged(client, 'DELETE', { id: Number(data.id) });
      await sendResponse(client, requestId, { ok: true, data: result });
      return;
    }

    await sendResponse(client, requestId, {
      ok: false,
      status: 400,
      error: `Unsupported command: ${type}`
    });
  } catch (error) {
    await sendResponse(client, requestId, {
      ok: false,
      status: 500,
      error: error.message
    });
  }
}

async function start() {
  const client = redis.createClient({
    url: 'redis://localhost:6379'
  });

  client.on('error', (error) => {
    console.error('Redis error:', error.message);
  });

  await client.connect();
  console.log('service-write is listening for Redis commands');

  while (true) {
    const item = await client.brPop(COMMAND_QUEUE, 0);
    const command = JSON.parse(item.element);
    await handleCommand(client, command);
  }
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
