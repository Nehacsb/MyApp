// routes/adminRoutes.js
const express = require("express");
const Admin = require("../models/Admin");
const router = express.Router();

// Get all authorized domains
router.get("/admin/authorized_domain", async (req, res) => {
  try {
    console.log("Received request to authorize domain:", req.body);
    const domains = await Admin.find({}, "domain"); // Fetch only 'domain' field
    res.json(domains.map((item) => item.domain));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new authorized domain
router.post("/admin/authorize_domain", async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: "Domain is required" });

  try {
    const existing = await Admin.findOne({ domain });
    if (existing) return res.status(400).json({ error: "Domain already exists" });

    const newDomain = new Admin({ domain });
    await newDomain.save();
    res.status(201).json(newDomain);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Remove an authorized domain
router.delete("/admin/remove_domain", async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: "Domain is required" });

  try {
    const result = await Admin.findOneAndDelete({ domain });
    if (!result) return res.status(404).json({ error: "Domain not found" });

    res.json({ message: "Domain removed" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;