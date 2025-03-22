const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  source: { type: String, required: true }, // Source location of the ride
  destination: { type: String, required: true }, // Destination of the ride
  date: { type: Date, required: true }, // Date of the ride
  time: { type: String, required: true }, // Time of the ride
  maxCapacity: { type: Number, required: true }, // Maximum number of passengers
  totalFare: { type: Number, required: true }, // Total fare for the ride
  isFemaleOnly: { type: Boolean, default: false }, // Whether the ride is female-only
  email: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who created the ride
  passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of passengers (users who joined the ride)
  createdAt: { type: Date, default: Date.now }, // Timestamp when the ride was created
});

module.exports = mongoose.model('Ride', rideSchema);