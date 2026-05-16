import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

import TestInterface from './TestInterface';
const API_URLS = {
  products: 'http://localhost:8081/products',
  productDetail: 'http://localhost:8081/products',
  cartAdd: 'http://localhost:8082/cart/add',
  cartGet: 'http://localhost:8082/cart',
  cartRemove: 'http://localhost:8082/cart/remove',
  cartClear: 'http://localhost:8082/cart/clear',
  checkout: 'http://localhost:8083/checkout',
  inventory: 'http://localhost:8084/inventory',
};

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  const [showTestInterface, setShowTestInterface] = useState(false);
  // Initialize session
  useEffect(() => {
    const sessionIdFromStorage = localStorage.getItem('sessionId');
    if (sessionIdFromStorage) {
      setSessionId(sessionIdFromStorage);
    } else {
      const newSessionId = generateUUID();
      setSessionId(newSessionId);
      localStorage.setItem('sessionId', newSessionId);
    }
  }, []);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch cart when sessionId changes
  useEffect(() => {
    if (sessionId) {
      fetchCart();
    }
  }, [sessionId]);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URLS.products);
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = useCallback(async () => {
    try {
      const response = await axios.get(API_URLS.cartGet, {
        headers: { 'x-session-id': sessionId },
      });
      setCart(response.data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, [sessionId]);

  const addToCart = async (productId, qty) => {
    try {
      await axios.post(
        API_URLS.cartAdd,
        { productId, quantity: qty },
        { headers: { 'x-session-id': sessionId } }
      );
      alert('Product added to cart');
      fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.post(
        API_URLS.cartRemove,
        { productId },
        { headers: { 'x-session-id': sessionId } }
      );
      fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.post(API_URLS.cartClear, {}, { headers: { 'x-session-id': sessionId } });
      fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await axios.post(API_URLS.checkout, {
        sessionId,
      });

      alert(`Order created: ${response.data.order.orderId}`);
      setShowCheckout(false);
      await clearCart();
      setOrderCreated(true);
    } catch (error) {
      console.error('Error checkout:', error);
      alert(error.response?.data?.error || 'Checkout failed');
    }
  };

  // When an order is created, re-fetch cart from Redis to reflect changes immediately
  useEffect(() => {
    if (orderCreated) {
      fetchCart();
      fetchProducts();
      setOrderCreated(false);
    }
  }, [orderCreated, fetchCart]);

  return (
    <div className="app">
      <header className="header">
        <h1>⚡ Flash Sale System</h1>
        <p className="subtitle">Space-Based Architecture (Redis + 4 PUs)</p>
          <button
            onClick={() => setShowTestInterface(!showTestInterface)}
            className="test-toggle-btn"
            title="Toggle Test Interface"
          >
            {showTestInterface ? '🔒 Hide Test' : '🧪 Show Test'}
          </button>
      </header>

        {showTestInterface && <TestInterface sessionId={sessionId} />}
      <main className="container">
        {/* Products Section */}
        <section className="products-section">
          <h2>🛍️ Products</h2>
          {loading ? (
            <p className="loading">Loading products...</p>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <h3>{product.name}</h3>
                  <p className="description">{product.description}</p>
                  <p className="price">${product.price}</p>
                  <p className={`stock ${product.stock > 0 ? 'available' : 'sold-out'}`}>
                    Stock: {product.stock}
                  </p>
                  <div className="product-actions">
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="quantity-input"
                    />
                    <button
                      onClick={() => addToCart(product.id, quantity)}
                      disabled={product.stock === 0}
                      className="btn btn-primary"
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Cart Section */}
        <section className="cart-section">
          <h2>🛒 Shopping Cart</h2>
          {cart.items && cart.items.length > 0 ? (
            <div className="cart-content">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.name}</td>
                      <td>${item.price}</td>
                      <td>{item.quantity}</td>
                      <td>${item.subtotal}</td>
                      <td>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="btn btn-danger"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="cart-summary">
                <p className="total">
                  <strong>Total: ${cart.total}</strong>
                </p>
                <button onClick={() => setShowCheckout(true)} className="btn btn-success">
                  💳 Checkout
                </button>
                <button onClick={clearCart} className="btn btn-secondary">
                  Clear Cart
                </button>
              </div>
            </div>
          ) : (
            <p className="empty-cart">Your cart is empty</p>
          )}
        </section>

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="modal">
            <div className="modal-content">
              <h2>Confirm Order</h2>
              <p className="empty-cart">No customer details are required. The order is created directly from the Redis-backed cart.</p>

              <div className="order-summary">
                <h3>Order Summary</h3>
                {cart.items && cart.items.map((item) => (
                  <p key={item.productId}>
                    {item.name} x {item.quantity} = ${item.subtotal}
                  </p>
                ))}
                <p className="total">Total: ${cart.total}</p>
              </div>

              <div className="modal-actions">
                <button onClick={handleCheckout} className="btn btn-success">
                  ✓ Confirm Order
                </button>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="btn btn-secondary"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <section className="info-section">
          <h2>ℹ️ System Architecture</h2>
          <div className="architecture-info">
            <div className="info-box">
              <h3>Processing Units</h3>
              <ul>
                <li>🟢 PU1 (Product): http://localhost:8081</li>
                <li>🟢 PU2 (Cart): http://localhost:8082</li>
                <li>🟢 PU3 (Order): http://localhost:8083</li>
                <li>🟢 PU4 (Inventory): http://localhost:8084</li>
              </ul>
            </div>
            <div className="info-box">
              <h3>Data Grid</h3>
              <ul>
                <li>📊 Redis: localhost:6379</li>
                <li>✓ Event-driven data-write / data-read workers</li>
                <li>✓ Redis cache with MariaDB fallback through workers</li>
                <li>✓ Low latency responses</li>
              </ul>
            </div>
            <div className="info-box">
              <h3>Session Info</h3>
              <ul>
                <li>ID: {sessionId?.slice(0, 8)}...</li>
                <li>Cart Items: {cart.items?.length || 0}</li>
                <li>Total: ${cart.total || 0}</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Flash Sale System | Space-Based Architecture Demo</p>
        <p>Developed with React + Node.js + Redis</p>
      </footer>
    </div>
  );
}

export default App;
