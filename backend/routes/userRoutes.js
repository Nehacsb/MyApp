const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../../src/utils/generateToken"); // Ensure this path is correct
const sendEmail = require("../../src/utils/sendEmail");
const router = express.Router();

const otpStore = new Map(); // Key: email, Value: { otp, userData, expiresAt }

// Signup Route
router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, gender } = req.body;

  console.log("firstName:",firstName);

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Store OTP and user data temporarily
  otpStore.set(email, {
    otp,
    userData: { firstName, lastName, email, password, phoneNumber, gender },
    expiresAt,
  });
  console.log("here .....");
  // Send OTP via email
  await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);

  console.log("after");

  return res.status(200).json({ message: "OTP sent to email" });
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const entry = otpStore.get(email);
  if (!entry) return res.status(400).json({ error: "No OTP request found" });

  if (entry.expiresAt < Date.now()) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP expired" });
  }

  if (entry.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  // OTP is valid → create user
  const { firstName, lastName, password, phoneNumber, gender } = entry.userData;
  console.log("Verifying user signup. Raw password:", password);


  //const salt = await bcrypt.genSalt(10);
  //const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    gender,
  });


  const isAdmin=false;
  await newUser.save();
  const token = generateToken(newUser._id);

  otpStore.delete(email);

  res.status(201).json({
    message: "User verified and registered",
    user: {
      _id: newUser._id,
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
    },
    token,
    isAdmin,
  });
});


// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Login attempt for:", email);
    const user = await User.findOne({ email });
    
    console.log("User found:", user); // Debugging
    if (!user) {
      return res.status(400).json({ message: "Invalklllid email or password" });
    }
    console.log("password:",password);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid eeemail or password" });
    }

    const token = generateToken(user._id);
    const isAdmin = email === process.env.ADMIN_EMAIL; // Check if the user is admin
    console.log("after gt:", email); // Debugging

    res.status(200).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
      },
      token,
      isAdmin,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


////
// Add these routes to your userRoutes.js

// Forgot Password - Send OTP
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP temporarily
    otpStore.set(email, { otp, expiresAt, purpose: "password_reset" });

    // Send OTP via email
    await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}`);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Verify OTP for Password Reset
router.post("/verify-reset-otp", async (req, res) => {
  const { email, otp } = req.body;

  const entry = otpStore.get(email);
  if (!entry || entry.purpose !== "password_reset") {
    return res.status(400).json({ error: "Invalid request" });
  }

  if (entry.expiresAt < Date.now()) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP expired" });
  }

  if (entry.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  // Mark OTP as verified (don't delete yet - we'll use it in the reset step)
  entry.verified = true;
  otpStore.set(email, entry);

  res.status(200).json({ message: "OTP verified" });
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  const entry = otpStore.get(email);
  if (!entry || !entry.verified || entry.purpose !== "password_reset") {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash new password and update
    //const salt = await bcrypt.genSalt(10);
    //user.password = await bcrypt.hash(newPassword, salt);
    user.password = newPassword; 
    await user.save();

    // Clear OTP entry
    otpStore.delete(email);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add this route to userRoutes.js
router.put("/update-profile", async (req, res) => {
  const { email, phoneNumber, gender } = req.body;

  try {
    console.log("phoneNumber:",phoneNumber);
    console.log("gender:",gender);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("user found:",user);
    // Update fields if they are provided
    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber;
    }
    if (gender !== undefined) {
      user.gender = gender;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        gender: user.gender
      }
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;