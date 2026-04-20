const express = require('express');
const router = express.Router();
const { 
  createListing, 
  getActiveListings, 
  claimListing, 
  respondToClaim,
  getMyListings 
} = require('../controllers/itemListing');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

router.post('/', verifyToken, checkRole('donor'), createListing);
router.get('/', verifyToken, getActiveListings);
router.get('/my', verifyToken, checkRole('donor'), getMyListings);
router.post('/:id/claim', verifyToken, checkRole('ngo'), claimListing);
router.post('/:id/respond', verifyToken, checkRole('donor'), respondToClaim);

module.exports = router;
