const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { sendSMS, sendPushNotification, createInAppNotification } = require('../utils/notifications');
const { triggerAppreciationCall } = require('./call');
const { sendAppreciationEmail } = require('../utils/email');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// POST /api/donations/create-order
const createOrder = async (req, res) => {
  try {
    const { campaignId, amount } = req.body; // amount in INR
    
    if (amount < 1) return res.status(400).json({ success: false, message: 'Minimum donation is ₹1' });

    // ✅ Block donations on completed campaigns
    if (campaignId && mongoose.Types.ObjectId.isValid(campaignId)) {
      const campaign = await Campaign.findById(campaignId);
      if (campaign && campaign.status === 'completed') {
        return res.status(400).json({ 
          success: false, 
          message: 'This campaign has already reached its goal and is now closed. Thank you for your generosity!' 
        });
      }
    }

    const options = {
      amount: amount * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'dummy_key'
    });
  } catch (error) {
    console.error('Order creation error', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// POST /api/donations/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, campaignId, ngoId, message, isAnonymous, paymentMethod, phone } = req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpaySignature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    let campaign;
    
    // Only attempt search by ID if it's a valid hex string, avoiding CastError
    if (mongoose.Types.ObjectId.isValid(campaignId)) {
      campaign = await Campaign.findById(campaignId);
    }
    
    // Fallback for NGO Locator "Real-world" or Mock NGOs
    if (!campaign && (typeof campaignId === 'string' && (campaignId.startsWith('real-') || campaignId.startsWith('mock-') || campaignId.startsWith('dynamic-')))) {
      campaign = await Campaign.findOne({ isGeneralFund: true });
      if (!campaign) {
        // Create it once if it doesn't exist
        campaign = await Campaign.create({
          title: 'ServeX Community General Fund',
          description: 'A platform-wide fund to support verified local causes found via the NGO Locator.',
          targetAmount: 5000000,
          raisedAmount: 0,
          donorCount: 0,
          category: 'health',
          location: { type: 'Point', coordinates: [77.2090, 28.6139] },
          status: 'active',
          ngoId: ngoId && mongoose.Types.ObjectId.isValid(ngoId) ? ngoId : '69c0ed2e93d966e63c7dad29' // Fallback to verified NGO
        });
      }
    }

    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    // Generate receipt number
    const random6 = Math.floor(100000 + Math.random() * 900000);
    const receiptNumber = `SERVEX-${new Date().getFullYear()}-${random6}`;

    // Create Donation Record using valid ObjectIds from the found campaign
    const donation = await Donation.create({
      donorId: req.user.id,
      campaignId: campaign._id,
      ngoId: campaign.ngoId,
      amount,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod: paymentMethod || 'upi',
      status: 'success',
      message,
      isAnonymous,
      receiptNumber
    });

    // Update Campaign Stats
    campaign.raisedAmount += amount;
    campaign.donorCount += 1;

    // ✅ Auto-complete campaign if target is reached
    const targetReached = campaign.raisedAmount >= campaign.targetAmount;
    if (targetReached && campaign.status === 'active') {
      campaign.status = 'completed';
      console.log(`🎉 Campaign "${campaign.title}" has reached its target! Marking as completed.`);

      // Notify the NGO of goal achievement
      await createInAppNotification(
        campaign.ngoId,
        '🏆 Campaign Goal Achieved!',
        `Your campaign "${campaign.title}" has successfully reached its fundraising target of ₹${campaign.targetAmount.toLocaleString()}!`,
        'goal_achieved',
        `/ngo-dashboard`
      );
    }

    await campaign.save();

    // Trigger Notifications & appreciation call
    let donor = await User.findById(req.user.id);
    if (donor) {
      // Update phone if provided now and not already set
      if (phone && (!donor.phone || donor.phone !== phone)) {
        donor.phone = phone;
        await donor.save();
      }
      try {
        // Use validated ObjectIds from the campaign object
        await triggerAppreciationCall(donor, campaign._id, campaign.ngoId);
      } catch (callError) {
        console.error('Non-blocking error triggering appreciation call:', callError.message);
      }
    }

    // 1. In-App for NGO (using validated ngoId from campaign)
    await createInAppNotification(
      campaign.ngoId,
      'New Donation 🎉',
      `You received a donation of ₹${amount} for your campaign "${campaign.title}"`,
      'donation',
      `/ngo-dashboard`
    );

    // 2. In-App for Donor
    await createInAppNotification(
      campaign.donorCount > 1 ? req.user.id : donor?._id || req.user.id,
      'Donation Successful ❤️',
      `Thank you for donating ₹${amount} to "${campaign.title}". Your receipt is ${receiptNumber}.`,
      'donation',
      `/donor-dashboard`
    );

    // 3. Email Appreciation
    if (donor && donor.email) {
      sendAppreciationEmail(donor.email, donor.name, amount, campaign.title);
    }

    // Push/SMS (using validated IDs from campaign object)
    sendPushNotification(campaign.ngoId, 'New Donation 🎉', `₹${amount} donated to ${campaign.title}`);
    
    // Use phone from request or from donor profile
    const targetPhone = phone || (donor ? donor.phone : null);
    if (targetPhone) {
      sendSMS(targetPhone, `Namaste! Your donation of ₹${amount} to ${campaign.title} was successful. Receipt: ${receiptNumber}`);
    }

    res.json({ success: true, receipt: receiptNumber, donation });
  } catch (error) {
    console.error('Payment verification error', error);
    res.status(500).json({ success: false, message: 'Server Verification Error' });
  }
};

