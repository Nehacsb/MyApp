const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Admin", AdminSchema);
