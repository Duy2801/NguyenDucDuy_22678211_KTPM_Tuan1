// ============================================
// API Configuration
// ============================================
const API_URL = 'http://localhost:3000/products';

// ============================================
// DOM Elements
// ============================================
const productForm = document.getElementById('productForm');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productId = document.getElementById('productId');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const productsList = document.getElementById('productsList');
const emptyState = document.getElementById('emptyState');
const loadingSkeleton = document.getElementById('loadingSkeleton');
const totalProductsEl = document.getElementById('totalProducts');

// Edit Modal Elements
const editModal = document.getElementById('editModal');
const editName = document.getElementById('editName');
const editPrice = document.getElementById('editPrice');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');

let currentEditId = null;

// ============================================
// Notification System
// ============================================
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    notification.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-bounce`;
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.getElementById('notification').appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('animate-bounce');
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ============================================
// Fetch Products
// ============================================
async function fetchProducts() {
    try {
        loadingSkeleton.classList.remove('hidden');
        productsList.classList.add('hidden');
        emptyState.classList.add('hidden');
        
        const response = await fetch(API_URL);
        const products = await response.json();
        
        loadingSkeleton.classList.add('hidden');
        
        if (!products || products.length === 0) {
            emptyState.classList.remove('hidden');
            totalProductsEl.textContent = '0';
        } else {
            renderProducts(products);
            totalProductsEl.textContent = products.length;
        }
    } catch (error) {
        loadingSkeleton.classList.add('hidden');
        showNotification('Failed to fetch products', 'error');
    }
}

// ============================================
// Render Products
// ============================================
function renderProducts(products) {
    productsList.innerHTML = '';
    productsList.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'p-6 hover:bg-gray-50 transition flex justify-between items-start group';
        productCard.innerHTML = `
            <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition">
                    ${escapeHtml(product.name)}
                </h3>
                <div class="flex items-center gap-2 mt-2">
                    <span class="text-2xl font-bold text-green-600">
                        ₫${formatPrice(product.price)}
                    </span>
                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        ID: ${product.id}
                    </span>
                </div>
            </div>
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button 
                    onclick="editProduct(${product.id}, '${escapeHtml(product.name)}', ${product.price})"
                    class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button 
                    onclick="deleteProduct(${product.id})"
                    class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        `;
        productsList.appendChild(productCard);
    });
}

// ============================================
// Format Price
// ============================================
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

// ============================================
// Escape HTML
// ============================================
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// Add/Update Product
// ============================================
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = productName.value.trim();
    const price = parseFloat(productPrice.value);
    const id = productId.value;
    
    if (!name || !price) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50');
        
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, price })
        });
        
        if (!response.ok) throw new Error('Failed to save product');
        
        const result = await response.json();
        
        showNotification(
            id ? 'Product updated successfully!' : 'Product added successfully!',
            'success'
        );
        
        // Reset form
        productForm.reset();
        productId.value = '';
        submitBtn.textContent = 'Add Product';
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Add Product';
        
        // Refresh products
        setTimeout(fetchProducts, 500);
    } catch (error) {
        showNotification('Failed to save product', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50');
    }
});

// ============================================
// Edit Product
// ============================================
function editProduct(id, name, price) {
    currentEditId = id;
    editName.value = name;
    editPrice.value = price;
    editModal.classList.remove('hidden');
}

// ============================================
// Save Edit
// ============================================
saveEditBtn.addEventListener('click', async () => {
    const name = editName.value.trim();
    const price = parseFloat(editPrice.value);
    
    if (!name || !price) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        saveEditBtn.disabled = true;
        
        const response = await fetch(`${API_URL}/${currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, price })
        });
        
        if (!response.ok) throw new Error('Failed to update product');
        
        showNotification('Product updated successfully!', 'success');
        editModal.classList.add('hidden');
        
        setTimeout(fetchProducts, 500);
    } catch (error) {
        showNotification('Failed to update product', 'error');
    } finally {
        saveEditBtn.disabled = false;
    }
});

// ============================================
// Cancel Edit
// ============================================
cancelEditBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
});

// ============================================
// Delete Product
// ============================================
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete product');
        
        showNotification('Product deleted successfully!', 'success');
        
        setTimeout(fetchProducts, 500);
    } catch (error) {
        showNotification('Failed to delete product', 'error');
    }
}

// ============================================
// Reset Form
// ============================================
resetBtn.addEventListener('click', () => {
    productForm.reset();
    productId.value = '';
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Add Product';
});

// ============================================
// Auto-refresh Products
// ============================================
setInterval(fetchProducts, 5000);

// ============================================
// Initial Load
// ============================================
fetchProducts();
