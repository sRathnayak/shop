const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, adminOnly, hasRole } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, orders] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find()
    ]);
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const recentOrders = await Order.find().populate('customer', 'name email').sort({ createdAt: -1 }).limit(5);
    res.json({ totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// All users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// All orders
router.get('/orders', protect, hasRole('admin', 'staff'), async (req, res) => {
  try {
    const orders = await Order.find().populate('customer', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update order status
router.put('/orders/:id', protect, hasRole('admin', 'staff'), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
