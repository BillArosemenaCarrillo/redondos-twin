const awsIot = require('aws-iot-device-sdk');

// --- AWS CONFIGURATION ---
const device = awsIot.device({
    keyPath: './certs/private.pem.key',
    certPath: './certs/certificate.pem.crt',
    caPath: './certs/AmazonRootCA1.pem',
    clientId: 'Vanguard_Twin_Bridge',
    host: 'tu-endpoint.iot.us-east-1.amazonaws.com'
});

console.log('--- REDONDOS VANGUARD: CLOUD BRIDGE STARTING ---');

device.on('connect', () => {
    console.log('Connected to AWS IoT Core');

    // Subscribe to all telemetry from barns
    device.subscribe('redondos/telemetry/+/status');
});

device.on('message', (topic, payload) => {
    const data = JSON.parse(payload.toString());
    console.log(`Cloud Data [${topic}]:`, data);

    // Here we would push data to the React Dashboard via WebSockets
});

// Function to send commands from Dashboard to Cloud
function sendCommand(target, action) {
    const topic = `redondos/commands/${target}`;
    const payload = JSON.stringify({ action: action, timestamp: Date.now() });

    device.publish(topic, payload);
    console.log(`Command Sent to Cloud: ${topic}`);
}

// Example: sendCommand('light/barn1', 'ON');
