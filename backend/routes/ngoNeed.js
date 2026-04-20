const express = require('express');
const router = express.Router();
const { 
  createNeed, 
  getAllNeeds, 
  fulfillNeed 
} = require('../controllers/ngoNeed');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

router.get('/', verifyToken, getAllNeeds);
router.post('/', verifyToken, checkRole('ngo'), createNeed);
router.patch('/:id/fulfill', verifyToken, checkRole('ngo'), fulfillNeed);

module.exports = router;
