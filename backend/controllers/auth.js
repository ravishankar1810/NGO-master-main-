const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_dev', {
    expiresIn: '30d',
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Role-specific defaults
    const isVerified = role === 'ngo' ? false : true;

    // Password hashing is handled by User model pre-save hook
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'donor',
      phone,
      isVerified
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    const msg = error.message.includes('timeout') 
      ? 'Database connection timed out. Is MongoDB running?' 
      : 'Server error';
    res.status(500).json({ success: false, message: msg });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    const msg = error.message.includes('timeout') 
      ? 'Database connection timed out. Is MongoDB running?' 
      : 'Server error';
    res.status(500).json({ success: false, message: msg });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ 
      success: true, 
      data: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google OAuth Register & Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { token, role } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'No Google token provided' });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { email, name, picture } = ticket.getPayload();
    let user = await User.findOne({ email });

    if (!user) {
      if (!role) return res.status(400).json({ success: false, message: 'Role specifies Donor or NGO required for initial sign-up' });
      // Dynamically create the user bypassing normal password flow
      user = await User.create({
        name,
        email,
        password: await bcrypt.hash(email + Date.now().toString(), 10), // Generate a strong proxy password
        role: role.toLowerCase(),
        phone: '1234567890', // Must be updated by user later
        isVerified: true // Google users are considered verified
      });
    }

    // Replaced sendTokenResponse with existing pattern
    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  googleLogin
};
