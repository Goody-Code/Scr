const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/users/:userId/profile - Get a user's public profile
router.get('/:userId/profile', userController.getUserProfile);

// PUT /api/users/profile - Update the authenticated user's profile
// This route is protected, meaning a valid JWT is required.
router.put('/profile', protect, userController.updateUserProfile);

module.exports = router;
