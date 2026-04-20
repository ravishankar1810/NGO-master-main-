const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const FundRequest = require('../models/FundRequest');
const { sendPushNotification, sendSMS } = require('../utils/notifications');

// NGO Approvals
const getPendingNGOs = async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo', isVerified: false }).select('-password');
    res.json({ success: true, data: ngos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const verifyNGO = async (req, res) => {
  try {
    const { action, note } = req.body;
    const ngo = await User.findById(req.params.id);
    
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(404).json({ success: false, message: 'NGO not found' });
    }

    if (action === 'approve') {
      ngo.isVerified = true;
      await ngo.save();
      // Notify
      sendPushNotification(ngo.fcmToken, 'Verification Approved 🎉', 'Your NGO is now verified on ServeX!');
      if (ngo.phone) {
        sendSMS(ngo.phone, `ServeX: Your NGO ${ngo.name} is now verified. Login to create your campaigns!`);
      }
    } else {
      // Logic for rejection
    }

    res.json({ success: true, message: `NGO ${action}d` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Fund Requests
const getPendingFundRequests = async (req, res) => {
  try {
    const requests = await FundRequest.find({ status: 'pending' })
      .populate('ngoId', 'name')
      .populate('campaignId', 'title raisedAmount');
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const reviewFundRequest = async (req, res) => {
  try {
    const { action, note } = req.body;
    const request = await FundRequest.findById(req.params.id).populate('ngoId');
    
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.adminNote = note;
    request.approvedBy = req.user.id;
    await request.save();

    sendPushNotification(request.ngoId.fcmToken, 'Fund Request Update', `Your request for ₹${request.amount} was ${request.status}`);

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Analytics Pipeline
const getAnalytics = async (req, res) => {
  try {
    const totalNGOs = await User.countDocuments({ role: 'ngo', isVerified: true });
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
    
    // Total donations aggregation (Example)
    const donationsAggregation = await Donation.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDonations = donationsAggregation[0] ? donationsAggregation[0].total : 0;

    const topCampaigns = await Campaign.find({ status: 'active' }).sort({ raisedAmount: -1 }).limit(5);
    const recentDonations = await Donation.find({ status: 'success' }).populate('donorId', 'name').sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      data: {
        totalNGOs,
        totalDonors,
        activeCampaigns,
        totalDonations,
        topCampaigns,
        recentDonations
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


module.exports = {
  getPendingNGOs,
  verifyNGO,
  getPendingFundRequests,
  reviewFundRequest,
  getAnalytics
};
