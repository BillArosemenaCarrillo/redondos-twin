#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ESP32Servo.h>
#include <LiquidCrystal_I2C.h>
#include <MFRC522.h>
#include <Keypad.h>
#include <SPI.h>

// --- AWS IOT SECRETS (PLACEHOLDERS) ---
const char* WIFI_SSID = "TU_WIFI";
const char* WIFI_PASS = "TU_PASSWORD";
const char* AWS_IOT_ENDPOINT = "tu-endpoint.iot.us-east-1.amazonaws.com";

// Certificados X.509
const char* AWS_CERT_CA = "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----";
const char* AWS_CERT_CRT = "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----";
const char* AWS_CERT_PRIVATE = "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----";

// --- PINS CONFIG ---
#define DHTPIN 4
#define PIR_PIN 13
#define TRIG_PIN 5
#define ECHO_PIN 18
#define SERVO_DOOR 27
#define SERVO_FEEDER 25
#define BUZZER_PIN 2
#define MASTER_SWITCH_PIN 34 // Pin para switch ON/OFF

// RFID PINS (SPI)
#define SS_PIN 21
#define RST_PIN 22

// --- KEYPAD 4x4 ---
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
Servo feederServo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
MFRC522 mfrc522(SS_PIN, RST_PIN);
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// --- AWS OBJECTS ---
WiFiClientSecure net = WiFiClientSecure();
PubSubClient client(net);

// --- LOCAL STATE ---
String currentPin = "";
String correctPin = "1234";
unsigned long lastSensorRead = 0;

void connectAWS() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  Serial.println("Conectando a Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE);

  client.setServer(AWS_IOT_ENDPOINT, 8883);

  Serial.println("Conectando a AWS IoT Core...");
  while (!client.connect("ESP32_Vanguard_Maqueta")) {
    delay(500);
    Serial.print(".");
  }

  if (client.connected()) {
    Serial.println("--- VANGUARD CLOUD SYNC: ACTIVE ---");
  }
}

void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();
  dht.begin();
  lcd.init();
  lcd.backlight();
  
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(MASTER_SWITCH_PIN, INPUT_PULLUP); // Switch Maestro
  doorServo.attach(SERVO_DOOR);
  feederServo.attach(SERVO_FEEDER);
  
  doorServo.write(90); // Start Locked
  feederServo.write(0); // Start Closed

  lcd.setCursor(0, 0);
  lcd.print("REDONDOS VANGUARD");
  lcd.setCursor(0, 1);
  lcd.print("Buscando Cloud...");

  connectAWS();
  
  lcd.clear();
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

void unlockDoor() {
  lcd.clear();
  lcd.print("ACCESO OK!");
  lcd.setCursor(0, 1);
  lcd.print("ABRIENDO...");
  doorServo.write(0);
  digitalWrite(BUZZER_PIN, HIGH); delay(100); digitalWrite(BUZZER_PIN, LOW);
  delay(3000);
  doorServo.write(90);
  lcd.clear();
}

void loop() {
  // 1. RFID CHECK
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    String cardID = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        cardID += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
        cardID += String(mfrc522.uid.uidByte[i], HEX);
    }
    cardID.toUpperCase();
    Serial.println("RFID LECTURA: " + cardID);
    lcd.clear();
    lcd.print("TARJETA ID:");
    lcd.setCursor(0, 1);
    lcd.print(cardID);
    delay(1000);
    unlockDoor();
  }

  // 2. KEYPAD CHECK
  char key = keypad.getKey();
  if (key) {
    digitalWrite(BUZZER_PIN, HIGH); delay(50); digitalWrite(BUZZER_PIN, LOW);
    if (key == '#') {
      if (currentPin == correctPin) unlockDoor();
      else {
        lcd.clear(); lcd.print("PIN INVALIDO"); delay(1000);
      }
      currentPin = "";
      lcd.clear();
    } else if (key == '*') {
      currentPin = "";
      lcd.clear();
    } else {
      currentPin += key;
      lcd.setCursor(0, 0);
      lcd.print("PIN ENTRY:");
      lcd.setCursor(0, 1);
      lcd.print(currentPin);
    }
  }

  // 3. SENSOR MONITORING (Show on LCD every 5s)
  if (millis() - lastSensorRead > 5000) {
    lastSensorRead = millis();
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    long dist = readDistance();
    bool systemOn = digitalRead(MASTER_SWITCH_PIN) == LOW; // LOW means switch is ON (Pull-up)
    
    Serial.print("T:"); Serial.print(t);
    Serial.print(" H:"); Serial.print(h);
    Serial.print(" D:"); Serial.print(dist);
    Serial.print(" SYS:"); Serial.println(systemOn ? "ON" : "OFF");
    
    if (currentPin == "") { 
      lcd.setCursor(0, 0);
      lcd.print(systemOn ? "VANGUARD: [OK]  " : "VANGUARD: [OFF]");
      lcd.setCursor(0, 1);
      lcd.print("T:"); lcd.print(t, 1); lcd.print("C H:"); lcd.print(h,0); lcd.print("%");
    }

    // PUBLICAR A AWS
    if (client.connected()) {
      String payload = "{\"temp\":" + String(t) + ",\"hum\":" + String(h) + ",\"sys\":" + (systemOn ? "1" : "0") + "}";
      client.publish("redondos/telemetry/barn1/status", payload.c_str());
    }
  }
  client.loop();
}
