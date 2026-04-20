const { GoogleGenerativeAI } = require("@google/generative-ai");
const ItemListing = require('../models/ItemListing');
const User = require('../models/User');
const { sendAppreciationEmail } = require('../utils/email');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Helper to generate AI prompt
const generateDonationPrompt = async (data) => {
  const { category, description, quantity, recipients, tone } = data;
  
  const prompt = `
    You are a warm, community-driven AI assistant for a donation platform called "Donor".
    Generate a compelling 3-5 sentence donation prompt for the following item:
    Category: ${category}
    Description: ${description}
    Quantity: ${quantity}
    Intended Recipients: ${recipients.join(', ')}
    Tone: ${tone}

    The prompt should describe the item, its potential impact, and include a call-to-action for NGOs to claim it.
    Also, generate a separate short "NGO Note" (1-2 sentences) with logistics/handling advice.
    
    Return the response in JSON format with two keys: "aiPrompt" and "ngoNote".
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Clean JSON if needed (sometimes Gemini wraps in code blocks)
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      aiPrompt: `A generous donation of ${quantity} ${category} is available: ${description}. Perfect for ${recipients.join(', ')}. NGOs, please reach out to claim this!`,
      ngoNote: "Please coordinate pickup with the donor directly."
    };
  }
};

// POST /api/item-listings
exports.createListing = async (req, res) => {
  try {
    const { category, quantity, description, recipients, tone, pickupInfo, city } = req.body;
    
    // Generate AI content
    const aiContent = await generateDonationPrompt({ category, description, quantity, recipients, tone });

    const listing = await ItemListing.create({
      donorId: req.user.id,
      category,
      quantity,
      description,
      recipients,
      tone,
      pickupInfo,
      city,
      aiPrompt: aiContent.aiPrompt,
      ngoNote: aiContent.ngoNote
    });

    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    console.error("Create Listing Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET /api/item-listings (Feed for NGOs)
exports.getActiveListings = async (req, res) => {
  try {
    const { category, recipients } = req.query;
    let query = { status: 'Available', expiryAt: { $gt: new Date() } };
    
    if (category) query.category = category;
    if (recipients) query.recipients = { $in: [recipients] };

    const listings = await ItemListing.find(query)
      .populate('donorId', 'name city')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// POST /api/item-listings/:id/claim
exports.claimListing = async (req, res) => {
  try {
    const { claimMessage } = req.body;
    const listing = await ItemListing.findById(req.params.id);

    if (!listing || listing.status !== 'Available') {
      return res.status(400).json({ success: false, message: "Listing not available" });
    }

    listing.status = 'Claimed';
    listing.claimedBy = req.user.id;
    listing.claimMessage = claimMessage;
    await listing.save();

    // Notify Donor (Email stub)
    const donor = await User.findById(listing.donorId);
    const ngo = await User.findById(req.user.id);
    
    // In a real app, send email/in-app notification here
    console.log(`Notification: ${ngo.name} claimed ${listing.category} from ${donor.name}`);

    res.json({ success: true, message: "Listing claimed, awaiting donor approval" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// POST /api/item-listings/:id/respond (Accept/Decline)
exports.respondToClaim = async (req, res) => {
  try {
    const { decision } = req.body; // 'Accepted' or 'Declined'
    const listing = await ItemListing.findById(req.params.id);

    if (!listing || listing.donorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (decision === 'Accepted') {
      listing.status = 'Accepted';
    } else {
      listing.status = 'Available';
      listing.claimedBy = null;
      listing.claimMessage = '';
    }

    await listing.save();
    res.json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET /api/item-listings/my (Donor History)
exports.getMyListings = async (req, res) => {
  try {
    const listings = await ItemListing.find({ donorId: req.user.id })
      .populate('claimedBy', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
