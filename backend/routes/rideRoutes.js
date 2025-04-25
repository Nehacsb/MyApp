const express = require('express');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Request = require('../models/Request'); // Missing import
const router = express.Router();

// Add to rideRoutes.js

// PATCH /api/rides/withdraw-creator/:rideId - Creator withdraws from their own ride
router.patch('/rides/withdraw-creator/:rideId', async (req, res) => {
  try {
    const { userEmail } = req.body;
    const ride = await Ride.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Verify the user is the creator
    if (ride.email !== userEmail) {
      return res.status(403).json({ message: 'Only the ride creator can withdraw' });
    }

    // Remove creator from passengers
    const user = await User.findOne({ email: userEmail });
    ride.passengers = ride.passengers.filter(
      passengerId => passengerId.toString() !== user._id.toString()
    );

    // Check if there are any passengers left
    if (ride.passengers.length === 0) {
      // No passengers left - delete the ride
      await Ride.findByIdAndDelete(req.params.rideId);
      await Request.deleteMany({ ride: req.params.rideId });
      return res.json({ 
        message: 'Ride cancelled as there were no passengers left',
        rideDeleted: true
      });
    } else {
      // There are still passengers - update ride
      await ride.save();
      // TODO: Notify remaining passengers in chat
      return res.json({ 
        message: 'Creator withdrawn from ride',
        rideDeleted: false
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/rides/:id - Delete a ride
router.delete('/rides/:id', async (req, res) => {
  try {
    // 1. Delete the ride
    const ride = await Ride.findByIdAndDelete(req.params.id);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // 2. Delete all associated requests
    await Request.deleteMany({ ride: req.params.id });
    
    // 3. TODO: Notify all passengers via chat
    
    res.json({ message: 'Ride deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/rides - Create a new ride
router.post('/rides', async (req, res) => {  // Changed from '/rides' to '/'
  try {
    console.log("here_rides");

    const { source, destination, date, time, maxCapacity, totalFare, isFemaleOnly, userEmail } = req.body;

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newRide = new Ride({
      source,
      destination,
      date,
      time,
      maxCapacity,
      totalFare,
      isFemaleOnly,
      email: user.email,
      createdBy: user._id,
      passengers: [user._id] // Add the user as a passenger
    });

    await newRide.save();
    res.status(201).json(newRide);
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/rides - Get rides for a specific user
router.get('/rides', async (req, res) => {
  try {
    console.log("here_rides");
    const { email } = req.query;

    console.log("email",email);

    if (!email || typeof email !== 'string' ) {
      return res.status(400).json({ 
        message: 'Valid user email is rrequired',
        received: email
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const rides = await Ride.find({
      $or: [
        { email }, // Rides created by this user
        { passengers: user._id } // Rides where user is passenger
      ]
    })
    .populate('createdBy', 'firstName lastName email')
    .populate('passengers', 'firstName lastName email')
    .sort({ date: 1, time: 1 });

    // Format response for frontend
    const formattedRides = rides.map(ride => ({
      _id: ride._id,
      source: ride.source,
      destination: ride.destination,
      date: ride.date,
      time: ride.time,
      maxCapacity: ride.maxCapacity,
      totalFare: ride.totalFare,
      isFemaleOnly: ride.isFemaleOnly,
      email: ride.email,
      createdBy: ride.createdBy,
      passengers: ride.passengers,
      seatsLeft: ride.maxCapacity - ride.passengers.length,
      isCurrentUserCreator: ride.email === email
    }));

    res.status(200).json(formattedRides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ 
      message: 'Failed to fetch rides',
      error: error.message 
    });
  }
});

  // GET /api/rides/search - Find available rides based on source and/or destination
  // In rideRoutes.js, update the search endpoint
router.get('/rides/search', async (req, res) => {
  try {
    const { source, destination, minSeats, date } = req.query;

    let query = {};
    console.log("here_rides_search", source, destination, minSeats, date);

    if (source) {
      query.source = { $regex: source, $options: 'i' };
    }
    
    if (destination) {
      query.destination = { $regex: destination, $options: 'i' };
    }

    // Add date filter if provided
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    // Add minSeats filter if provided
    if (minSeats && !isNaN(minSeats)) {
      const seatsNum = parseInt(minSeats);
      query.$expr = {
        $gte: [
          { $subtract: ['$maxCapacity', { $size: '$passengers' }] },
          seatsNum
        ]
      };
    }

    const rides = await Ride.find(query)
      .populate('createdBy', 'firstName lastName email phoneNumber')
      .lean();

    // Calculate available seats and enhance ride data
    const enhancedRides = rides.map(ride => {
      const passengersCount = ride.passengers?.length || 0;
      return {
        ...ride,
        seatsLeft: ride.maxCapacity - passengersCount,
        driver: ride.createdBy // For frontend consistency
      };
    });

    res.json(enhancedRides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;