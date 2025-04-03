const express = require("express");
const Admin = require("../models/Admin");
const router = express.Router();

// Get all authorized emails
router.get("admin/authorized_emails", async (req, res) => {
  try {
    const emails = await Admin.find({}, "email"); // Only fetch 'email' field
    res.json(emails.map((item) => item.email)); // Return array of email strings
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new authorized email
router.post("admin/authorize_email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const newEmail = new Admin({ email });
    await newEmail.save();
    res.status(201).json(newEmail);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Remove an authorized email
router.delete("admin/remove_email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const result = await Admin.findOneAndDelete({ email });
    if (!result) return res.status(404).json({ error: "Email not found" });

    res.json({ message: "Email removed" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
