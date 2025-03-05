const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();  // ✅ Load environment variables

const app = express();
app.use(cors());
app.use(express.json());  // ✅ Parse JSON requests

// ✅ Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Sample API Route
app.get("/", (req, res) => {
  res.send("MongoDB Atlas is Connected!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
