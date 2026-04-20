const mongoose = require('mongoose');

const itemListingSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'clothes', 'books', 'medicine', 'toys', 'electronics', 'furniture']
  },
  quantity: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  recipients: {
    type: [String],
    required: true,
    enum: ['children', 'elderly', 'women', 'homeless', 'flood victims', 'migrants', 'anyone in need']
  },
  tone: {
    type: String,
    default: 'warm',
    enum: ['warm', 'urgent', 'simple', 'formal']
  },
  pickupInfo: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  aiPrompt: {
    type: String
  },
  ngoNote: {
    type: String
  },
  status: {
    type: String,
    default: 'Available',
    enum: ['Available', 'Claimed', 'Accepted', 'Declined', 'Expired', 'Completed']
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  claimMessage: {
    type: String
  },
  expiryAt: {
    type: Date,
    required: true,
    default: () => new Date(+new Date() + 48*60*60*1000) // 48 hours from now
  }
}, { timestamps: true });

// Index for real-time feed and auto-expiry
itemListingSchema.index({ status: 1, createdAt: -1 });
itemListingSchema.index({ expiryAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ItemListing', itemListingSchema);
