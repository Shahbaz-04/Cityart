// server.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const Product = require('./models/productModel');
const User = require('./models/userModel');
const sampleProducts = require('./data/sampleProducts');

const seedProducts = async () => {
  try {
    const existingProducts = await Product.find({});
    const existingImages = new Set(existingProducts.map((product) => product.image));
    const missingProducts = sampleProducts.filter((product) => !existingImages.has(product.image));

    if (existingProducts.length === 0) {
      console.log('Seeding sample products...');
      await Product.insertMany(sampleProducts);
      console.log('Sample products seeded.');
    } else if (missingProducts.length > 0) {
      console.log(`Seeding ${missingProducts.length} missing sample products...`);
      await Product.insertMany(missingProducts);
      console.log('Missing sample products seeded.');
    } else {
      console.log('Sample products already present. No seeding needed.');
    }
  } catch (err) {
    console.error('Failed to seed products:', err.message);
  }
};

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      console.log('Creating admin user...');
      const admin = new User({
        username: 'admin',
        password: 'admin123' // In production, use a strong password
      });
      await admin.save();
      console.log('Admin user created successfully.');
    }
  } catch (err) {
    console.error('Failed to create admin user:', err.message);
  }
};

connectDB().then(() => {
  seedProducts();
  seedAdmin();
});

const app = express();
app.use(cors());
app.use(express.json()); // JSON डेटा पार्स करने के लिए
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Serve the frontend build in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

app.get('/api/status', (req, res) => {
  res.json({ status: 'API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));