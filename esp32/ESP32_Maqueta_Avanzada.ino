/*
 * REDONDOS VANGUARD - ESP32 ADVANCED MAQUETA (RFID + KEYPAD + LCD)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ESP32Servo.h>
#include <LiquidCrystal_I2C.h>
#include <MFRC522.h>
#include <Keypad.h>
#include <SPI.h>

// --- WIFI & MQTT ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "YOUR_MQTT_BROKER";

// --- PINS ---
#define DHTPIN 4
#define PIR_PIN 13
#define TRIG_PIN 5
#define ECHO_PIN 18
#define SERVO_DOOR 27
#define BUZZER_PIN 2

// RFID PINS (SPI)
#define SS_PIN 21
#define RST_PIN 22

// --- KEYPAD CONFIG ---
const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {32, 33, 25, 26}; 
byte colPins[COLS] = {14, 12, 16, 17};

// --- OBJECTS ---
DHT dht(DHTPIN, DHT22);
Servo doorServo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
MFRC522 mfrc522(SS_PIN, RST_PIN);
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);
WiFiClient espClient;
PubSubClient client(espClient);

// --- STATE ---
String currentPin = "";
String correctPin = "1234";
bool doorLocked = true;

void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();
  dht.begin();
  lcd.init();
  lcd.backlight();
  
  pinMode(BUZZER_PIN, OUTPUT);
  doorServo.attach(SERVO_DOOR);
  doorServo.write(90); // Locked position

  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  lcd.setCursor(0, 0);
  lcd.print("REDONDOS VANG.");
  lcd.setCursor(0, 1);
  lcd.print("SISTEMA ACTIVO");
  delay(2000);
}

void setup_wifi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Handle remote unlock from dashboard
}

void unlockDoor() {
  doorLocked = false;
  doorServo.write(0);
  lcd.clear();
  lcd.print("ACCESO CONCEDIDO");
  digitalWrite(BUZZER_PIN, HIGH);
  delay(200);
  digitalWrite(BUZZER_PIN, LOW);
  delay(3000);
  lockDoor();
}

void lockDoor() {
  doorLocked = true;
  doorServo.write(90);
  lcd.clear();
  lcd.print("PUERTA CERRADA");
  delay(1000);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // 1. RFID SCAN
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    String cardID = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        cardID += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
        cardID += String(mfrc522.uid.uidByte[i], HEX);
    }
    cardID.toUpperCase();
    Serial.println("RFID Detected: " + cardID);
    
    // Send to Twin
    String msg = "{\"clientId\":\"GALPON_01\",\"event\":\"RFID_SCAN\",\"uid\":\""+cardID+"\"}";
    client.publish("redondos/telemetry/access", msg.c_str());
    
    unlockDoor();
  }

  // 2. KEYPAD ENTRY
  char key = keypad.getKey();
  if (key) {
    if (key == '#') {
      if (currentPin == correctPin) {
        unlockDoor();
      } else {
        lcd.clear();
        lcd.print("PIN INCORRECTO");
        delay(1000);
      }
      currentPin = "";
    } else if (key == '*') {
      currentPin = "";
      lcd.clear();
      lcd.print("PIN RESET");
    } else {
      currentPin += key;
      lcd.setCursor(0, 0);
      lcd.print("INGRESANDO PIN:");
      lcd.setCursor(0, 1);
      lcd.print(currentPin);
    }
  }
  
  // 3. TELEMETRY (Every 10s)
  // ... (Same logic as previous code but adding access state)
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32_Security_Hub")) {
      client.subscribe("redondos/commands/door");
    } else {
      delay(5000);
    }
  }
}
