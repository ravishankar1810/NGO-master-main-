const mongoose = require('mongoose');

const fundRequestSchema = new mongoose.Schema({
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  title: { type: String, required: true },
  purpose: { type: String, required: true },
  amount: { type: Number, required: true }, // INR
  bankAccount: {
    accountNumber: { type: String, required: true },
    ifsc: { type: String, required: true },
    accountHolder: { type: String, required: true },
    bankName: { type: String, required: true }
  },
  proofDocuments: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNote: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('FundRequest', fundRequestSchema);
