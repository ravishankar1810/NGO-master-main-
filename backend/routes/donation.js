const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getMyDonations,
  getCampaignDonations,
  getReceipt,
  createSimpleDonation,
  getNGODonations
} = require('../controllers/donation');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Create order requires authentication (to tie to donor)
router.post('/create-order', verifyToken, createOrder);

// Verify handles the Razorpay signature verification and updates the DB
router.post('/verify', verifyToken, verifyPayment);

// Simple donation (public or auth)
router.post('/', createSimpleDonation);

// Donor specific
router.get('/my', verifyToken, getMyDonations);

// NGO specific
router.get('/campaign/:id', verifyToken, checkRole('ngo'), getCampaignDonations);
router.get('/ngo', verifyToken, checkRole('ngo'), getNGODonations);

// Receipt can be public or semi-private
router.get('/receipt/:receiptId', getReceipt);

module.exports = router;
