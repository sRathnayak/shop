const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/inventory', require('./routes/inventory'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Cloth Shop API Running' }));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clothshop';
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    await seedAdmin();
  })
  .catch(err => console.log('MongoDB Error:', err));

// Seed default admin
async function seedAdmin() {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  const exists = await User.findOne({ email: 'admin@clothshop.com' });
  if (!exists) {
    await User.create({
      name: 'Admin',
      email: 'admin@clothshop.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    });
    console.log('Default admin created: admin@clothshop.com / admin123');
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
