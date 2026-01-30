import mqtt from 'mqtt';

// PUBLIC MQTT BROKER (Industrial Standard for GPS tracking)
// This is 100% free and requires no keys for demo purposes.
const MQTT_BROKER = 'wss://broker.emqx.io:8084/mqtt';
const TOPIC_PREFIX = 'redondos/vanguard/trackers/';

let client: mqtt.MqttClient | null = null;

export const initMQTT = (onMessage?: (data: any) => void) => {
    if (client) return client;

    client = mqtt.connect(MQTT_BROKER, {
        keepalive: 60,
        clientId: 'vanguard_' + Math.random().toString(16).substring(2, 8),
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
    });

    client.on('connect', () => {
        console.log('Connected to MQTT Cloud Bridge');
        client?.subscribe('redondos/vanguard/trackers/#');
    });

    client.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            if (onMessage) onMessage(data);
        } catch (e) {
            console.error('MQTT Parse Error', e);
        }
    });

    return client;
};

export const publishTracker = (id: string, data: any) => {
    if (!client || !client.connected) {
        initMQTT();
        // Wait for connect or just try publish anyway (will queue if lucky)
    }
    client?.publish(TOPIC_PREFIX + id, JSON.stringify(data), { qos: 0, retain: true });
};
