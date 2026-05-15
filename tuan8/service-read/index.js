const redis = require('redis');
const mariadb = require('mariadb');

const db = mariadb.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'product_db',
  connectionLimit: 5
});

async function start() {
  try {
    // Redis subscriber để lắng nghe sự kiện
    const subscriber = redis.createClient({
      url: 'redis://localhost:6379'
    });

    // Redis cache để lưu dữ liệu
    const cache = redis.createClient({
      url: 'redis://localhost:6379'
    });

    await subscriber.connect();
    await cache.connect();

    console.log('🚀 SERVICE-READ RUNNING (Port: Event Listener)');
    console.log('📢 Listening for product-events...\n');

    // Lắng nghe sự kiện từ product-events channel
    await subscriber.subscribe('product-events', async (message) => {
      try {
        const event = JSON.parse(message);
        
        console.log('───────────────────────────────────────');
        console.log('📨 EVENT RECEIVED:', event.type);
        console.log('📦 Data:', event.data);

        // Khi có sự kiện, đọc lại toàn bộ dữ liệu từ Database
        console.log('🔄 Reading fresh data from DATABASE...');
        const products = await db.query('SELECT * FROM products');

        // Lưu vào Redis cache
        await cache.set('products', JSON.stringify(products));
        
        console.log('✅ CACHE UPDATED');
        console.log(`📊 Total products in cache: ${products.length}`);
        console.log('───────────────────────────────────────\n');
      } catch (error) {
        console.error('❌ ERROR processing event:', error.message);
      }
    });
  } catch (error) {
    console.error('❌ SERVICE-READ ERROR:', error);
    process.exit(1);
  }
}

start();