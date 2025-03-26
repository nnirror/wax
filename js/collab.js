const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 9314 });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // Broadcast the received message to all clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

console.log('WebSocket server is running on wss://nnirror.xyz:9314');