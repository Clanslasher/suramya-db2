let state = {
  products: [],
  searchQuery: "",
  selectedCategory: "",
  editingProduct: null,
  sortBy: "name"
};

// ======================
// INIT
// ======================

document.addEventListener('DOMContentLoaded', function() {
  loadFromStorage();
  render();
});

// ======================
// TOAST NOTIFICATIONS
// ======================

function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toast");
  const toastEl = document.createElement("div");
  toastEl.className = `toast ${type}`;
  
  const icon = type === "success" ? "check-circle" : "exclamation-circle";
  toastEl.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
  `;
  
  toastContainer.appendChild(toastEl);
  
  setTimeout(() => {
    toastEl.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => toastEl.remove(), 300);
  }, 3000);
}

// ======================
// HELPERS
// ======================

function saveToStorage() {
  localStorage.setItem("suramyaProducts", JSON.stringify(state.products));
}

function loadFromStorage() {
  const data = localStorage.getItem("suramyaProducts");
  if (data) {
    state.products = JSON.parse(data);
  } else {
    // Sample data for demo
    state.products = [
      { id: 1, name: "Gold Bracelet", price: 2500, stock: 15, category: "Gold Plated Jewelry" },
      { id: 2, name: "Enamel Ring", price: 800, stock: 25, category: "Enamel Bangles" },
      { id: 3, name: "Crochet Bag", price: 1200, stock: 8, category: "Crochet" },
      { id: 4, name: "Scented Candle", price: 350, stock: 40, category: "Candles" }
    ];
    saveToStorage();
  }
}

function getFilteredProducts() {
  let filtered = state.products
    .filter(p =>
      p.name.toLowerCase().includes(state.searchQuery.toLowerCase())
    )
    .filter(p =>
      state.selectedCategory
        ? p.category === state.selectedCategory
        : true
    );
  
  // Sort products
  filtered.sort((a, b) => {
    switch (state.sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "stock":
        return b.stock - a.stock;
      default:
        return a.name.localeCompare(b.name);
    }
  });
  
  return filtered;
}

function getUniqueCategories() {
  return [...new Set(state.products.map(p => p.category))].sort();
}

function getTotalStats() {
  return {
    totalProducts: state.products.length,
    totalValue: state.products.reduce((sum, p) => sum + (p.price * p.stock), 0),
    categories: getUniqueCategories().length,
    lowStock: state.products.filter(p => p.stock < 10).length
  };
}

// ======================
// CRUD
// ======================

function addOrUpdateProduct(e) {
  e.preventDefault();

  const name = e.target.name.value.trim();
  const price = parseFloat(e.target.price.value);
  const stock = parseInt(e.target.stock.value);
  const category = e.target.category.value;

  // Validation
  if (!name || !price || !stock || !category) {
    showToast("All fields are required", "error");
    return;
  }

  if (name.length < 2) {
    showToast("Product name must be at least 2 characters", "error");
    return;
  }

  if (price <= 0) {
    showToast("Price must be greater than 0", "error");
    return;
  }

  if (stock < 0) {
    showToast("Stock cannot be negative", "error");
    return;
  }

  if (state.editingProduct) {
    const product = state.products.find(p => p.id === state.editingProduct);
    product.name = name;
    product.price = price;
    product.stock = stock;
    product.category = category;
    state.editingProduct = null;
    showToast("Product updated successfully!", "success");
  } else {
    state.products.push({
      id: Date.now(),
      name,
      price,
      stock,
      category
    });
    showToast("Product added successfully!", "success");
  }

  saveToStorage();
  e.target.reset();
  render();
}

function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    state.products = state.products.filter(p => p.id !== id);
    saveToStorage();
    showToast("Product deleted successfully!", "success");
    render();
  }
}

function editProduct(id) {
  state.editingProduct = id;
  render();
  // Scroll to form
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  state.editingProduct = null;
  render();
}

// ======================
// FILTER HANDLERS
// ======================

function handleSearch(e) {
  state.searchQuery = e.target.value;
  render();
}

function handleCategoryChange(e) {
  state.selectedCategory = e.target.value;
  render();
}

function handleSort(e) {
  state.sortBy = e.target.value;
  render();
}

// ======================
// RENDER
// ======================

function render() {
  const app = document.getElementById("app");
              const filtered = getFilteredProducts();
  const stats = getTotalStats();
  const product = state.editingProduct ? state.products.find(p => p.id === state.editingProduct) : null;

  app.innerHTML = `
    <div class="container">
      <div class="dashboard-header">
        <div>
          <h1><i class="fas fa-chart-line"></i> Suramya Dashboard</h1>
          <p style="color: #7f8c8d; margin: 5px 0 0 0;">Manage your products efficiently</p>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat-card">
          <i class="fas fa-box" style="font-size: 2rem; color: #667eea;"></i>
          <div class="stat-value">${stats.totalProducts}</div>
          <div class="stat-label">Total Products</div>
        </div>
        <div class="stat-card">
          <i class="fas fa-rupee-sign" style="font-size: 2rem; color: #3498db;"></i>
          <div class="stat-value">₹${stats.totalValue.toLocaleString()}</div>
          <div class="stat-label">Total Inventory Value</div>
        </div>
        <div class="stat-card">
          <i class="fas fa-list" style="font-size: 2rem; color: #9b59b6;"></i>
          <div class="stat-value">${stats.categories}</div>
          <div class="stat-label">Categories</div>
        </div>
        <div class="stat-card ">
          <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #e74c3c;"></i>
          <div class="stat-value">${stats.lowStock}</div>
          <div class="stat-label">Low Stock Items</div>
        </div>
      </div>

      <!-- Form Section -->
      <div class="form-section">
        <div class="card">
          <div class="card-header">
            <h2>
              <i class="fas fa-${state.editingProduct ? "edit" : "plus-circle"}"></i>
              ${state.editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
          </div>
          <form onsubmit="addOrUpdateProduct(event)">
            <div class="form-group">
              <input 
                name="name" 
                placeholder="Product Name" 
                value="${product ? product.name : ""}" 
                required 
              />
              <input 
                name="price" 
                type="number" 
                step="0.01"
                placeholder="Price (₹)" 
                value="${product ? product.price : ""}" 
                required 
              />
              <input 
                name="stock" 
                type="number" 
                placeholder="Stock Quantity" 
                value="${product ? product.stock : ""}" 
                required 
              />
              <select name="category" required>
                <option value="">Select Category</option>
                <option ${product && product.category === 'Enamel Bangles' ? 'selected' : ''}>Enamel Bangles</option>
                <option ${product && product.category === 'Gold Plated Jewelry' ? 'selected' : ''}>Gold Plated Jewelry</option>
                <option ${product && product.category === 'Crochet' ? 'selected' : ''}>Crochet</option>
                <option ${product && product.category === 'Candles' ? 'selected' : ''}>Candles</option>
                <option ${product && product.category === 'Bags' ? 'selected' : ''}>Bags</option>
              </select>
            </div>
            <div style="display: flex; gap: 10px;">
              <button type="submit" class="primary">
                <i class="fas fa-${state.editingProduct ? "save" : "plus"}"></i>
                ${state.editingProduct ? "Update Product" : "Add Product"}
              </button>
              ${state.editingProduct ? `<button type="button" class="danger" onclick="cancelEdit()" style="background: #95a5a6;"><i class="fas fa-times"></i> Cancel</button>` : ""}
            </div>
          </form>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="card">
        <div class="card-header">
          <h2><i class="fas fa-filter"></i> Search & Filter</h2>
        </div>
        <div class="filters-section">
          <div>
            <label for="search">Search Products</label>
            <input 
              id="search"
              placeholder="Search by product name..."
              value="${state.searchQuery}"
              oninput="handleSearch(event)"
            />
          </div>
          <div>
            <label for="category">Category</label>
            <select id="category" onchange="handleCategoryChange(event)">
              <option value="">All Categories</option>
              ${getUniqueCategories()
                .map(cat => `
                  <option value="${cat}" ${state.selectedCategory === cat ? "selected" : ""}>
                    ${cat}
                  </option>
                `)
                .join("")}
            </select>
          </div>
          <div>
            <label for="sort">Sort By</label>
            <select id="sort" onchange="handleSort(event)">
              <option value="name" ${state.sortBy === "name" ? "selected" : ""}>Name (A-Z)</option>
              <option value="price-asc" ${state.sortBy === "price-asc" ? "selected" : ""}>Price (Low to High)</option>
              <option value="price-desc" ${state.sortBy === "price-desc" ? "selected" : ""}>Price (High to Low)</option>
              <option value="stock" ${state.sortBy === "stock" ? "selected" : ""}>Stock (Highest First)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Products Section -->
      ${filtered.length > 0 ? `
        <div class="card">
          <div class="card-header">
            <h2><i class="fas fa-th"></i> Products (${filtered.length})</h2>
          </div>
          <div class="products-grid">
            ${filtered.map(p => `
              <div class="product-card">
                <div class="product-header">
                  <h3>${escapeHtml(p.name)}</h3>
                  <span class="category">${p.category}</span>
                </div>
                <div class="product-body">
                  <div class="price-stock">
                    <div class="price-item">
                      <label>Price</label>
                      <value>₹${p.price.toFixed(2)}</value>
                    </div>
                    <div class="stock-item">
                      <label>Stock</label>
                      <value class="${p.stock < 10 ? 'low' : ''}">${p.stock}</value>
                    </div>
                  </div>
                  <div class="product-actions">
                    <button class="edit" onclick="editProduct(${p.id})">
                      <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="danger" onclick="deleteProduct(${p.id})">
                      <i class="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      ` : `
        <div class="card" style="text-align: center; padding: 60px 20px;">
          <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p style="font-size: 1.2rem; color: #2c3e50; margin-top: 20px;">No products found</p>
            <p style="color: #7f8c8d;">Try adjusting your filters or add a new product</p>
          </div>
        </div>
      `}
    </div>
  `;
}

// ======================
// UTILITY FUNCTIONS
// ======================

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
