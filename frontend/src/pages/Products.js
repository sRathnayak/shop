import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import './Products.css';

const categories = ['All', 'Men', 'Women', 'Kids', 'Accessories'];
const catIcon = { Men: '👔', Women: '👗', Kids: '🧒', Accessories: '👜' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [added, setAdded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory !== 'All') params.category = activeCategory;
    if (search) params.search = search;
    axios.get('/api/products', { params })
      .then(r => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    if (cat !== 'All') setSearchParams({ category: cat });
    else setSearchParams({});
  };

  const handleAddToCart = () => {
    if (!selected) return;
    addToCart(selected, size || 'M', color || 'Default', qty);
    setAdded(true);
    setTimeout(() => { setAdded(false); setSelected(null); }, 1500);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="container">
          <h1>Shop All</h1>
          <div className="products-controls">
            <div className="cat-tabs">
              {categories.map(c => (
                <button key={c} className={`cat-tab ${activeCategory === c ? 'active' : ''}`} onClick={() => handleCategory(c)}>{c}</button>
              ))}
            </div>
            <input className="search-input" type="text" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div style={{textAlign:'center',padding:'80px 0'}}><div className="spinner" style={{margin:'0 auto'}}></div></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div style={{fontSize:'60px'}}>🛍️</div>
            <h3>No products found</h3>
            <p>Try a different category or search term</p>
          </div>
        ) : (
          <div className="products-grid-page">
            {products.map(p => (
              <div key={p._id} className="product-card" onClick={() => { setSelected(p); setSize(''); setColor(''); setQty(1); setAdded(false); }}>
                <div className="product-card-img-placeholder">{catIcon[p.category] || '👕'}</div>
                {p.featured && <span className="featured-tag">Featured</span>}
                <div className="product-card-body">
                  <div className="category">{p.category}</div>
                  <h3>{p.name}</h3>
                  <div className="price-row">
                    <span className="price">LKR {p.price.toLocaleString()}</span>
                    {p.stock <= 5 && p.stock > 0 && <span className="low-stock">Only {p.stock} left</span>}
                    {p.stock === 0 && <span className="out-stock">Out of stock</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <div className="modal-img">{catIcon[selected.category] || '👕'}</div>
            <div className="modal-body">
              <div className="modal-cat">{selected.category}</div>
              <h2>{selected.name}</h2>
              <p className="modal-desc">{selected.description}</p>
              <div className="modal-price">LKR {selected.price.toLocaleString()}</div>

              {selected.sizes?.length > 0 && (
                <div className="modal-options">
                  <label>Size</label>
                  <div className="size-grid">
                    {selected.sizes.map(s => (
                      <button key={s} className={`size-btn ${size === s ? 'active' : ''}`} onClick={() => setSize(s)}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {selected.colors?.length > 0 && (
                <div className="modal-options">
                  <label>Color</label>
                  <div className="color-grid">
                    {selected.colors.map(c => (
                      <button key={c} className={`color-btn ${color === c ? 'active' : ''}`} onClick={() => setColor(c)}>{c}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-qty">
                <label>Qty</label>
                <div className="qty-control">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}>+</button>
                </div>
              </div>

              <button className="btn btn-primary" style={{width:'100%'}} onClick={handleAddToCart} disabled={selected.stock === 0}>
                {added ? '✓ Added to Cart!' : selected.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
