import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, size, color, qty = 1) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === product._id && i.size === size && i.color === color);
      if (exists) return prev.map(i => i._id === product._id && i.size === size && i.color === color ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { ...product, size, color, quantity: qty }];
    });
  };

  const removeFromCart = (id, size, color) => setCart(prev => prev.filter(i => !(i._id === id && i.size === size && i.color === color)));

  const updateQty = (id, size, color, qty) => setCart(prev => prev.map(i => i._id === id && i.size === size && i.color === color ? { ...i, quantity: qty } : i));

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
