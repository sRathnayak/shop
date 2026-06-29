const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'staff', 'inventory_manager', 'admin'], default: 'customer' },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
