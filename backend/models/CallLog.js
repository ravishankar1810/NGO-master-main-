const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phone: { type: String, required: true },
  callSid: { type: String, required: true },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'answered', 'completed', 'failed', 'no-answer'],
    default: 'initiated'
  },
  duration: { type: Number }, // in seconds
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CallLog', callLogSchema);
