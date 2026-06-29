const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, hasRole } = require('../middleware/auth');

router.get('/stats', protect, hasRole('admin', 'inventory_manager'), async (req, res) => {
  try {
    const products = await Product.find();
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const stockValue = products.reduce((sum, p) => sum + (p.stock || 0) * p.price, 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 5);
    const outOfStock = products.filter(p => !p.stock || p.stock === 0);
    const inStock = products.filter(p => p.stock >= 5);

    const byCategory = ['Men', 'Women', 'Kids', 'Accessories'].map(cat => ({
      category: cat,
      count: products.filter(p => p.category === cat).length,
      stock: products.filter(p => p.category === cat).reduce((s, p) => s + (p.stock || 0), 0),
    }));

    res.json({
      totalProducts,
      totalStock,
      stockValue,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      inStockCount: inStock.length,
      lowStock: lowStock.sort((a, b) => a.stock - b.stock).slice(0, 10),
      byCategory,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
