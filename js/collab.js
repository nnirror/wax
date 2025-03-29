const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');

// Get the certificate and key file paths from command-line arguments
const certPath = process.argv[2];
const keyPath = process.argv[3];

if (!certPath || !keyPath) {
    console.error('Error: Certificate and key file paths must be provided as command-line arguments.');
    process.exit(1);
}

// Load SSL/TLS certificates
const server = https.createServer({
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath)
});

// Create WebSocket server on top of the HTTPS server
const wss = new WebSocket.Server({ server });

// Store rooms and their states
const rooms = {}; // { roomName: { baseState: {}, clients: Set<WebSocket>, lastActivity: Date, updateTimeout: null } }

// Clean up inactive rooms every 15 minutes
setInterval(() => {
    const now = Date.now();
    for (const [roomName, room] of Object.entries(rooms)) {
        if (now - room.lastActivity > 15 * 60 * 1000) { // 15 minutes
            console.log(`Room "${roomName}" has been inactive for 15 minutes. Deleting.`);
            delete rooms[roomName];
        }
    }
}, 60 * 1000); // Run every minute

wss.on('connection', (ws) => {
    console.log('New client connected');

    let currentRoom = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'joinRoom') {
                const { roomName, baseState } = data;

                // Validate room name
                if (!/^[a-zA-Z0-9_-]+$/.test(roomName)) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid room name' }));
                    return;
                }

                // Create the room if it doesn't exist
                if (!rooms[roomName]) {
                    rooms[roomName] = {
                        baseState: baseState || {}, // Initialize with the provided base state
                        clients: new Set(),
                        lastActivity: Date.now(),
                        updateTimeout: null,
                        pendingState: null // Store the latest pending state
                    };
                    console.log(`Room "${roomName}" created.`);
                }

                // Join the room
                currentRoom = roomName;
                rooms[roomName].clients.add(ws);
                rooms[roomName].lastActivity = Date.now();

                // Send the current base state to the client
                ws.send(JSON.stringify({ type: 'roomState', baseState: rooms[roomName].baseState }));
                console.log(`Client joined room "${roomName}".`);

                
            } else if (currentRoom) {
                // Broadcast the received message to all clients in the same room
                rooms[currentRoom].clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });

                // Update the room's last activity timestamp
                rooms[currentRoom].lastActivity = Date.now();

                // Update the base state if this is a state-changing event
                if (['addDevice', 'moveDevice', 'updateInput', 'deleteDevice', 'makeConnection', 'deleteConnection'].includes(data.type)) {
                    const room = rooms[currentRoom];
                    if (data.newState) {
                        // update the baseState with the newState
                        room.baseState = data.newState;
                    }
                }
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom].clients.delete(ws);
            console.log(`Client disconnected from room "${currentRoom}".`);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

server.listen(9314, () => {
    console.log('WebSocket server is running on wss://nnirror.xyz:9314');
});