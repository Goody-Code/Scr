const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret'; // Replace with a strong secret, ideally from env variables
const SALT_ROUNDS = 10;

/**
 * Registers a new user.
 */
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    // 2. Check if user already exists
    if (userModel.findUserByEmail(email)) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }
    if (userModel.findUserByUsername(username)) {
      return res.status(409).json({ message: 'Username already taken.' });
    }

    // 3. Hash the password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. Store the new user
    const newUser = userModel.createUser({ username, email, password_hash });

    // 5. Return success (excluding password)
    const userResponse = { ...newUser };
    delete userResponse.password_hash;

    res.status(201).json({ message: 'User registered successfully!', user: userResponse });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

/**
 * Logs in an existing user.
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // 2. Find the user by email
    const user = userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' }); // Generic message for security
    }

    // 3. Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' }); // Generic message
    }

    // 4. If password matches, generate a JWT
    const userPayload = {
      id: user.id,
      username: user.username,
      email: user.email
    };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    // 5. Return the JWT and user information (excluding password)
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: userPayload
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
