const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true, enum: ['Men', 'Women', 'Kids', 'Accessories'] },
  stock: { type: Number, default: 0 },
  image: { type: String, default: '' },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  featured: { type: Boolean, default: false },
  discount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
