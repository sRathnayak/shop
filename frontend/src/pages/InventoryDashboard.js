import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './InventoryDashboard.css';

const INIT_PRODUCT = {
  name: '', description: '', price: '', category: 'Men',
  stock: '', sizes: '', colors: '', featured: false,
};

const NAV_ITEMS = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'products', label: '👕 Products' },
  { key: 'lowstock', label: '⚠️ Low Stock' },
];

const stockBadge = (stock) => {
  if (!stock || stock === 0) return <span className="inv-badge-out">Out of Stock</span>;
  if (stock < 5) return <span className="inv-badge-low">Low ({stock})</span>;
  return <span className="inv-badge-ok">In Stock ({stock})</span>;
};

export default function InventoryDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState(INIT_PRODUCT);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockEdits, setStockEdits] = useState({});

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    try {
      if (tab === 'overview' || tab === 'lowstock') {
        const r = await axios.get('/api/inventory/stats');
        setStats(r.data);
      }
      if (tab === 'products' || tab === 'lowstock') {
        const r = await axios.get('/api/products');
        setProducts(r.data);
      }
    } catch {}
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const data = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      sizes: productForm.sizes ? productForm.sizes.split(',').map(s => s.trim()) : [],
      colors: productForm.colors ? productForm.colors.split(',').map(c => c.trim()) : [],
    };
    try {
      if (editId) {
        await axios.put(`/api/products/${editId}`, data);
        flash('Product updated!');
      } else {
        await axios.post('/api/products', data);
        flash('Product added!');
      }
      setProductForm(INIT_PRODUCT);
      setEditId(null);
      loadData();
    } catch {
      flash('Save failed');
    }
  };

  const handleEdit = (p) => {
    setProductForm({
      ...p,
      sizes: p.sizes?.join(', ') || '',
      colors: p.colors?.join(', ') || '',
    });
    setEditId(p._id);
    setTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await axios.delete(`/api/products/${id}`);
    flash('Product deleted');
    loadData();
  };

  const handleQuickStock = async (id) => {
    const newStock = Number(stockEdits[id]);
    if (isNaN(newStock) || newStock < 0) return flash('Enter a valid stock number');
    try {
      await axios.put(`/api/products/${id}`, { stock: newStock });
      flash('Stock updated!');
      setStockEdits({ ...stockEdits, [id]: '' });
      loadData();
    } catch {
      flash('Update failed');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const filteredProducts = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const lowStockProducts = products
    .filter(p => !p.stock || p.stock < 5)
    .sort((a, b) => (a.stock || 0) - (b.stock || 0));

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo inv-sidebar-logo">
          ✦ StyleArc <small>Inventory</small>
        </div>
        <nav>
          {NAV_ITEMS.map(n => (
            <button
              key={n.key}
              className={`admin-nav-item ${tab === n.key ? 'active' : ''}`}
              onClick={() => setTab(n.key)}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <span>👤 {user?.name}</span>
          <button onClick={handleLogout} className="admin-logout">Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        {msg && <div className="alert alert-success admin-flash">{msg}</div>}

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div>
            <h1>Inventory Dashboard</h1>
            <div className="stats-grid">
              {[
                { label: 'Total Products', value: stats.totalProducts, icon: '👕', cls: 'inv-stat-total' },
                { label: 'Total Stock Units', value: stats.totalStock.toLocaleString(), icon: '📦', cls: 'inv-stat-total' },
                { label: 'Low Stock Items', value: stats.lowStockCount, icon: '⚠️', cls: 'inv-stat-low' },
                { label: 'Out of Stock', value: stats.outOfStockCount, icon: '🚫', cls: 'inv-stat-out' },
              ].map(s => (
                <div key={s.label} className={`stat-card ${s.cls}`}>
                  <span className="stat-icon">{s.icon}</span>
                  <div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="stat-card inv-stat-ok">
                <span className="stat-icon">✅</span>
                <div>
                  <div className="stat-value">{stats.inStockCount}</div>
                  <div className="stat-label">Well Stocked (5+ units)</div>
                </div>
              </div>
              <div className="stat-card inv-stat-total">
                <span className="stat-icon">💰</span>
                <div>
                  <div className="stat-value">LKR {stats.stockValue.toLocaleString()}</div>
                  <div className="stat-label">Total Stock Value</div>
                </div>
              </div>
            </div>

            <h2>Stock by Category</h2>
            <div className="inv-category-grid">
              {stats.byCategory.map(c => (
                <div key={c.category} className="inv-category-card">
                  <h3>{c.category}</h3>
                  <div className="inv-cat-count">{c.count}</div>
                  <div className="inv-cat-stock">{c.stock} units in stock</div>
                </div>
              ))}
            </div>

            {stats.lowStock.length > 0 && (
              <>
                <h2>Low Stock Alerts</h2>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Product</th><th>Category</th><th>Stock</th><th>Price</th></tr>
                    </thead>
                    <tbody>
                      {stats.lowStock.map(p => (
                        <tr key={p._id}>
                          <td>{p.name}</td>
                          <td>{p.category}</td>
                          <td>{stockBadge(p.stock)}</td>
                          <td>LKR {p.price.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div>
            <h1>{editId ? 'Edit Product' : 'Manage Products'}</h1>
            <form className="admin-product-form" onSubmit={handleSaveProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                    {['Men', 'Women', 'Kids', 'Accessories'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows={3} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (LKR)</label>
                  <input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Sizes (comma-separated)</label>
                  <input value={productForm.sizes} onChange={e => setProductForm({ ...productForm, sizes: e.target.value })} placeholder="XS, S, M, L, XL" />
                </div>
                <div className="form-group">
                  <label>Colors (comma-separated)</label>
                  <input value={productForm.colors} onChange={e => setProductForm({ ...productForm, colors: e.target.value })} placeholder="Red, Blue, Black" />
                </div>
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={productForm.featured} onChange={e => setProductForm({ ...productForm, featured: e.target.checked })} />
                Featured product
              </label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary">{editId ? 'Update Product' : 'Add Product'}</button>
                {editId && (
                  <button type="button" className="btn btn-outline" onClick={() => { setProductForm(INIT_PRODUCT); setEditId(null); }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h2 style={{ margin: '36px 0 16px' }}>All Products ({filteredProducts.length})</h2>
            <div className="inv-filter-bar">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {['Men', 'Women', 'Kids', 'Accessories'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>LKR {p.price.toLocaleString()}</td>
                      <td>{p.stock}</td>
                      <td>{stockBadge(p.stock)}</td>
                      <td>
                        <button className="tbl-btn edit" onClick={() => handleEdit(p)}>Edit</button>
                        <button className="tbl-btn del" onClick={() => handleDelete(p._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Low Stock */}
        {tab === 'lowstock' && (
          <div>
            <h1>Low Stock Management</h1>
            <p style={{ color: 'var(--mid)', marginBottom: '24px' }}>
              Products with fewer than 5 units or out of stock. Update stock levels directly.
            </p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Current Stock</th><th>Status</th><th>Update Stock</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {lowStockProducts.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--mid)' }}>All products are well stocked!</td></tr>
                  ) : lowStockProducts.map(p => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td><strong>{p.stock || 0}</strong></td>
                      <td>{stockBadge(p.stock)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="number"
                            className="inv-stock-input"
                            placeholder={p.stock}
                            value={stockEdits[p._id] ?? ''}
                            onChange={e => setStockEdits({ ...stockEdits, [p._id]: e.target.value })}
                            min="0"
                          />
                          <button className="tbl-btn edit" onClick={() => handleQuickStock(p._id)}>Save</button>
                        </div>
                      </td>
                      <td>
                        <button className="tbl-btn edit" onClick={() => handleEdit(p)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
