const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware'); // Assuming this is the correct path

// POST /api/posts/ - Create a new post (Protected)
router.post('/', protect, postController.createPost);

// GET /api/posts/ - Get all posts (Public or can be adapted)
// For getPosts, protect is not strictly necessary if posts are public.
// If we want to show user-specific things (like "have I liked this?"),
// protect middleware can be used to optionally get req.user.
// For now, making it public and controller handles optional req.user.
router.get('/', postController.getPosts);

// GET /api/posts/:postId - Get details for a single post (Public or can be adapted)
// Similar to getPosts, making it public and controller handles optional req.user for like status.
router.get('/:postId', postController.getPostDetails);

// POST /api/posts/:postId/like - Like a post (Protected)
router.post('/:postId/like', protect, postController.likePost);

// DELETE /api/posts/:postId/like - Unlike a post (Protected)
router.delete('/:postId/like', protect, postController.unlikePost);

module.exports = router;
