import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('orders');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ name: user?.name || '', phone: '', address: { street: '', city: '', state: '', zip: '' } });

  useEffect(() => {
    axios.get('/api/orders/my').then(r => setOrders(r.data)).catch(() => {});
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/auth/profile', form);
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 2500);
    } catch { setMsg('Update failed'); }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="profile-tabs">
          <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>My Orders</button>
          <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Edit Profile</button>
        </div>

        {tab === 'orders' && (
          <div className="orders-section">
            {orders.length === 0 ? (
              <div className="empty-orders">
                <div style={{fontSize:'48px'}}>📦</div>
                <h3>No orders yet</h3>
                <p>Your orders will appear here after checkout.</p>
              </div>
            ) : orders.map(o => (
              <div key={o._id} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-id">#{o._id.slice(-8).toUpperCase()}</span>
                    <span className={`badge badge-${o.status}`}>{o.status}</span>
                  </div>
                  <span className="order-date">{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="order-items">
                  {o.items.map((item, i) => (
                    <span key={i}>{item.name} × {item.quantity}</span>
                  ))}
                </div>
                <div className="order-footer">
                  <span>Total: <strong>LKR {o.total.toLocaleString()}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'profile' && (
          <form className="profile-form" onSubmit={handleUpdate}>
            {msg && <div className="alert alert-success">{msg}</div>}
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+94 77 xxx xxxx" />
            </div>
            <h4>Shipping Address</h4>
            <div className="address-grid">
              <div className="form-group"><label>Street</label><input value={form.address.street} onChange={e => setForm({...form, address:{...form.address, street:e.target.value}})} /></div>
              <div className="form-group"><label>City</label><input value={form.address.city} onChange={e => setForm({...form, address:{...form.address, city:e.target.value}})} /></div>
              <div className="form-group"><label>State</label><input value={form.address.state} onChange={e => setForm({...form, address:{...form.address, state:e.target.value}})} /></div>
              <div className="form-group"><label>ZIP</label><input value={form.address.zip} onChange={e => setForm({...form, address:{...form.address, zip:e.target.value}})} /></div>
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        )}
      </div>
    </div>
  );
}