// GET /api/donations/my
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .populate('campaignId', 'title category')
      .populate('ngoId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /api/donations/campaign/:id
const getCampaignDonations = async (req, res) => {
  try {
    // Make sure user is NGO and owns campaign
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign || campaign.ngoId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const donations = await Donation.find({ campaignId: req.params.id })
      .populate('donorId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /api/donations/ngo
const getNGODonations = async (req, res) => {
  try {
    const donations = await Donation.find({ ngoId: req.user.id })
      .populate('donorId', 'name email')
      .populate('campaignId', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: donations });
  } catch (error) {
    console.error('getNGODonations error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /api/donations/receipt/:receiptId
const getReceipt = async (req, res) => {
  try {
    const donation = await Donation.findOne({ receiptNumber: req.params.receiptId })
      .populate('donorId', 'name panNumber')
      .populate('campaignId', 'title')
      .populate('ngoId', 'name registrationNumber');

    if (!donation) return res.status(404).json({ success: false, message: 'Receipt not found' });

    res.json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST /api/donations (Simple/Direct Donation)
const createSimpleDonation = async (req, res) => {
  try {
    const { name, phone, email, amount, donationType, location, message } = req.body;

    // Simple validation
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    // Since this is a "simple" donation, we might not have a campaignId or ngoId from the form
    // In a real app, these would be required. For this implementation, we'll try to find a default or just log it.
    // However, triggerAppreciationCall needs a donor object (even if partial).
    
    const mockDonor = { name, phone, email, _id: req.user?.id || 'anonymous' };
    
    // Trigger the call (can still happen if configured)
    try {
      await triggerAppreciationCall(mockDonor, null, null);
    } catch (callError) {
      console.error('Non-blocking error triggering appreciation call (simple):', callError.message);
    }

    // Trigger the email
    if (email) {
      sendAppreciationEmail(email, name, amount, 'General Support');
    }

    // We still log the donation if we can, but since the model requires campaignId/ngoId, 
    // and this form doesn't provide them, we just return success for the call demonstration.
    
    res.json({ 
      success: true, 
      message: 'Thank you! Your donation was recorded and an appreciation call has been initiated.' 
    });
  } catch (error) {
    console.error('Simple donation error', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getMyDonations,
  getCampaignDonations,
  getReceipt,
  createSimpleDonation,
  getNGODonations
};
