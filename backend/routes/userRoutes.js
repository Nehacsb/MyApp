const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../../src/utils/generateToken"); // Ensure this path is correct
const sendEmail = require("../../src/utils/sendEmail");
const router = express.Router();

const otpStore = new Map(); // Key: email, Value: { otp, userData, expiresAt }


// Signup Route
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
      },
      token,
      isAdmin,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;