import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const categories = [
  { name: 'Men', icon: '👔', desc: 'Shirts, trousers & suits' },
  { name: 'Women', icon: '👗', desc: 'Dresses, tops & more' },
  { name: 'Kids', icon: '🧒', desc: 'Comfortable & fun' },
  { name: 'Accessories', icon: '👜', desc: 'Bags, belts & watches' }
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/products?featured=true').then(r => setFeatured(r.data.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">New Collection 2024</div>
          <h1>Wear Your<br /><span className="hero-accent">Story.</span></h1>
          <p>Curated fashion for every moment — from morning coffee to evening soirées.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
            <Link to="/products?category=Women" className="btn btn-outline">Women's Edit</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-shape">
            <div className="hero-cloth-icon">🧥</div>
            <div className="hero-badge">
              <span>✦</span>
              <span>Premium Quality</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Find exactly what you're looking for</p>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <div key={cat.name} className="category-card" onClick={() => navigate(`/products?category=${cat.name}`)}>
                <div className="cat-icon">{cat.icon}</div>
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
                <span className="cat-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2>Featured Picks</h2>
              <Link to="/products" className="see-all">See all →</Link>
            </div>
            <div className="products-grid">
              {featured.map(p => (
                <div key={p._id} className="product-card">
                  <div className="product-card-img-placeholder">{p.category === 'Men' ? '👔' : p.category === 'Women' ? '👗' : p.category === 'Kids' ? '🧒' : '👜'}</div>
                  <div className="product-card-body">
                    <div className="category">{p.category}</div>
                    <h3>{p.name}</h3>
                    <div className="price">LKR {p.price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="container">
          <div className="promo-content">
            <h2>Free Delivery on Orders Over LKR 3,500</h2>
            <p>Shop more, save more. Islandwide delivery in Sri Lanka.</p>
            <Link to="/products" className="btn btn-gold">Start Shopping</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {[
              { icon: '🚚', title: 'Fast Delivery', desc: '2–5 days islandwide' },
              { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
              { icon: '🔒', title: 'Secure Payment', desc: 'Your data is safe' },
              { icon: '🎁', title: 'Gift Wrapping', desc: 'Free on request' }
            ].map(f => (
              <div key={f.title} className="feature-item">
                <div className="feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
