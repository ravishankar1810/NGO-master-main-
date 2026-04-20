const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Require legacy models if necessary, or let new models take over
const Donation = require('../models/Donation');
require('../jobs/expiry'); // Initialize cron jobs
const Contact = require('../models/Contact'); // Leaving old Contact model available if used in other routes

const app = express();

// Security Middlewares
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://ngo-master-main.onrender.com'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting on Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.'
});

// Import Routers
const authRoutes = require('../routes/auth');
const campaignRoutes = require('../routes/campaign');
const donationRoutes = require('../routes/donation');
const callRoutes = require('../routes/call');
const adminRoutes = require('../routes/admin');
const contactRoutes = require('../routes/contact');
const notificationRoutes = require('../routes/notification');
const itemListingRoutes = require('../routes/itemListing');
const ngoNeedRoutes = require('../routes/ngoNeed');

// Mount Routers
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/item-listings', itemListingRoutes);
app.use('/api/ngo-needs', ngoNeedRoutes);

// Welcome / Health Endpoints
app.get('/', (req, res) => {
  res.send('🚀 ServeX Backend is running!');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date() });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/servex')
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 ServeX Backend running on port ${PORT}`);
});

module.exports = app;
