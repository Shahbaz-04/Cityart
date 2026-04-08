// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

// सभी प्रोडक्ट्स प्राप्त करें (optional category filter)
router.get('/', async (req, res) => {
  const { category } = req.query;
  const filter = {};
  if (category) filter.category = category;
  const products = await Product.find(filter);
  res.json(products);
});

// एक प्रोडक्ट प्राप्त करें
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

module.exports = router;