require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "*", // Allow all origins (use specific domains in production)
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json()); // Middleware to parse JSON

// Connect to MongoDB Atlas
console.log("Hello this is env");
console.log(process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
// Define Ride Schema
const rideSchema = new mongoose.Schema({
  source: String,
  destination: String,
  date: String,
  time: String,
  maxCapacity: Number,
  totalFare: Number,
});

// Create Ride Model
const Ride = mongoose.model("User", rideSchema);

// API Route to Insert Ride
app.post("/api/rides", async (req, res) => {
  try {
    console.log("📌 Storing Ride Details:", req.body);
    const newRide = new Ride(req.body);
    await newRide.save();
    res.json({ message: "🚀 Ride successfully created!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(5000, '0.0.0.0', () => console.log("Server running on port 5000"));

