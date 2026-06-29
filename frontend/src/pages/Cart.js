import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const catIcon = { Men: '👔', Women: '👗', Kids: '🧒', Accessories: '👜' };

export default function Cart() {
  const { cart, removeFromCart, updateQty, total, clearCart } = useCart();
  const { user } = useAuth();

  if (cart.length === 0) return (
    <div className="cart-empty">
      <div style={{fontSize:'64px'}}>🛍️</div>
      <h2>Your cart is empty</h2>
      <p>Add some items and come back!</p>
      <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart <span>({cart.length} item{cart.length !== 1 ? 's' : ''})</span></h1>
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item, i) => (
              <div key={i} className="cart-item">
                <div className="cart-item-img">{catIcon[item.category] || '👕'}</div>
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>Size: {item.size} · Color: {item.color}</p>
                  <p className="cart-item-price">LKR {item.price.toLocaleString()}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button onClick={() => updateQty(item._id, item.size, item.color, Math.max(1, item.quantity - 1))}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, item.size, item.color, item.quantity + 1)}>+</button>
                  </div>
                  <div className="cart-item-total">LKR {(item.price * item.quantity).toLocaleString()}</div>
                  <button className="remove-btn" onClick={() => removeFromCart(item._id, item.size, item.color)}>✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row"><span>Subtotal</span><span>LKR {total.toLocaleString()}</span></div>
            <div className="summary-row"><span>Delivery</span><span>{total >= 3500 ? <span style={{color:'var(--success)'}}>Free</span> : 'LKR 350'}</span></div>
            <div className="summary-row total"><span>Total</span><span>LKR {(total + (total >= 3500 ? 0 : 350)).toLocaleString()}</span></div>
            {total < 3500 && <p className="free-delivery-note">Add LKR {(3500 - total).toLocaleString()} more for free delivery!</p>}
            {user ? (
              <button className="btn btn-primary" style={{width:'100%', marginTop:'20px'}}>Place Order (COD)</button>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{width:'100%', marginTop:'20px', display:'block', textAlign:'center'}}>Sign In to Checkout</Link>
            )}
            <button className="btn btn-outline btn-sm" style={{width:'100%', marginTop:'12px'}} onClick={clearCart}>Clear Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
