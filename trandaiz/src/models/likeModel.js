// In-memory store for likes
const likes = [];
let currentLikeId = 1; // This will be reset

/**
 * Like structure:
 * {
 *   likeId: number,
 *   userId: number, // ID of the user who liked the post
 *   postId: number, // ID of the post being liked
 *   createdAt: Date
 * }
 */

/**
 * Checks if a user has already liked a specific post.
 * @param {number} userId - The ID of the user.
 * @param {number} postId - The ID of the post.
 * @returns {boolean} True if the user has liked the post, false otherwise.
 */
const hasUserLikedPost = (userId, postId) => {
  return likes.some(like => like.userId === userId && like.postId === postId);
};

/**
 * Adds a like to a post if it doesn't already exist.
 * @param {number} userId - The ID of the user liking the post.
 * @param {number} postId - The ID of the post to like.
 * @returns {object | false} The new like object if successful, or false if the user already liked the post.
 */
const addLike = (userId, postId) => {
  if (hasUserLikedPost(userId, postId)) {
    return false; // User has already liked this post
  }
  const newLike = {
    likeId: currentLikeId++,
    userId,
    postId,
    createdAt: new Date(),
  };
  likes.push(newLike);
  return newLike;
};

/**
 * Removes a like from a post.
 * @param {number} userId - The ID of the user whose like is to be removed.
 * @param {number} postId - The ID of the post from which to remove the like.
 * @returns {boolean} True if a like was removed, false if no such like was found.
 */
const removeLike = (userId, postId) => {
  const likeIndex = likes.findIndex(like => like.userId === userId && like.postId === postId);

  if (likeIndex > -1) {
    likes.splice(likeIndex, 1);
    return true;
  }
  return false;
};

/**
 * Gets the number of likes for a given post.
 * @param {number} postId - The ID of the post.
 * @returns {number} The total number of likes for the post.
 */
const getLikesCountForPost = (postId) => {
  return likes.filter(like => like.postId === postId).length;
};

/**
 * Resets the likes in-memory store for testing.
 */
const resetLikes = () => {
  likes.length = 0; // Clear the array
  currentLikeId = 1;  // Reset the ID counter
};

module.exports = {
  addLike,
  removeLike,
  getLikesCountForPost,
  hasUserLikedPost,
  resetLikes, // Export reset function
  _likes_debug: likes, // For debugging
};
