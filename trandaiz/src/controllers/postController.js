const postModel = require('../models/postModel');
const likeModel = require('../models/likeModel');
const userModel = require('../models/userModel'); // To fetch user details for posts

/**
 * Creates a new post.
 */
const createPost = (req, res) => {
  try {
    const userId = req.user.id; // From 'protect' middleware
    const { content, mediaUrl, mediaType } = req.body;

    if (!content && !mediaUrl) {
      return res.status(400).json({ message: 'Post content or mediaUrl is required.' });
    }
    if (mediaUrl && !mediaType) {
        return res.status(400).json({ message: 'mediaType is required if mediaUrl is provided.' });
    }
    if (content && typeof content !== 'string') {
        return res.status(400).json({ message: 'Content must be a string.'});
    }


    const newPost = postModel.createPost(userId, content, mediaUrl, mediaType);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error while creating post.' });
  }
};

/**
 * Gets all posts, enriching them with author and like details.
 */
const getPosts = (req, res) => {
  try {
    const posts = postModel.getAllPosts();
    const loggedInUserId = req.user?.id; // User might not be logged in

    const enrichedPosts = posts.map(post => {
      const author = userModel.findUserById(post.userId);
      const likesCount = likeModel.getLikesCountForPost(post.postId);
      const userHasLiked = loggedInUserId ? likeModel.hasUserLikedPost(loggedInUserId, post.postId) : false;

      return {
        ...post,
        author: author ? { id: author.id, username: author.username, fullName: author.fullName, profilePictureUrl: author.profilePictureUrl } : null,
        likesCount,
        userHasLiked,
      };
    });

    res.status(200).json(enrichedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error while fetching posts.' });
  }
};

/**
 * Gets details for a single post, including like count and user's like status.
 */
const getPostDetails = (req, res) => {
    try {
        const postId = parseInt(req.params.postId, 10);
        if (isNaN(postId)) {
            return res.status(400).json({ message: 'Invalid post ID format.' });
        }

        const post = postModel.findPostById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const loggedInUserId = req.user?.id; // User might not be logged in

        const author = userModel.findUserById(post.userId);
        const likesCount = likeModel.getLikesCountForPost(post.postId);
        const userHasLiked = loggedInUserId ? likeModel.hasUserLikedPost(loggedInUserId, post.postId) : false;

        const enrichedPost = {
            ...post,
            author: author ? { id: author.id, username: author.username, fullName: author.fullName, profilePictureUrl: author.profilePictureUrl } : null,
            likesCount,
            userHasLiked,
        };

        res.status(200).json(enrichedPost);
    } catch (error) {
        console.error('Error fetching post details:', error);
        res.status(500).json({ message: 'Internal server error while fetching post details.' });
    }
};


/**
 * Likes a post.
 */
const likePost = (req, res) => {
  try {
    const userId = req.user.id; // From 'protect' middleware
    const postId = parseInt(req.params.postId, 10);

    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID format.' });
    }

    const post = postModel.findPostById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const likeResult = likeModel.addLike(userId, postId);
    if (!likeResult) {
      // User has already liked this post, could be a 200 or 204 too.
      // Sending 200 with a specific message is also an option.
      return res.status(409).json({ message: 'Post already liked by this user.' });
    }

    res.status(201).json({ message: 'Post liked successfully.' }); // 201 for resource creation (the like)
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Internal server error while liking post.' });
  }
};

/**
 * Unlikes a post.
 */
const unlikePost = (req, res) => {
  try {
    const userId = req.user.id; // From 'protect' middleware
    const postId = parseInt(req.params.postId, 10);

    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID format.' });
    }

    const post = postModel.findPostById(postId);
    if (!post) {
      // Technically, if the post doesn't exist, they can't have a like on it.
      // However, it's good practice to check.
      return res.status(404).json({ message: 'Post not found.' });
    }

    const unlikeResult = likeModel.removeLike(userId, postId);
    if (!unlikeResult) {
      return res.status(404).json({ message: 'Like not found for this user and post.' });
    }

    res.status(200).json({ message: 'Post unliked successfully.' }); // Or 204 No Content
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ message: 'Internal server error while unliking post.' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostDetails,
  likePost,
  unlikePost,
};
