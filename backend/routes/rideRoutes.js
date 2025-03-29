const express = require('express');
const Ride = require('../models/Ride');
const User = require('../models/User');
const router = express.Router();

// POST /api/rides - Create a new ride
router.post('/rides', async (req, res) => {  // Changed from '/rides' to '/'
  try {
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

module.exports = router;