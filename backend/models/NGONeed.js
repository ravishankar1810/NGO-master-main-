const mongoose = require('mongoose');

const ngoNeedSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'clothes', 'books', 'medicine', 'toys', 'electronics', 'furniture']
  },
  description: {
    type: String,
    required: true
  },
  urgencyFlag: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'Open',
    enum: ['Open', 'Fulfilled']
  }
}, { timestamps: true });

module.exports = mongoose.model('NGONeed', ngoNeedSchema);
