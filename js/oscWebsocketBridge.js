const WebSocket = require('ws');
const OSC = require('osc-js');

const wss = new WebSocket.Server({ port: 6011 });

const osc = new OSC({ 
    plugin: new OSC.DatagramPlugin({ 
        type: 'udp4', 
        open: { port: 5813, host: '0.0.0.0' },
        send: { port: 5813, host: 'localhost' }
    }) 
});

osc.on('open', () => {
    console.log('OSC WebSocket bridge started successfully');
    console.log('- WebSocket server on port 6011');  
    console.log('- OSC UDP receiver on port 5813');
});

osc.on('error', (error) => {
    console.error('OSC error:', error);
});

osc.on('*', (message) => {
    const messageData = JSON.stringify({
        address: message.address,
        args: message.args
    });
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageData);
        }
    });
});

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});

osc.open();