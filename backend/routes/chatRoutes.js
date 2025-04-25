const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Ride = require('../models/Ride');

// Get all messages for a specific ride
router.get('/chat/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { since } = req.query;

    let query = { rideId };
    if (since) {
      query.timestamp = { $gt: new Date(since) };
    }
    
    console.log("Received rideId in API:", rideId);
  

    // Get ride details
    const ride = await Ride.findById(rideId).lean();
    console.log("Ride found:", ride);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Get all messages for this ride
    const messages = await Chat.find({ rideId })
      .sort({ timestamp: 1 })
      .lean();
      
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages_routes:', error);
    res.status(500).json({ 
      message: 'Server error while fetching messages_routes',
      error: error.message 
    });
  }
});

// Send a new message
router.post('/chat/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { content, senderId, senderName } = req.body; // Get sender info from request body
    
  
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    if (!senderId || !senderName) {
      return res.status(400).json({ message: 'Sender information is required' });
    }

    if (content.length > 500) {
      return res.status(400).json({ message: 'Message too long (max 500 characters)' });
    }

    // Verify ride exists
    const ride = await Ride.findById(rideId).lean();
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Create and save the new message
    const newMessage = new Chat({
      rideId,
      senderId,
      senderName,
      content: content.trim(),
      timestamp: new Date()
    });
    
    const savedMessage = await newMessage.save();
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: savedMessage
    });
    
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ 
      message: 'Server error while sending message',
      error: error.message 
    });
  }
});

module.exports = router;