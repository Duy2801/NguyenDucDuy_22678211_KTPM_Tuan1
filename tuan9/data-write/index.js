const redis = require('redis');
const mariadb = require('mariadb');

const WRITE_QUEUE = 'product-write-commands';
const ORDER_WRITE_QUEUE = 'order-write-commands';
const INVENTORY_EVENTS = 'inventory_events';

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

let pool;

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});

redisClient.on('error', (error) => console.log('Redis Client Error', error));

function createRequestId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function sendResponse(requestId, payload) {
  if (!requestId) {
    return;
  }

  await redisClient.lPush(`product-response:${requestId}`, JSON.stringify(payload));
}

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
    console.log('✅ data-write MariaDB ready');
  } finally {
    conn.release();
  }
}

async function seedProducts() {
  const conn = await pool.getConnection();

  try {
    for (const product of mockProducts) {
      await conn.query(
        `INSERT IGNORE INTO products (id, name, price, stock, image, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product.id, product.name, product.price, product.stock, product.image, product.description]
      );

      await redisClient.hSet(`product:${product.id}`, {
        id: product.id,
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        image: product.image,
        description: product.description,
      });
    }

    await redisClient.set('product:ids', JSON.stringify(mockProducts.map((product) => product.id)));
    console.log('✅ data-write seeded Redis cache and MariaDB');
  } finally {
    conn.release();
  }
}

async function upsertProductCache(product) {
  await redisClient.hSet(`product:${product.id}`, {
    id: String(product.id),
    name: product.name,
    price: String(product.price),
    stock: String(product.stock),
    image: product.image || '',
    description: product.description || '',
  });
}

async function syncProductIds(productId, action) {
  const rawIds = await redisClient.get('product:ids');
  const productIds = JSON.parse(rawIds || '[]').map(String);
  const normalizedId = String(productId);

  const nextIds = action === 'delete'
    ? productIds.filter((id) => id !== normalizedId)
    : Array.from(new Set([...productIds, normalizedId]));

  await redisClient.set('product:ids', JSON.stringify(nextIds));
}

async function updateStockFromInventoryEvent(event) {
  const conn = await pool.getConnection();

  try {
    await conn.query('UPDATE products SET stock = ? WHERE id = ?', [event.newStock, event.productId]);
    await redisClient.hSet(`product:${event.productId}`, 'stock', String(event.newStock));
    console.log(`🔁 Persisted stock update for product ${event.productId} -> ${event.newStock}`);
  } finally {
    conn.release();
  }
}

async function persistOrder(orderData) {
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
        parseInt(orderData.total, 10),
        orderData.status,
        new Date(orderData.createdAt),
      ]
    );
  } finally {
    conn.release();
  }
}

async function handleCommand(command) {
  const { type, data, requestId } = command;

  try {
    if (type === 'CREATE') {
      const conn = await pool.getConnection();

      try {
        const result = await conn.query(
          'INSERT INTO products (name, price, stock, image, description) VALUES (?, ?, ?, ?, ?)',
          [data.name, data.price, data.stock ?? 0, data.image || '', data.description || '']
        );

        const product = {
          id: String(result.insertId),
          name: data.name,
          price: Number(data.price),
          stock: Number(data.stock ?? 0),
          image: data.image || '',
          description: data.description || '',
        };

        await upsertProductCache(product);
        await syncProductIds(product.id, 'create');
        await sendResponse(requestId, { ok: true, data: product });
        return;
      } finally {
        conn.release();
      }
    }

    if (type === 'UPDATE') {
      const conn = await pool.getConnection();

      try {
        const existingRows = await conn.query('SELECT id FROM products WHERE id = ?', [data.id]);
        if (existingRows.length === 0) {
          await sendResponse(requestId, {
            ok: false,
            status: 404,
            error: 'Product not found',
          });
          return;
        }

        await conn.query(
          'UPDATE products SET name = ?, price = ?, stock = ?, image = ?, description = ? WHERE id = ?',
          [data.name, data.price, data.stock, data.image || '', data.description || '', data.id]
        );

        const product = {
          id: String(data.id),
          name: data.name,
          price: Number(data.price),
          stock: Number(data.stock),
          image: data.image || '',
          description: data.description || '',
        };

        await upsertProductCache(product);
        await syncProductIds(product.id, 'create');
        await sendResponse(requestId, { ok: true, data: product });
        return;
      } finally {
        conn.release();
      }
    }

    if (type === 'DELETE') {
      const conn = await pool.getConnection();

      try {
        const existingRows = await conn.query('SELECT id FROM products WHERE id = ?', [data.id]);
        if (existingRows.length === 0) {
          await sendResponse(requestId, {
            ok: false,
            status: 404,
            error: 'Product not found',
          });
          return;
        }

        await conn.query('DELETE FROM products WHERE id = ?', [data.id]);
        await redisClient.del(`product:${data.id}`);
        await syncProductIds(data.id, 'delete');

        await sendResponse(requestId, {
          ok: true,
          data: {
            message: 'Product deleted successfully',
            id: String(data.id),
          },
        });
        return;
      } finally {
        conn.release();
      }
    }

    if (type === 'ORDER_CREATE') {
      const conn = await pool.getConnection();

      try {
        const existingRows = await conn.query('SELECT order_id FROM orders WHERE order_id = ?', [data.orderId]);
        if (existingRows.length > 0) {
          await sendResponse(requestId, {
            ok: true,
            data: {
              message: 'Order already persisted',
              orderId: data.orderId,
            },
          });
          return;
        }
      } finally {
        conn.release();
      }

      await persistOrder(data);
      await sendResponse(requestId, {
        ok: true,
        data: {
          message: 'Order persisted successfully',
          orderId: data.orderId,
        },
      });
      return;
    }

    await sendResponse(requestId, {
      ok: false,
      status: 400,
      error: `Unsupported command: ${type}`,
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
  await seedProducts();

  const subscriber = redisClient.duplicate();
  subscriber.on('error', (error) => console.error('Inventory subscriber error:', error.message));
  await subscriber.connect();

  await subscriber.subscribe(INVENTORY_EVENTS, async (message) => {
    try {
      const event = JSON.parse(message);
      if (event.type === 'stock_reduced') {
        await updateStockFromInventoryEvent(event);
      }
    } catch (error) {
      console.error('Error handling inventory event:', error.message);
    }
  });

  console.log('📡 data-write worker is listening for product commands');

  const orderWorker = redisClient.duplicate();
  orderWorker.on('error', (error) => console.error('Order worker Redis error:', error.message));
  await orderWorker.connect();

  console.log('📡 data-write worker is listening for order commands');

  (async () => {
    while (true) {
      const item = await orderWorker.brPop(ORDER_WRITE_QUEUE, 0);
      const command = JSON.parse(item.element);
      await handleCommand(command);
    }
  })().catch((error) => {
    console.error('Order worker failed:', error.message);
  });

  while (true) {
    const item = await redisClient.brPop(WRITE_QUEUE, 0);
    const command = JSON.parse(item.element);
    await handleCommand(command);
  }
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
