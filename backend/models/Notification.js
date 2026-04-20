const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: {
    type: String,
    enum: ['donation', 'call', 'approval', 'system'],
    required: true
  },
  isRead: { type: Boolean, default: false },
  link: { type: String } // deep link URL
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
