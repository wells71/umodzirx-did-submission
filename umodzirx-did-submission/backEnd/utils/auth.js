require('dotenv').config();
const jwt = require('jsonwebtoken');

// Generate a JWT token with a consistent expiration time of 1 hour
const generateToken = (user) => {
  console.log('JWT_SECRET:', process.env.JWT_SECRET); // Log the secret key
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }  // This ensures the token expires in 1 hour
  );
};

// Verify the JWT token with the same secret key used to sign it
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error('Token is invalid or expired');
  }
};

module.exports = { generateToken, verifyToken };
