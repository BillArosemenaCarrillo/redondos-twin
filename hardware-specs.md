# ESP32 INTEGRATION SPECS: REDONDOS VANGUARD 🦾🔌

Este documento detalla los componentes y protocolos necesarios para integrar hardware real al Gemelo Digital.

## 🛠️ Bill of Materials (BOM) Recomendado

| Componente | Función | Cantidad | Notas |
| :--- | :--- | :--- | :--- |
| **ESP32-WROOM-32** | Microcontrolador central (WiFi/Bluetooth) | 1 per Galpón | Recomendado: DevKit V1 |
| **Interruptor Toggle / Deslizante** | Switch Maestro ON/OFF | 1 | Para encendido/apagado lógico |
| **MCP3008 (ADC SPI)** | Conversor Analógico Digital de 10 bits | 1 | Para lecturas de alta precisión (8 canales) |
| **Sondas de Impedancia** | Calidad de Agua / Humedad de Suelo | 2 | Conectadas al MCP3008 |
| **MQ-137 / MQ-135** | Sensor de Amoníaco (NH3) y Gases | 1 | Vital para bienestar animal |
| **ACS712** | Sensor de Corriente (Eficiencia Energía) | 1 | Monitoreo de motores/bombas |
| **RFID-RC522** | Lectura de tarjetas de ingreso | 1 | Interfaz SPI (Seguridad) |
| **Keypad 4x4** | Teclado numérico para PIN | 1 | Digital Inputs (Control de Door) |
| **LCD 16x2 i2C** | Pantalla de estado de puerta/clima | 1 | Interfaz I2C |
| **DHT22 / AM2302** | Sensor de Temperatura y Humedad | 1 | Digital (Preciso para galpones) |
| **PIR HC-SR501** | Sensor de Movimiento (Seguridad) | 1-2 | Digital Input |
| **Sensor de Puerta (Reed Switch)** | Detectar apertura de galpones | 2 | Contacto magnético |
| **Micro Servos (SG90)** | Simular apertura de Comederos / Puerta | 2 | PWM Control |
| **Mini Bomba / Solenoide** | Control de Bebederos (Agua) | 1 | Vía Relé |
| **Sensor de Ultrasonido (HC-SR04)** | Nivel de agua en la "Poza" | 1 | Detección de nivel real |
| **Relé (4-8 Canales)** | Control de Actuadores (Motores/Luces) | 1 | Optoacoplado |
| **Sensor MAX9814** | Detección acústica (Toses / IA) | 1 | Conexión Analógica (ADC) |
| **Cámara Térmica AMG8833** | Heatmap de Bienestar Animal | 1 | I2C (8x8 Pixels) |

## 📡 Protocolo de Comunicación

Utilizaremos **MQTT** sobre AWS IoT Core. El ESP32 enviará mensajes JSON con el siguiente formato:

```json
{
  "clientId": "GALPON_A1",
  "sensors": {
    "temperature": 24.5,
    "humidity": 65,
    "ammonia_nh3": 15.2,
    "water_impedance": 1050, 
    "current_draw": 1.2,
    "motion_detected": false,
    "door_locked": true,
    "poza_level": 85,
    "feeder_status": "OPEN",
    "drinker_flow": "ON",
    "cough_count": 5
  },
  "timestamp": "2026-01-24T15:00:00Z"
}
```

## 🏗️ Esquema de Conexión (MVP)
1. **INPUTS**: Pines GPIO (Pull-up) para sensores magnéticos de puertas.
2. **OUTPUTS**: Pines GPIO controlando el módulo de Relés para luces.
3. **LOGIC**: El ESP32 publica en el topic `redondos/telemetry/galpon_id` y se suscribe a `redondos/commands/galpon_id` para recibir órdenes del Twin.
