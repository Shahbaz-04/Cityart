const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Route Imports
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Load Config
dotenv.config();

// Models for Seeding
const Product = require('./models/productModel');
const User = require('./models/userModel');
const sampleProducts = require('./data/sampleProducts');

const app = express();

// 1. DATABASE CONNECTION & SEEDING
connectDB().then(async () => {
    console.log('Database Connected Successfully to MongoDB Atlas');
    
    try {
        // Seed Products: Agar database khali hai toh sample data daal do
        const existingProducts = await Product.find({});
        if (existingProducts.length === 0 && sampleProducts) {
            await Product.insertMany(sampleProducts);
            console.log('Sample products seeded successfully.');
        }

        // Seed Admin: Initial login ke liye
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const admin = new User({
                username: 'admin',
                password: process.env.ADMIN_PASSWORD || 'admin123', 
                role: 'admin'
            });
            await admin.save();
            console.log('Default Admin user created.');
        }
    } catch (err) {
        console.error('Seeding Error:', err.message);
    }
}).catch(err => {
    console.error('Database connection failed:', err.message);
});

// 2. MIDDLEWARES & CORS FIX
const allowedOrigins = [
    "https://frolicking-sorbet-603fd2.netlify.app", // Aapka Netlify URL
    "http://localhost:3000",
    "http://localhost:5173"
];

// Dynamically add FRONTEND_URL from environment if it exists
if (process.env.FRONTEND_URL) {
    const cleanUrl = process.env.FRONTEND_URL.replace(/\/$/, ""); // Remove trailing slash
    if (!allowedOrigins.includes(cleanUrl)) {
        allowedOrigins.push(cleanUrl);
    }
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // Logs help to see what exactly is being blocked
            console.log("CORS Blocked Origin:", origin);
            callback(new Error('CORS blocked this request'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. API ROUTES
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Static assets for images
// Ensure 'public/assets' folder exists in your backend root
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// 4. PRODUCTION SETUP
// Agar aap Render par hi frontend serve kar rahe hain
if (process.env.NODE_ENV === 'production') {
    const frontendBuildPath = path.resolve(__dirname, 'build'); // Change to 'dist' if using Vite
    app.use(express.static(frontendBuildPath));

    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
        }
    });
}

// Health Check
app.get('/api/status', (req, res) => {
    res.json({ status: 'API is live', database: 'Connected' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`));