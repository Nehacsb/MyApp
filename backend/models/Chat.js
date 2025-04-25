const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isSystemMessage: {
    type: Boolean,
    default: false
  }
});

// Create index for faster queries
chatSchema.index({ rideId: 1, timestamp: 1 });

module.exports = mongoose.model('Chat', chatSchema); 