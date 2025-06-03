const express = require('express');
const WebSocket = require('ws'); // Import ws library
const { initializeWebSocket } = require('./websocket/websocketHandler'); // Import handler

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to Trandaiz API!');
});

// Authentication routes
app.use('/api/auth', authRoutes);

// User profile routes
app.use('/api/users', userRoutes);

// Post routes
app.use('/api/posts', postRoutes);

// Start the HTTP server
const server = app.listen(port, () => {
  console.log(`Trandaiz HTTP server listening at http://localhost:${port}`);
});

// Initialize WebSocket server and attach it to the HTTP server
const wss = new WebSocket.Server({ server });
initializeWebSocket(wss); // Pass the WebSocket server instance to the handler

// Export the app and server for potential testing or programmatic use
module.exports = { app, server };
