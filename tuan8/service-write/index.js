const redis = require('redis');

async function start() {
  try {
    const subscriber = redis.createClient({
      url: 'redis://localhost:6379'
    });

    const cache = redis.createClient({
      url: 'redis://localhost:6379'
    });

    await subscriber.connect();
    await cache.connect();

    console.log('🚀 SERVICE-WRITE RUNNING (Port: Cache Invalidation)');
    console.log('📢 Listening for product-events...\n');

    // Lắng nghe sự kiện và xóa cache cũ
    await subscriber.subscribe('product-events', async (message) => {
      try {
        const event = JSON.parse(message);
        
        console.log('───────────────────────────────────────');
        console.log('📨 EVENT RECEIVED:', event.type);
        console.log('📦 Data:', event.data);

        // Xóa cache cũ để Service-Read cập nhật lại
        console.log('🗑️ Invalidating old CACHE...');
        await cache.del('products');
        
        console.log('✅ CACHE CLEARED');
        console.log('💾 Service-Read will rebuild cache with fresh data');
        console.log('───────────────────────────────────────\n');
      } catch (error) {
        console.error('❌ ERROR processing event:', error.message);
      }
    });
  } catch (error) {
    console.error('❌ SERVICE-WRITE ERROR:', error);
    process.exit(1);
  }
}

start();