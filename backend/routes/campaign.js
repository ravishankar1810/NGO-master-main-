const express = require('express');
const router = express.Router();
const {
  getCampaigns,
  getNearbyCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  updateCampaignStatus,
  addCampaignUpdate,
  deleteCampaign
} = require('../controllers/campaign');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Public routes
router.get('/', getCampaigns);
router.get('/nearby', getNearbyCampaigns);
router.get('/:id', getCampaignById);

// Protected NGO routes
router.post('/', verifyToken, checkRole('ngo'), createCampaign);
router.patch('/:id', verifyToken, checkRole('ngo'), updateCampaign);
router.patch('/:id/status', verifyToken, checkRole('ngo'), updateCampaignStatus);
router.post('/:id/update', verifyToken, checkRole('ngo'), addCampaignUpdate);

// Protected Admin route
router.delete('/:id', verifyToken, checkRole('admin'), deleteCampaign);

module.exports = router;
