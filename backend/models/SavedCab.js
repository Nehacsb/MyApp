const mongoose = require('mongoose');

const savedCabSchema = new mongoose.Schema({
  email: { type: String, required: true },
  driverName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  plateNumber: { type: String},
}, { timestamps: true });

module.exports = mongoose.model('SavedCab', savedCabSchema);
