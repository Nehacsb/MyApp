const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../../src/utils/generateToken"); // Ensure this path is correct
const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the request body
    const { firstName, lastName, email, password, phoneNumber, gender } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", existingUser); // Log if user exists
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user
    const newUser = new User({ firstName, lastName, email, password, phoneNumber, gender });
    await newUser.save();
    console.log("User created:", newUser); // Log the created user

    // Respond with success message
    res.status(201).json({
      message: "User created successfully",
      user: { firstName, lastName, email, phoneNumber, gender },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    // Respond with user and token
    res.status(200).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
      },
      token,
    });
  } catch (err) {
    console.error("Login Errorrrr:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;