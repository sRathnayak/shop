import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const INIT_PRODUCT = { name: '', description: '', price: '', category: 'Men', stock: '', sizes: '', colors: '', featured: false };

const ALL_NAV_ITEMS = [
  { key: 'overview', label: '📊 Overview', roles: ['admin'] },
  { key: 'products', label: '👕 Products', roles: ['admin'] },
  { key: 'orders', label: '📦 Orders', roles: ['admin', 'staff'] },
  { key: 'users', label: '👥 Customers', roles: ['admin'] },
];

const DEFAULT_TAB = {
  admin: 'overview',
  staff: 'orders',
};

const PORTAL_TITLE = {
  admin: 'Admin',
  staff: 'Staff',
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = ALL_NAV_ITEMS.filter(n => n.roles.includes(user?.role || 'admin'));
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (user?.role) setTab(DEFAULT_TAB[user.role] || 'overview');
  }, [user?.role]);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState(INIT_PRODUCT);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  useEffect(() => { loadTab(tab); }, [tab]);

  const loadTab = async (t) => {
    try {
      if (t === 'overview') { const r = await axios.get('/api/admin/stats'); setStats(r.data); }
      if (t === 'products') { const r = await axios.get('/api/products'); setProducts(r.data); }
      if (t === 'users') { const r = await axios.get('/api/admin/users'); setUsers(r.data); }
      if (t === 'orders') { const r = await axios.get('/api/admin/orders'); setOrders(r.data); }
    } catch {}
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const data = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      sizes: productForm.sizes ? productForm.sizes.split(',').map(s => s.trim()) : [],
      colors: productForm.colors ? productForm.colors.split(',').map(c => c.trim()) : []
    };
    try {
      if (editId) { await axios.put(`/api/products/${editId}`, data); flash('Product updated!'); }
      else { await axios.post('/api/products', data); flash('Product added!'); }
      setProductForm(INIT_PRODUCT); setEditId(null);
      loadTab('products');
    } catch { flash('Save failed'); }
  };

  const handleEdit = (p) => {
    setProductForm({ ...p, sizes: p.sizes?.join(', ') || '', colors: p.colors?.join(', ') || '' });
    setEditId(p._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await axios.delete(`/api/products/${id}`);
    flash('Deleted'); loadTab('products');
  };

  const handleOrderStatus = async (id, status) => {
    await axios.put(`/api/admin/orders/${id}`, { status });
    loadTab('orders');
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const portalLabel = PORTAL_TITLE[user?.role] || 'Admin';

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">✦ StyleArc <small>{portalLabel}</small></div>
        <nav>
          {navItems.map(n => (
            <button key={n.key} className={`admin-nav-item ${tab === n.key ? 'active' : ''}`} onClick={() => setTab(n.key)}>{n.label}</button>
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
            <h1>Admin Dashboard</h1>
            <div className="stats-grid">
              {[
                { label: 'Total Revenue', value: `LKR ${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: '#f6d860' },
                { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: '#aed6f1' },
                { label: 'Products', value: stats.totalProducts, icon: '👕', color: '#a9dfbf' },
                { label: 'Customers', value: stats.totalUsers, icon: '👥', color: '#f9c3c0' }
              ].map(s => (
                <div key={s.label} className="stat-card" style={{borderLeftColor: s.color}}>
                  <span className="stat-icon">{s.icon}</span>
                  <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
                </div>
              ))}
            </div>
            <h2>Recent Orders</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {stats.recentOrders.map(o => (
                    <tr key={o._id}>
                      <td>#{o._id.slice(-8).toUpperCase()}</td>
                      <td>{o.customer?.name || 'N/A'}</td>
                      <td>LKR {o.total.toLocaleString()}</td>
                      <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div>
            <h1>{editId ? 'Edit Product' : 'Add New Product'}</h1>
            <form className="admin-product-form" onSubmit={handleSaveProduct}>
              <div className="form-row">
                <div className="form-group"><label>Product Name</label><input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required /></div>
                <div className="form-group"><label>Category</label>
                  <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                    {['Men','Women','Kids','Accessories'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Description</label><textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={3} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Price (LKR)</label><input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required /></div>
                <div className="form-group"><label>Stock</label><input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Sizes (comma-separated)</label><input value={productForm.sizes} onChange={e => setProductForm({...productForm, sizes: e.target.value})} placeholder="XS, S, M, L, XL" /></div>
                <div className="form-group"><label>Colors (comma-separated)</label><input value={productForm.colors} onChange={e => setProductForm({...productForm, colors: e.target.value})} placeholder="Red, Blue, Black" /></div>
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={productForm.featured} onChange={e => setProductForm({...productForm, featured: e.target.checked})} />
                Featured product
              </label>
              <div style={{display:'flex', gap:'12px', marginTop:'16px'}}>
                <button type="submit" className="btn btn-primary">{editId ? 'Update Product' : 'Add Product'}</button>
                {editId && <button type="button" className="btn btn-outline" onClick={() => { setProductForm(INIT_PRODUCT); setEditId(null); }}>Cancel</button>}
              </div>
            </form>

            <h2 style={{margin:'36px 0 20px'}}>All Products ({products.length})</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>LKR {p.price.toLocaleString()}</td>
                      <td><span style={{color: p.stock < 5 ? 'var(--error)' : 'inherit'}}>{p.stock}</span></td>
                      <td>{p.featured ? '⭐' : '—'}</td>
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

        {/* Orders */}
        {tab === 'orders' && (
          <div>
            <h1>All Orders ({orders.length})</h1>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td>#{o._id.slice(-8).toUpperCase()}</td>
                      <td>{o.customer?.name || 'N/A'}<br/><small style={{color:'var(--mid)'}}>{o.customer?.email}</small></td>
                      <td>{o.items?.length} items</td>
                      <td>LKR {o.total.toLocaleString()}</td>
                      <td>
                        <select className="status-select" value={o.status} onChange={e => handleOrderStatus(o._id, e.target.value)}>
                          {['pending','processing','shipped','delivered','cancelled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            <h1>Customers ({users.length})</h1>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
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
