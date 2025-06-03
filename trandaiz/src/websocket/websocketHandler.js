const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret'; // Ensure this matches other JWT secrets
const clients = new Map(); // Map<userId, WebSocket>

function initializeWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    // console.log('Client connected via WebSocket');
    ws.isAuthenticated = false;

    ws.on('message', (message) => {
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(message);
      } catch (error) {
        // console.error('Failed to parse WebSocket message:', message);
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Invalid JSON message format.' } }));
        return;
      }

      // console.log('Received WebSocket message:', parsedMessage);

      if (parsedMessage.type === 'AUTH') {
        if (!parsedMessage.token) {
          ws.send(JSON.stringify({ type: 'AUTH_FAIL', payload: { message: 'Token not provided.' } }));
          return ws.close();
        }
        try {
          const decodedToken = jwt.verify(parsedMessage.token, JWT_SECRET);
          ws.userId = decodedToken.id; // Assuming JWT payload has 'id'
          ws.isAuthenticated = true;
          clients.set(ws.userId, ws);
          // console.log(`User ${ws.userId} authenticated and connected.`);
          ws.send(JSON.stringify({ type: 'AUTH_SUCCESS', payload: { userId: ws.userId } }));
        } catch (error) {
          // console.error('WebSocket authentication error:', error.message);
          ws.send(JSON.stringify({ type: 'AUTH_FAIL', payload: { message: 'Invalid or expired token.' } }));
          ws.isAuthenticated = false; // Explicitly set
          return ws.close(); // Close connection on auth fail
        }
      } else if (ws.isAuthenticated) {
        // Handle other message types only if authenticated
        switch (parsedMessage.type) {
          case 'NEW_MESSAGE':
            const { toUserId, text } = parsedMessage.payload;
            if (!toUserId || text === undefined) {
              ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Missing toUserId or text in NEW_MESSAGE.' } }));
              return;
            }

            const recipientWs = clients.get(toUserId);
            if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
              recipientWs.send(JSON.stringify({
                type: 'INCOMING_MESSAGE',
                payload: {
                  fromUserId: ws.userId,
                  text,
                  timestamp: new Date().toISOString(),
                },
              }));
              // Optional: send confirmation back to sender
              ws.send(JSON.stringify({ type: 'MESSAGE_SENT', payload: { toUserId, text, timestamp: new Date().toISOString() }}));
            } else {
              // console.log(`Recipient ${toUserId} not connected or not found.`);
              // Optional: send an error/info message back to the sender
              ws.send(JSON.stringify({ type: 'RECIPIENT_OFFLINE', payload: { toUserId } }));
              // TODO: Store message for later delivery (persistent chat feature)
            }
            break;
          // Add more cases for other message types here
          default:
            // console.log(`Unknown message type from authenticated user ${ws.userId}: ${parsedMessage.type}`);
            ws.send(JSON.stringify({ type: 'ERROR', payload: { message: `Unknown message type: ${parsedMessage.type}` } }));
        }
      } else {
        // console.log('WebSocket message received from unauthenticated client. Ignoring.');
        // Optionally, send an error message or close the connection
        ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Authentication required.' } }));
        // ws.close(); // Or just ignore
      }
    });

    ws.on('close', () => {
      // console.log(`Client ${ws.userId || 'unauthenticated'} disconnected.`);
      if (ws.userId) {
        clients.delete(ws.userId);
      }
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${ws.userId || 'unauthenticated'}:`, error);
      // ws.userId might not be set if error occurs before authentication
      if (ws.userId && clients.has(ws.userId)) {
         clients.delete(ws.userId);
      }
    });
  });

  // console.log('WebSocket server initialized and attached to HTTP server.');
}

module.exports = { initializeWebSocket };
