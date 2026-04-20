const express = require('express');
const router = express.Router();
const { initiateCall, webhook, getLogs, generateTwiML } = require('../controllers/call');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Protected NGO outbound call endpoints
router.post('/initiate', verifyToken, checkRole('ngo'), initiateCall);
router.get('/logs', verifyToken, checkRole('ngo'), getLogs);

// Unprotected public endpoints exclusively for Twilio service callbacks
// In production, these should validate X-Twilio-Signature
router.post('/webhook', express.urlencoded({ extended: false }), webhook);
router.post('/twiml', express.urlencoded({ extended: false }), generateTwiML);

module.exports = router;
