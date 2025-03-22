const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // Payload: Include the user ID
    process.env.JWT_SECRET, // Secret key from environment variables
    { expiresIn: "7d" } // Token expiration time
  );
};

module.exports = generateToken;