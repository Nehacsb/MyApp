const express = require('express');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Request = require('../models/Request'); // Missing import
const router = express.Router();

// GET /api/requests - Get requests
router.get('/request/requests', async (req, res) => {
    try {
      const { rideIds, userEmail, status } = req.query;
      let query = {};
      
      if (rideIds) {
        query.ride = { $in: JSON.parse(rideIds) };
      }
      
      if (userEmail) {
        const user = await User.findOne({ email: userEmail });
        if (user) {
          query.requester = user._id;
        }
      }
      
      if (status) {
        query.status = status;
      }
      
      const requests = await Request.find(query)
        .populate('ride')
        .populate('requester');
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
// In your request status update endpoint
router.patch('/request/requests/:id', async (req, res) => {
    try {
        console.log("here_request",req.body);
      const { status } = req.body;
      const request = await Request.findById(req.params.id).populate('ride');
      
      // Check if ride has available capacity

      const seatsleft = request.ride.maxCapacity - request.ride.passengers.length;

      if (status === 'accepted' && seatsleft <= 0) {
        return res.status(400).json({ message: 'No available seats in this ride' });
      }
      
      // Update request status
      const updatedRequest = await Request.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate('ride');
      
     
      
      res.json(updatedRequest);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // PATCH /api/rides/:id/add-passenger - Add passenger to ride
  router.patch('/request/:id/add-passenger', async (req, res) => {
    try {
      const { userId } = req.body;
      const ride = await Ride.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { passengers: userId } },
        { new: true }
      );
      
      res.json(ride);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  

  
  // POST /api/request/book - Create a ride request
  router.post('/request/book', async (req, res) => {
    try {
      console.log("here");
      
      console.log('Received request body:', req.body); // Log incoming request
      
      const { rideId, userEmail } = req.body;
  
      // Validate input
      if (!rideId || !userEmail) {
        console.error('Missing required fields');
        return res.status(400).json({ 
          message: 'Both rideId and userEmail are required' 
        });
      }
  
      // Check if ride exists
      const ride = await Ride.findById(rideId);
      if (!ride) {
        console.error('Ride not found:', rideId);
        return res.status(404).json({ message: 'Ride not found' });
      }
  
      // Check if user exists
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        console.error('User not found:', userEmail);
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Validate the request
      if (ride.createdBy.toString() === user._id.toString()) {
        console.error('User trying to request their own ride');
        return res.status(400).json({ message: 'Cannot request your own ride' });
      }
  
      if (ride.passengers.includes(user._id)) {
        console.error('User already in ride');
        return res.status(400).json({ message: 'You are already in this ride' });
      }
  
      const existingRequest = await Request.findOne({ 
        ride: rideId, 
        requester: user._id 
      });
      
      if (existingRequest) {
        console.error('Duplicate request found');
        return res.status(400).json({ message: 'Request already sent' });
      }
  
      // Create new request
      const newRequest = new Request({
        ride: rideId,
        requester: user._id,
        status: 'pending'
      });
  
      await newRequest.save();
      console.log('Request created successfully:', newRequest._id);
  
      res.status(201).json({ 
        message: 'Request created successfully',
        requestId: newRequest._id,
        rideDetails: {
          source: ride.source,
          destination: ride.destination,
          date: ride.date,
          time: ride.time
        }
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ 
        message: 'Internal sssssserver error',
        error: error.message // Include error details for debugging
      });
    }
  });

  module.exports = router;