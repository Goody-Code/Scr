// In-memory store for posts
const posts = [];
let currentPostId = 1; // This will be reset

/**
 * Post structure:
 * {
 *   postId: number,
 *   userId: number, // ID of the user who created the post
 *   content: string,
 *   mediaUrl: string | null,
 *   mediaType: string | null, // e.g., 'image', 'video'
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */

/**
 * Creates a new post.
 * @param {number} userId - The ID of the user creating the post.
 * @param {string} content - The text content of the post.
 * @param {string | null} mediaUrl - URL of the media content (optional).
 * @param {string | null} mediaType - Type of media (e.g., 'image', 'video') (optional).
 * @returns {object} The created post object.
 */
const createPost = (userId, content, mediaUrl = null, mediaType = null) => {
  const now = new Date();
  const newPost = {
    postId: currentPostId++,
    userId,
    content,
    mediaUrl,
    mediaType,
    createdAt: now,
    updatedAt: now,
  };
  posts.push(newPost);
  return newPost;
};

/**
 * Retrieves all posts.
 * @returns {object[]} An array of all post objects.
 */
const getAllPosts = () => {
  // Return a copy to prevent direct modification of the internal array
  return [...posts].sort((a, b) => b.createdAt - a.createdAt); // Show newest first
};

/**
 * Finds a post by its ID.
 * @param {number} postId - The ID of the post to find.
 * @returns {object | undefined} The post object if found, otherwise undefined.
 */
const findPostById = (postId) => {
  return posts.find(post => post.postId === postId);
};

/**
 * Resets the posts in-memory store for testing.
 */
const resetPosts = () => {
  posts.length = 0; // Clear the array
  currentPostId = 1;  // Reset the ID counter
};

module.exports = {
  createPost,
  getAllPosts,
  findPostById,
  resetPosts, // Export reset function
  _posts_debug: posts, // For debugging purposes
};
