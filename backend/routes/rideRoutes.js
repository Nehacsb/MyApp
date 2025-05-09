const express = require('express');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Request = require('../models/Request'); // Missing import
const Chat = require('../models/Chat')
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

    // Check if the user is the creator
    if (ride.email !== userEmail) {
      return res.status(403).json({ message: 'Only the ride creator can withdraw' });
    }

    // If there are still passengers, prevent withdrawal
    if (ride.passengers.length > 1) {
      return res.status(400).json({
        message: 'You cannot withdraw because passengers have already joined your ride.'
      });
    }

    // Proceed with withdrawal if no passengers
    await Ride.findByIdAndDelete(req.params.rideId);
    await Request.deleteMany({ ride: req.params.rideId });

    return res.json({
      message: 'Ride cancelled successfully',
      rideDeleted: true
    });
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
    console.log("Full request body:", req.body);
    console.log("Vehicle details:", {
      vehicleType: req.body.vehicleType,
      contactNumber: req.body.contactNumber,
      numberPlate: req.body.numberPlate,
      otherInfo: req.body.otherInfo
    });

    const { source, destination, date, time, maxCapacity, totalFare, isFemaleOnly, userEmail , vehicleType, contactNumber,numberPlate, otherInfo} = req.body;
    console.log("req.body", req.body);
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
      vehicleType,
      contactNumber,
      numberPlate,
      otherInfo,
      email: user.email,
      createdBy: user._id,
      passengers: [user._id]// Add the user as a passenger
      
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
    console.log("I am in get");
    const { email } = req.query;

    console.log("email", email);

    if (!email || typeof email !== 'string') {
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
      .select('source destination date time maxCapacity totalFare isFemaleOnly email createdBy passengers vehicleType contactNumber numberPlate otherInfo')
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
      isCurrentUserCreator: ride.email === email,

      vehicleType: ride.vehicleType || null,
      contactNumber: ride.contactNumber || null,
      numberPlate: ride.numberPlate || null,
      otherInfo: ride.otherInfo || null
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
    // console.log("here_rides_search", source, destination, minSeats, date);

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
      .select('source destination date time maxCapacity passengers totalFare isFemaleOnly createdBy vehicleType contactNumber numberPlate otherInfo')
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

// GET /api/rides/:rideId - Get detailed ride information with passenger names
// Get a ride by rideId


router.get('/rides/:rideId', async (req, res) => {
  try {
    // Find the ride and populate both creator and passenger details
    const ride = await Ride.findById(req.params.rideId)
      .select('source destination date time maxCapacity passengers totalFare isFemaleOnly createdBy vehicleType contactNumber numberPlate otherInfo')
      .populate({

        path: 'createdBy',
        select: 'firstName lastName email phoneNumber gender'
      })
      .populate({
        path: 'passengers',
        select: 'firstName lastName email phoneNumber gender'
      })
      .lean();

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    console.log("ride", ride);

    // Calculate available seats
    const seatsLeft = ride.maxCapacity - (ride.passengers?.length || 0);

    // Format the response with all necessary details
    const response = {
      success: true,
      data: {
        rideId: ride._id,
        source: ride.source,
        destination: ride.destination,
        date: ride.date,
        time: ride.time,
        maxCapacity: ride.maxCapacity,
        seatsLeft,
        totalFare: ride.totalFare,
        isFemaleOnly: ride.isFemaleOnly,
        createdAt: ride.createdAt,
        driver: {
          userId: ride.createdBy._id,
          name: `${ride.createdBy.firstName} ${ride.createdBy.lastName}`,
          email: ride.createdBy.email,
          phone: ride.createdBy.phoneNumber,
          gender: ride.createdBy.gender
        },

        vehicleType: ride.vehicleType || null,
        contactNumber: ride.contactNumber  || null,
        numberPlate: ride.numberPlate || null,
        otherInfo: ride.otherInfo || null,
        passengers: ride.passengers.map(p => ({
          userId: p._id,
          name: `${p.firstName} ${p.lastName}`,
          email: p.email,
          phone: p.phoneNumber,
          gender: p.gender
        }))

      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching ride details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ride details',
      error: error.message
    });
  }
});

module.exports = router;
