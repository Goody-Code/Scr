const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel'); // May not be needed if all required user info is in JWT

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret'; // Ensure this matches the one in authController

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user to the request object (payload from JWT)
      // The payload should contain user ID, and any other non-sensitive info
      // you might need directly, like username or email, if stored during login.
      req.user = decoded;

      // Optional: If you need to fetch fresh user data from DB for every request
      // const currentUser = userModel.findUserById(decoded.id);
      // if (!currentUser) {
      //   return res.status(401).json({ message: 'Not authorized, user not found' });
      // }
      // req.user = currentUser; // Or merge, depending on what's in JWT payload

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Not authorized, token failed (invalid signature or malformed)' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token expired' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
