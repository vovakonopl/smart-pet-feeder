# Smart Pet Feeder - Microcontroller Firmware

This directory contains the firmware for the Smart Pet Feeder, running on a **Raspberry Pi Pico W**. The project manages the feeding mechanism (Servo), timekeeping (RTC/NTP), and remote communication (WiFi/MQTT/BLE).

## 🔧 Technical Stack

- **Hardware:** Raspberry Pi Pico W
- **Framework:** Arduino (via PlatformIO)
- **Core:** `earlephilhower` Raspberry Pi Pico core
- **Dependencies:**
  - `ArduinoJson`: JSON parsing for config and state.
  - `PubSubClient`: MQTT communication.
  - `RTClib`: Interface for Real-Time Clock modules (e.g., DS3231).
  - `Adafruit NeoPixel`: Status LED control.
  - `NTPClient`: Network time synchronization.

## 📂 Project Structure

### Key Directories

- **`src/`**: Source code (`.cpp`).
  - **`main.cpp`**: Application entry point. Orchestrates setup and the main loop.
  - **`feeder/`**: Core logic for the feeder mechanism and scheduling.
  - **`iot/`**: Networking code (BLE, WiFi, MQTT).
  - **`modules/`**: Hardware drivers (Servo, RTC, LED).
  - **`storage/`**: Filesystem operations (LittleFS) for persisting config/schedule.
- **`include/`**: Header files (`.h`), mirroring the structure of `src/`.
  - **`secrets.h`**: **(Required)** Private credentials file.
- **`platformio.ini`**: PlatformIO configuration file (build flags, deps, monitor speed).

## 🚀 Setup & Configuration

### 1. Environment Setup

Ensure you have **PlatformIO** installed (VSCode extension or CLI).

### 2. Secrets Configuration

Create a `secrets.h` file in `include/` by copying the example:

```bash
cp include/secrets.example.h include/secrets.h
```

Edit `include/secrets.h` and provide the following:

- **MQTT Broker:** Host, Port, Username, Password.
- **Topic Prefix:** A unique prefix for your fleet (e.g., `home/feeder`).

### 3. Build & Upload

You can use the PlatformIO CLI or the VSCode integration.

**From the root `pet-feeder` directory (using Bun/NPM scripts):**

- **Build:** `bun run pio:build`
- **Upload:** `bun run pio:upload`
- **Monitor:** `bun run pio:monitor`

**From this directory (`microcontroller/`):**

- **Build:** `pio run`
- **Upload:** `pio run -t upload`
- **Monitor:** `pio run -t monitor`

## 📡 MQTT Interface

The device communicates via MQTT using topics constructed as: `<TOPIC_PREFIX>/<DEVICE_ID>/<ACTION>`.

| Topic Suffix       | Direction | Payload | Description                                                    |
| :----------------- | :-------- | :------ | :------------------------------------------------------------- |
| `state-req`        | Subscribe | (Empty) | Request the current device state.                              |
| `state-resp`       | Publish   | JSON    | The device's current state (Schedule, Last Fed Time).          |
| `feed-now`         | Subscribe | (Empty) | Trigger an immediate feeding.                                  |
| `next-feeding-now` | Subscribe | (Empty) | Reschedule the _next_ scheduled feeding to happen immediately. |
| `schedule-update`  | Subscribe | JSON    | Update the feeding schedule.                                   |

## 🧠 Core Logic

### Feeder Class (`feeder/feeder.h`)

- Manages the state of the feeding mechanism.
- Checks the `Schedule` against the current time (RTC).
- Controls the `ServoGate` to dispense food.
- Persists state to LittleFS.

### IoT Managers

- **`MqttManager`**: Handles connection to the broker, subscribes to command topics, and publishes state updates.
- **`BleManager`**: Used primarily for initial provisioning (setting WiFi credentials) via the mobile app.
- **`WifiManager`**: Manages WiFi connection and status LED indications.

## 💾 Storage

Configuration and state are saved to the Pico's flash memory using LittleFS:

- `utils.h`: Utility functions for LittleFS operations to check whether it mounted and atomically write JSON.
- `wifi.json`: WiFi credentials.
- `schedule.json`: Feeding schedule.
- `last_fed.txt`: Timestamp of the last successful feed.

## 📝 Rules & Coding Standards

- **Heap Fragmentation:** Consider this as a highest priority rule. Avoid dynamic memory allocation as much as possible to prevent heap fragmentation. Instead, define global objects or use static memory allocation. Dynamic allocation is allowed only in the `setup()` function. Using or creating optimized objects like `String` from Arduino, which won't be reallocated or will live for a short time is allowed.
- **File Naming:** Use snake_case for all C++ files (e.g., `feeder.cpp`, `wifi_manager.h`).
- **Class Naming:** Use PascalCase for all class names (e.g., `Feeder`, `WifiManager`).
- **Variable & Function Naming:** Use camelCase for all variables and functions (e.g., `feeder`, `wifiManager`).
- **Comments:** Add comments only when necessary because the code block is very complex or has confusing conditions. To avoid unnecessary comments, make the code self-documenting by using meaningful variable and function names and moving long or confusing conditions into well-named helper functions or local variables.
- **Code Style:**
  - Use `const` for all variables that are not modified.
  - Use `constexpr` for all variables and functions that are not modified and can be evaluated at compile time.
  - Use nameless namespaces `namespace {}` instead of `static` for all variables and functions that are only used in the current file.
