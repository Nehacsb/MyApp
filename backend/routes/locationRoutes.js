const express = require("express");
const router = express.Router();
const Location = require("../models/Location");

// GET: Fetch locations with optional search query
router.get("/locations", async (req, res) => {
  try {
    const { search } = req.query;
    const query = search
      ? { name: { $regex: new RegExp(search, "i") } }
      : {};
    const locations = await Location.find(query).limit(10);
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Add a new location
router.post("/locations", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const existing = await Location.findOne({ name });
    if (existing)
      return res.status(400).json({ error: "Location already exists" });

    const newLocation = new Location({ name });
    await newLocation.save();
    res.status(201).json(newLocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove a location
router.delete("/locations/:id", async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
