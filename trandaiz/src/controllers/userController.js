const userModel = require('../models/userModel');

/**
 * Gets a user's public profile.
 */
const getUserProfile = (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10); // Ensure userId is a number

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    const user = userModel.findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Return public profile data
    const publicProfile = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      bio: user.bio,
      profilePictureUrl: user.profilePictureUrl,
    };

    res.status(200).json(publicProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error while fetching profile.' });
  }
};

/**
 * Updates a user's profile.
 * User must be authenticated, and userId is derived from the token.
 */
const updateUserProfile = (req, res) => {
  try {
    const userId = req.user.id; // User ID from JWT payload (attached by 'protect' middleware)
    const { fullName, bio, profilePictureUrl } = req.body;

    // Basic validation for input
    if (fullName !== undefined && typeof fullName !== 'string') {
        return res.status(400).json({ message: 'fullName must be a string.' });
    }
    if (bio !== undefined && typeof bio !== 'string') {
        return res.status(400).json({ message: 'bio must be a string.' });
    }
    if (profilePictureUrl !== undefined && (profilePictureUrl !== null && typeof profilePictureUrl !== 'string')) {
        // Allow null to remove picture
        return res.status(400).json({ message: 'profilePictureUrl must be a string or null.' });
    }

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePictureUrl !== undefined) updateData.profilePictureUrl = profilePictureUrl;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No update data provided.' });
    }

    const updatedUser = userModel.updateUser(userId, updateData);

    if (!updatedUser) {
      // This case should ideally not happen if protect middleware works correctly
      // and user exists, but good for robustness.
      return res.status(404).json({ message: 'User not found for update.' });
    }

    // Return updated public profile data
    const publicProfile = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email, // Consider if email should be returned here
      fullName: updatedUser.fullName,
      bio: updatedUser.bio,
      profilePictureUrl: updatedUser.profilePictureUrl,
    };
    // For consistency, let's exclude email from this response too, like in getUserProfile
    delete publicProfile.email;


    res.status(200).json({ message: 'Profile updated successfully!', user: publicProfile });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error while updating profile.' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
