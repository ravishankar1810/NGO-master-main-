const Campaign = require('../models/Campaign');

// GET /api/campaigns
const getCampaigns = async (req, res) => {
  try {
    const { category, city, state, status, ngoId, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (category) query.category = category.toLowerCase();
    if (status) query.status = status;
    if (ngoId) query.ngoId = ngoId;
    if (city) query['location.city'] = { $regex: new RegExp(city, 'i') };
    if (state) query['location.state'] = { $regex: new RegExp(state, 'i') };

    const campaigns = await Campaign.find(query)
      .populate('ngoId', 'name profileImage isVerified')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Campaign.countDocuments(query);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /api/campaigns/nearby?lat=XX&lng=XX&radius=XX (radius in km)
const getNearbyCampaigns = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const radiusInRads = parseFloat(radius) / 6378.1; // Earth radius in km

    const campaigns = await Campaign.find({
      location: {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRads]
        }
      },
      status: 'active'
    }).populate('ngoId', 'name isVerified');

    res.json({ success: true, data: campaigns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /api/campaigns/:id
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('ngoId', 'name email phone profileImage isVerified registrationNumber');
      
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    
    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST /api/campaigns (protected, ngo)
const createCampaign = async (req, res) => {
  try {
    const newCampaignData = {
      ...req.body,
      ngoId: req.user.id
    };
    
    // ✅ Prevent duplicate: block if this NGO already has a campaign with the same title
    const existing = await Campaign.findOne({
      ngoId: req.user.id,
      title: { $regex: new RegExp(`^${req.body.title?.trim()}$`, 'i') }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A campaign named "${existing.title}" already exists. Please use a unique title or edit the existing campaign.`
      });
    }

    // Set to active directly so donors can immediately see and donate to it
    newCampaignData.status = 'active';

    const campaign = await Campaign.create(newCampaignData);
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PATCH /api/campaigns/:id (protected, ngo)
const updateCampaign = async (req, res) => {
  try {
    let campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    
    if (campaign.ngoId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PATCH /api/campaigns/:id/status (protected, ngo)
const updateCampaignStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    
    if (campaign.ngoId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    campaign.status = status;
    await campaign.save();
    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST /api/campaigns/:id/update (protected, ngo)
const addCampaignUpdate = async (req, res) => {
  try {
    const { text } = req.body;
    let campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    if (campaign.ngoId.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    campaign.updates.push({ text });
    await campaign.save();
    
    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// DELETE /api/campaigns/:id (protected, admin)
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    await campaign.deleteOne();
    res.json({ success: true, message: 'Campaign removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getCampaigns,
  getNearbyCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  updateCampaignStatus,
  addCampaignUpdate,
  deleteCampaign
};
