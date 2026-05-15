const express = require('express');
const router = express.Router();

const db = require('../db');
const redis = require('../redis');

// ============================================
// READ - Đọc từ Redis cache, không có thì đọc DB
// ============================================
router.get('/', async (req, res) => {
  try {
    const cache = await redis.get('products');

    // Bước 1: Kiểm tra Redis cache trước
    if (cache) {
      console.log('✓ READ FROM REDIS CACHE');
      return res.json(JSON.parse(cache));
    }

    // Bước 2: Nếu không có cache, đọc từ Database
    console.log('✓ READ FROM DATABASE');
    const rows = await db.query('SELECT * FROM products');

    // Bước 3: Lưu vào Redis cache để lần sau nhanh hơn
    await redis.set('products', JSON.stringify(rows));
    console.log('✓ CACHE SAVED');

    res.json(rows);
  } catch (error) {
    console.error('ERROR in GET /:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CREATE - Ghi vào DB, rồi công bố sự kiện
// ============================================
router.post('/', async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // Bước 1: Ghi vào Database
    console.log('✓ WRITING TO DATABASE');
    const result = await db.query(
      'INSERT INTO products(name, price) VALUES (?, ?)',
      [name, price]
    );

    const product = {
      id: result.insertId,
      name,
      price
    };

    // Bước 2: Công bố sự kiện CREATE qua Redis
    console.log('✓ PUBLISHING CREATE EVENT');
    await redis.publish(
      'product-events',
      JSON.stringify({
        type: 'CREATE',
        data: product
      })
    );

    res.status(201).json(product);
  } catch (error) {
    console.error('ERROR in POST /:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// UPDATE - Cập nhật DB, rồi công bố sự kiện
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // Bước 1: Cập nhật Database
    console.log('✓ UPDATING DATABASE');
    await db.query(
      'UPDATE products SET name=?, price=? WHERE id=?',
      [name, price, id]
    );

    const product = {
      id: parseInt(id),
      name,
      price: parseFloat(price)
    };

    // Bước 2: Công bố sự kiện UPDATE qua Redis
    console.log('✓ PUBLISHING UPDATE EVENT');
    await redis.publish(
      'product-events',
      JSON.stringify({
        type: 'UPDATE',
        data: product
      })
    );

    res.json(product);
  } catch (error) {
    console.error('ERROR in PUT /:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DELETE - Xóa từ DB, rồi công bố sự kiện
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Bước 1: Xóa từ Database
    console.log('✓ DELETING FROM DATABASE');
    await db.query('DELETE FROM products WHERE id=?', [id]);

    // Bước 2: Công bố sự kiện DELETE qua Redis
    console.log('✓ PUBLISHING DELETE EVENT');
    await redis.publish(
      'product-events',
      JSON.stringify({
        type: 'DELETE',
        data: { id: parseInt(id) }
      })
    );

    res.json({ message: 'Product deleted successfully', id });
  } catch (error) {
    console.error('ERROR in DELETE /:id:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;