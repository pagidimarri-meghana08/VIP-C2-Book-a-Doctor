const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['appointment', 'approval', 'system', 'reminder'],
      default: 'system',
    },
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // appointment or doctor id
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);