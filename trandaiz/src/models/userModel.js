// In-memory store for users
const users = [];
let currentId = 1; // This will be reset

/**
 * User structure:
 * {
 *   id: number,
 *   username: string,
 *   email: string,
 *   password_hash: string,
 *   fullName: string | null,
 *   bio: string | null,
 *   profilePictureUrl: string | null
 * }
 */

/**
 * Finds a user by their email.
 * @param {string} email - The email of the user to find.
 * @returns {object | undefined} The user object if found, otherwise undefined.
 */
const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

/**
 * Finds a user by their username.
 * @param {string} username - The username of the user to find.
 * @returns {object | undefined} The user object if found, otherwise undefined.
 */
const findUserByUsername = (username) => {
  return users.find(user => user.username === username);
};

/**
 * Finds a user by their ID.
 * @param {number} userId - The ID of the user to find.
 * @returns {object | undefined} The user object if found, otherwise undefined.
 */
const findUserById = (userId) => {
  return users.find(user => user.id === userId);
};

/**
 * Creates a new user.
 * @param {object} userData - The user data.
 * @param {string} userData.username - The username.
 * @param {string} userData.email - The email.
 * @param {string} userData.password_hash - The hashed password.
 * @returns {object} The created user object.
 */
const createUser = (userData) => {
  const newUser = {
    id: currentId++,
    username: userData.username,
    email: userData.email,
    password_hash: userData.password_hash,
    fullName: userData.fullName || null,
    bio: userData.bio || null,
    profilePictureUrl: userData.profilePictureUrl || null,
  };
  users.push(newUser);
  return newUser;
};

/**
 * Updates a user's details.
 * @param {number} userId - The ID of the user to update.
 * @param {object} updateData - An object containing the fields to update.
 * @returns {object | undefined} The updated user object, or undefined if user not found.
 */
const updateUser = (userId, updateData) => {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    return undefined;
  }

  users[userIndex] = { ...users[userIndex], ...updateData };
  return users[userIndex];
};

/**
 * Resets the users in-memory store for testing.
 */
const resetUsers = () => {
  users.length = 0; // Clear the array
  currentId = 1;    // Reset the ID counter
};

module.exports = {
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
  updateUser,
  resetUsers, // Export reset function
  _users_debug: users,
};
