const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  category: {
    type: String,
    enum: ['education', 'food', 'health', 'disaster', 'environment', 'women', 'child', 'animal'],
    required: true
  },
  location: {
    city: String,
    state: String,
    pincode: String,
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'pending_review'],
    default: 'active'
  },
  coverImage: { type: String },
  documents: [{ type: String }],
  endDate: { type: Date },
  donorCount: { type: Number, default: 0 },
  isGeneralFund: { type: Boolean, default: false },
  updates: [{
    text: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Ensure geospatial indexing for `nearby` API performance requirements
campaignSchema.index({ status: 1 });
campaignSchema.index({ ngoId: 1 });
campaignSchema.index({ "location": "2dsphere" });

module.exports = mongoose.model('Campaign', campaignSchema);
