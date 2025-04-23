const express = require('express');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Request = require('../models/Request'); // Missing import
const router = express.Router();

// In your GET /request/requests endpoint
// Update the GET /request/requests endpoint
router.get('/request/requests', async (req, res) => {
  try {
    const { rideIds, userEmail, status } = req.query;
    let query = {};
    
    if (rideIds) {
      try {
        query.ride = { $in: JSON.parse(rideIds) };
      } catch (e) {
        return res.status(400).json({ message: 'Invalid rideIds format' });
      }
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
      .populate('requester')
      .sort({ createdAt: -1 })
      .lean();

    res.json(requests); // Return array directly
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
  
// In your request status update endpoint
router.patch('/request/requests/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id).populate('ride');
    
    // Check if ride has available capacity for the requested seats
    const seatsLeft = request.ride.maxCapacity - request.ride.passengers.length;
    if (status === 'accepted' && seatsLeft < request.seats) {
      return res.status(400).json({ 
        message: `Not enough seats available (requested ${request.seats}, available ${seatsLeft})`
      });
    }
    
    // Update request status
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('ride').populate('requester');
    
   
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
  
  // PATCH /api/rides/:id/add-passenger - Add passenger to ride
  router.patch('/request/:id/add-passenger', async (req, res) => {
    try {
      const { userId, seats = 1 } = req.body;
      const ride = await Ride.findById(req.params.id);

      console.log("ride_add_apssenger",ride);
      
      // Check available seats
      const availableSeats = ride.maxCapacity - ride.passengers.length;
      if (seats > availableSeats) {
        return res.status(400).json({ 
          message: `Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} available`
        });
      }
      
      // Add the user ID multiple times to represent multiple seats
      const passengersToAdd = Array(seats).fill(userId);
      const updatedRide = await Ride.findByIdAndUpdate(
        req.params.id,
        { $push: { passengers: { $each: passengersToAdd } } },
        { new: true }
      );
      
      res.json(updatedRide);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  

  
  // POST /api/request/book - Create a ride request
  router.post('/request/book', async (req, res) => {
    try {
      const { rideId, userEmail, seats = 1 } = req.body;
  
      // Validate input
      if (!rideId || !userEmail) {
        return res.status(400).json({ message: 'Both rideId and userEmail are required' });
      }
  
      // Check if ride exists
      const ride = await Ride.findById(rideId);
      if (!ride) {
        return res.status(404).json({ message: 'Ride not found' });
      }
  
      // Check if user exists
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Validate the request
      if (ride.createdBy.toString() === user._id.toString()) {
        return res.status(400).json({ message: 'Cannot request your own ride' });
      }
  
      if (ride.passengers.includes(user._id)) {
        return res.status(400).json({ message: 'You are already in this ride' });
      }
  
      // Check available seats
      const availableSeats = ride.maxCapacity - ride.passengers.length;
      if (seats > availableSeats) {
        return res.status(400).json({ 
          message: `Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} available`
        });
      }
  
      const existingRequest = await Request.findOne({ 
        ride: rideId, 
        requester: user._id 
      });
      
      if (existingRequest) {
        return res.status(400).json({ message: 'Request already sent' });
      }
  
      // Create new request with seats
      const newRequest = new Request({
        ride: rideId,
        requester: user._id,
        status: 'pending',
        seats: seats
      });

      console.log("newRequest",newRequest);
  
      await newRequest.save();
      
      res.status(201).json({ 
        message: `Request for ${seats} seat${seats !== 1 ? 's' : ''} created successfully`,
        requestId: newRequest._id
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Internal server error',
        error: error.message
      });
    }
  });

  module.exports = router;