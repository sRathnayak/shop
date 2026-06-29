import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">✦ StyleArc</div>
          <p>Premium clothing for the modern wardrobe. Crafted with care, delivered with love.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Shop</h4>
            <Link to="/products?category=Men">Men</Link>
            <Link to="/products?category=Women">Women</Link>
            <Link to="/products?category=Kids">Kids</Link>
            <Link to="/products?category=Accessories">Accessories</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
            <Link to="/admin/login">Staff Portal</Link>
            <Link to="/profile">My Orders</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <span>support@stylearc.com</span>
            <span>+94 77 123 4567</span>
            <span>Kandy, Sri Lanka</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} StyleArc. All rights reserved.</p>
      </div>
    </footer>
  );
}
