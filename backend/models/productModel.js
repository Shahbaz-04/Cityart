// models/productModel.js
const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., 'bag', 'card', 'banner'
  image: { type: String, required: true },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;