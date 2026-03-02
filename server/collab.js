const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    // health check endpoint
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
    }
    res.writeHead(404);
    res.end();
});

const wss = new WebSocket.Server({ server });

// store rooms and their states
const rooms = {};

// clean up inactive rooms every 15 minutes
setInterval(() => {
    const now = Date.now();
    for (const [roomName, room] of Object.entries(rooms)) {
        if (now - room.lastActivity > 15 * 60 * 1000) {
            console.log(`Room "${roomName}" has been inactive for 15 minutes. Deleting.`);
            delete rooms[roomName];
        }
    }
}, 60 * 1000);

wss.on('connection', (ws) => {
    console.log('New client connected');

    let currentRoom = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'joinRoom') {
                const { roomName, baseState } = data;

                // validate room name
                if (!/^[a-zA-Z0-9_-]+$/.test(roomName)) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid room name' }));
                    return;
                }

                // create the room if it doesn't exist
                if (!rooms[roomName]) {
                    rooms[roomName] = {
                        baseState: baseState || {},
                        clients: new Set(),
                        lastActivity: Date.now(),
                        updateTimeout: null,
                        pendingState: null
                    };
                    console.log(`Room "${roomName}" created.`);
                } else {
                    console.log(`Room "${roomName}" already exists.`);
                    if (baseState && baseState.length > 0) {
                        rooms[roomName].baseState = baseState;
                        console.log(`Room "${roomName}" baseState updated.`);
                    }
                }

                // join the room
                currentRoom = roomName;
                rooms[roomName].clients.add(ws);
                rooms[roomName].lastActivity = Date.now();

                // send the current base state to the client
                ws.send(JSON.stringify({ type: 'roomState', baseState: rooms[roomName].baseState }));
                console.log(`Client joined room "${roomName}".`);
            } else if (currentRoom) {
                // broadcast the received message to all clients in the same room
                rooms[currentRoom].clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });

                // update the room's last activity timestamp
                rooms[currentRoom].lastActivity = Date.now();

                // update the base state for state-changing events
                if (['addDevice', 'moveDevice', 'deleteDevice', 'makeConnection', 'deleteConnection'].includes(data.type)) {
                    const room = rooms[currentRoom];
                    if (data.newState) {
                        room.baseState = data.newState;
                    }
                }

                // apply updateInput deltas directly to baseState so new room joiners get correct values
                if (data.type === 'updateInput' && rooms[currentRoom].baseState && Array.isArray(rooms[currentRoom].baseState)) {
                    const room = rooms[currentRoom];
                    const deviceState = room.baseState.find(d => d.id === data.deviceId);
                    if (deviceState && deviceState.inputs) {
                        const key = data.elementId || data.inportTag;
                        if (key !== undefined) {
                            deviceState.inputs[key] = data.value;
                        }
                        // persist audioUrl at the top level so new room joiners can auto-load it
                        if (key === 'audioUrlInput') {
                            deviceState.audioUrl = data.value;
                        }
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

server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
});
