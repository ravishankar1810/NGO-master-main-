const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // in INR
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'wallet', 'razorpay', 'cash', 'transfer']
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  message: { type: String },
  isAnonymous: { type: Boolean, default: false },
  receiptNumber: { type: String, unique: true }
}, { timestamps: true });

donationSchema.index({ donorId: 1, createdAt: -1 });
donationSchema.index({ ngoId: 1, createdAt: -1 });
donationSchema.index({ campaignId: 1, createdAt: -1 });

module.exports = mongoose.model('Donation', donationSchema);
