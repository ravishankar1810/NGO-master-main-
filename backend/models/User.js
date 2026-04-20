const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['donor', 'ngo', 'admin'],
    default: 'donor'
  },
  phone: {
    type: String,
    // Store in +91XXXXXXXXXX format
  },
  location: {
    lat: Number,
    lng: Number,
    city: String,
    state: String,
    pincode: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  panNumber: {
    type: String
  },
  aadhaarVerified: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String
  },
  fcmToken: {
    type: String
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
