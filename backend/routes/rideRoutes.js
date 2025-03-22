const express = require('express');
const Ride = require('../models/Ride');
const User = require('../models/User');
const router = express.Router();

// POST /api/rides - Create a new ride
router.post('/rides', async (req, res) => {
  try {
    const { source, destination, date, time, maxCapacity, totalFare, isFemaleOnly, userEmail } = req.body;

    console.log(req.body);
    // Find the user creating the ride
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(user);

    // Create a new ride
    const newRide = new Ride({
      source,
      destination,
      date,
      time,
      maxCapacity,
      totalFare,
      isFemaleOnly,
      createdBy: user.email,
    });

    await newRide.save();
    res.status(201).json({ message: 'Ride created successfully', ride: newRide });
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;