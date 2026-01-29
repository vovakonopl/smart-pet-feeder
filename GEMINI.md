# Smart Pet Feeder Project Context

## 📋 Project Overview
This project is a comprehensive IoT solution for an automated pet feeder, consisting of two main components:
1.  **Microcontroller Firmware:** C++ code running on a Raspberry Pi Pico W, managing hardware (Servo, RTC, LEDs) and communications (BLE, WiFi, MQTT).
2.  **Mobile Application:** A React Native (Expo) app for iOS and Android that controls the feeder via BLE (local) and MQTT (remote).

The project is structured as a **Bun workspace**.

## 📂 Directory Structure
- `microcontroller/`: Firmware source code (PlatformIO project).
- `mobile/`: Mobile application source code (Expo/React Native).
- `package.json`: Root scripts to manage both projects.

---

## 🔧 Microcontroller (Firmware)

### Tech Stack
- **Hardware:** Raspberry Pi Pico W
- **Framework:** Arduino (via PlatformIO)
- **Core:** `earlephilhower` Raspberry Pi Pico core
- **Key Libraries:**
  - `ArduinoJson` (JSON parsing)
  - `RTClib` (Real-Time Clock management)
  - `PubSubClient` (MQTT)
  - `Adafruit NeoPixel` (Status LEDs)
  - `NTPClient` (Time sync)

### Setup & Configuration
1.  **Secrets:** You must configure the `secrets.h` file.
    -   Copy `microcontroller/include/secrets.example.h` to `microcontroller/include/secrets.h`.
    -   Fill in your WiFi credentials, MQTT broker details, etc.

### Build & Run Commands (from Root)
- **Build Firmware:** `bun run pio:build`
- **Upload to Device:** `bun run pio:upload`
- **Serial Monitor:** `bun run pio:monitor`
- **Upload & Monitor:** `bun run pio:upload-monitor`

*(Alternatively, standard `pio run` commands can be used inside the `microcontroller` directory)*

---

## 📱 Mobile Application

### Tech Stack
- **Framework:** Expo (React Native)
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS)
- **State Management:** MobX
- **Navigation:** Expo Router
- **Key Native Modules:**
  - `react-native-ble-plx` (Bluetooth Low Energy)
  - `react-native-wifi-reborn` (WiFi scanning/management)
  - `mqtt` (Remote communication)

### Development
Since this app uses native modules (BLE, WiFi), it **cannot** run fully in the standard "Expo Go" app. You generally need to create a **Development Build**.

### Build & Run Commands (from Root)
- **Install Dependencies:** `bun install`
- **Start Metro Bundler:** `bun run start`
- **Run on Android:** `bun run android` (Triggers prebuild if needed)
- **Run on iOS:** `bun run ios`
- **Prebuild Native Code:** `bun run prebuild`

---

## 📐 Architecture & Communication

### 1. Bluetooth Low Energy (BLE)
- **Role:** Local provisioning and control.
- **Flow:** The Mobile App scans for the Feeder (Peripheral). Upon connection, it can read/write characteristics to set WiFi credentials or Schedule data.
- **Service:** The Pico W exposes a custom GATT service.

### 2. MQTT (Remote Control)
- **Role:** Remote monitoring and control when the user is not home.
- **Flow:** The Feeder connects to an MQTT broker over WiFi. The App subscribes/publishes to topics to trigger manual feeding or update settings remotely.

### 3. Hardware Logic
- **Scheduling:** Uses an external RTC (Real-Time Clock) module or NTP-synced internal clock to trigger the Servo motor at specific times.
- **Storage:** Schedules and WiFi configs are persisted in the Pico's filesystem (LittleFS).

## 📝 Development Guidelines
- **Package Manager:** Use **Bun** for all node package interactions.
- **Styling:** Use `className` with Tailwind classes (NativeWind) for all React Native components.
- **Formatting:** Prettier is configured. Run formatting before committing.
