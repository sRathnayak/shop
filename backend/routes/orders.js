const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Create order
router.post('/', protect, async (req, res) => {
  try {
    const order = await Order.create({ ...req.body, customer: req.user._id });
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// My orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
