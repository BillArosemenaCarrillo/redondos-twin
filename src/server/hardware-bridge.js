const WebSocket = require('ws');

// Simple WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log('--- REDONDOS VANGUARD: HARDWARE BRIDGE ACTIVE ---');
console.log('Listening on ws://localhost:8080');

wss.on('connection', (ws) => {
    console.log('Client Connected (Dashboard or ESP32)');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('Message Received:', data);

        // Broadcast to everyone (Dashboard -> ESP32 or vice versa)
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    });

    ws.on('close', () => {
        console.log('Client Disconnected');
    });
});
