const express = require('express');
const router = express.Router();
const {
  getPendingNGOs,
  verifyNGO,
  getPendingFundRequests,
  reviewFundRequest,
  getAnalytics
} = require('../controllers/admin');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// All admin routes require verifyToken and admin role check
router.use(verifyToken, checkRole('admin'));

router.get('/ngos', getPendingNGOs);
router.patch('/ngo/:id/verify', verifyNGO);

router.get('/fund-requests', getPendingFundRequests);
router.patch('/fund-request/:id', reviewFundRequest);

router.get('/analytics', getAnalytics);

module.exports = router;
