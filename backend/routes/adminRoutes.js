// routes/adminRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/productModel');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// File upload to frontend public assets directory
const uploadDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'assets');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const safeName = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    cb(null, `${safeName}-${timestamp}${ext}`);
  },
});
const upload = multer({ storage });

// Upload an image and get back a URL to use as product.image
const handleImageUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const imageUrl = `/assets/${req.file.filename}`;
  res.json({ url: imageUrl });
};

router.post('/upload-image', adminAuth, upload.single('image'), handleImageUpload);
router.post('/upload', adminAuth, upload.single('image'), handleImageUpload); // alias for frontend usage

// Create product
router.post('/products', adminAuth, async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    const product = new Product({ name, description, price, category, image });
    const created = await product.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product
router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, price, category, image } = req.body;
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.image = image ?? product.image;

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.remove();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// View database - Users
router.get('/database/users', adminAuth, async (req, res) => {
  try {
    const User = require('../models/userModel');
    const users = await User.find().select('-password');
    res.json({
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// View database - Products
router.get('/database/products', adminAuth, async (req, res) => {
  try {
    const products = await Product.find();
    res.json({
      count: products.length,
      byCategory: {
        bags: products.filter(p => p.category?.toLowerCase() === 'bag').length,
        cards: products.filter(p => p.category?.toLowerCase() === 'card').length,
        banners: products.filter(p => p.category?.toLowerCase() === 'banner').length,
      },
      data: products
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// View database - Orders
router.get('/database/orders', adminAuth, async (req, res) => {
  try {
    const Order = require('../models/orderModel');
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status or delivery status
const updateOrderStatus = async (req, res) => {
  try {
    const Order = require('../models/orderModel');
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const { status, deliveryStatus } = req.body;
    if (status !== undefined) order.status = status;
    if (deliveryStatus !== undefined) order.deliveryStatus = deliveryStatus;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

router.put('/database/orders/:id', adminAuth, updateOrderStatus);
router.put('/orders/:id', adminAuth, updateOrderStatus);

module.exports = router;
