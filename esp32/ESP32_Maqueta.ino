/*
 * REDONDOS VANGUARD - ESP32 MAQUETA INTEGRATION
 * Features: WiFi, MQTT, DHT22, HC-SR04, PIR, Servos, Relays.
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ESP32Servo.h>

// --- CONFIGURATION ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "YOUR_AWS_OR_LOCAL_MQTT_END_POINT";

// --- PINS ---
#define DHTPIN 4
#define DHTTYPE DHT22
#define PIR_PIN 13
#define DOOR_PIN 14
#define TRIG_PIN 5
#define ECHO_PIN 18
#define RELAY_FAN 25
#define RELAY_LIGHT 26
#define SERVO_FEEDER 27

// --- OBJECTS ---
DHT dht(DHTPIN, DHTTYPE);
Servo feederServo;
WiFiClient espClient;
PubSubClient client(espClient);

// --- VARIABLES ---
unsigned long lastMsg = 0;
float temp = 0;
float hum = 0;
int coughCount = 0;

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  dht.begin();
  pinMode(PIR_PIN, INPUT);
  pinMode(DOOR_PIN, INPUT_PULLUP);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RELAY_FAN, OUTPUT);
  pinMode(RELAY_LIGHT, OUTPUT);
  
  feederServo.attach(SERVO_FEEDER);
  feederServo.write(0); // Initial position
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) message += (char)payload[i];
  
  Serial.print("Command received [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  // Example: Control Feeder via Servo
  if (String(topic) == "redondos/commands/feeder") {
    if (message == "OPEN") feederServo.write(90);
    else feederServo.write(0);
  }
  
  // Example: Control Fan via Relay
  if (String(topic) == "redondos/commands/fan") {
    if (message == "ON") digitalWrite(RELAY_FAN, HIGH);
    else digitalWrite(RELAY_FAN, LOW);
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32_Galpon_01")) {
      Serial.println("connected");
      client.subscribe("redondos/commands/#");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(5000);
    }
  }
}

long readDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  return duration * 0.034 / 2;
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > 5000) { // Send telemetry every 5 seconds
    lastMsg = now;

    temp = dht.readTemperature();
    hum = dht.readHumidity();
    long distance = readDistance();
    int motion = digitalRead(PIR_PIN);
    int door = digitalRead(DOOR_PIN);

    // Calculate level percentage (approx 0-20cm tank)
    int level = map(distance, 2, 20, 100, 0);
    if(level < 0) level = 0;

    String payload = "{";
    payload += "\"clientId\":\"GALPON_01\",";
    payload += "\"sensors\":{";
    payload += "\"temperature\":" + String(temp) + ",";
    payload += "\"humidity\":" + String(hum) + ",";
    payload += "\"motion_detected\":" + String(motion) + ",";
    payload += "\"door_open\":" + String(!door) + ","; // Inverted because PULLUP
    payload += "\"poza_level\":" + String(level);
    payload += "}}";

    client.publish("redondos/telemetry/galpon_01", payload.c_str());
    Serial.println("Telemetry sent: " + payload);
  }
}
