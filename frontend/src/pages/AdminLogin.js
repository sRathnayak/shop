import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHomeForRole, STAFF_ROLES } from '../utils/auth';
import './AdminLogin.css';

const PORTAL_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
  { value: 'inventory_manager', label: 'Inventory Manager' },
];

const ROLE_DESC = {
  admin: 'Full access — overview, products, orders & customers',
  staff: 'Manage customer orders and delivery status',
  inventory_manager: 'Manage products, stock & inventory',
};

const ROLE_LABEL = {
  admin: 'Admin',
  staff: 'Staff',
  inventory_manager: 'Inventory Manager',
};

const VALID_ROLES = ['admin', 'staff', 'inventory_manager'];

export default function AdminLogin() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const initialRole = VALID_ROLES.includes(searchParams.get('role')) ? searchParams.get('role') : 'admin';

  const [tab, setTab] = useState(initialTab);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: initialRole,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login, register, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && STAFF_ROLES.includes(user.role)) {
      navigate(getHomeForRole(user.role), { replace: true });
    }
  }, [user, navigate]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedIn = await login(form.email, form.password);
      if (!STAFF_ROLES.includes(loggedIn.role)) {
        logout();
        setError('This is a customer account. Please use the customer sign in page.');
        return;
      }
      navigate(getHomeForRole(loggedIn.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const newUser = await register(form.name, form.email, form.password, form.role);
      if (!STAFF_ROLES.includes(newUser.role)) {
        logout();
        setError('Account created but role was not set correctly. Please try again.');
        return;
      }
      navigate(getHomeForRole(newUser.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-logo">
          <span>⚙️</span>
          <h2>Staff & Admin Portal</h2>
          <p>{ROLE_DESC[form.role]}</p>
        </div>

        <div className="admin-tabs">
          <button
            type="button"
            className={tab === 'login' ? 'active' : ''}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={tab === 'register' ? 'active' : ''}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label>Account Type</label>
          <select value={form.role} onChange={set('role')} required>
            {PORTAL_ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Signing In...' : `Sign In as ${ROLE_LABEL[form.role]}`}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Min. 6 characters"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={form.confirm}
                onChange={set('confirm')}
                placeholder="Repeat password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating Account...' : `Create ${ROLE_LABEL[form.role]} Account`}
            </button>
          </form>
        )}

        {tab === 'login' && (
          <div className="admin-hint">
            <small>Default admin: admin@clothshop.com / admin123</small>
          </div>
        )}

        <div className="admin-auth-link">
          <Link to="/login">← Customer sign in</Link>
        </div>
      </div>
    </div>
  );
}
