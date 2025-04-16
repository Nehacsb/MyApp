require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const rideRoutes = require("./routes/rideRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");

const locationRoutes = require("./routes/locationRoutes");
const chatRoutes = require("./routes/chatRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: "*", methods: ["GET", "POST","DELETE"], allowedHeaders: ["Content-Type"] }));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

app.use("/api", userRoutes);

app.use('/api', rideRoutes);

app.use('/api', requestRoutes);

app.use("/api", adminRoutes);

app.use("/api", locationRoutes);

app.use("/api", chatRoutes);

app.get("/", (req, res) => {
  res.send("Server is running! 🚀");
}); 

const PORT = process.env.PORT || 5000;
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});