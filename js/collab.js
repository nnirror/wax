const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');

// get the certificate and key file paths from command-line arguments
const certPath = process.argv[2];
const keyPath = process.argv[3];

if (!certPath || !keyPath) {
    console.error('Error: Certificate and key file paths must be provided as command-line arguments.');
    process.exit(1);
}

// load SSL/TLS certificates
const server = https.createServer({
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath)
});

// create WebSocket server on top of the HTTPS server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', (message) => {
        console.log('Received message:', message);
        // broadcast the received message to all clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

server.listen(9314, () => {
    console.log('WebSocket server is running on wss://nnirror.xyz:9314');
});