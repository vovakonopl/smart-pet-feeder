# 🐾 Smart Pet Feeder

A complete IoT solution for automated pet feeding with real-time control via mobile app. This monorepo contains both the microcontroller firmware and the mobile application.

## 📋 Overview

The Smart Pet Feeder is a connected device that allows you to schedule and control your pet's feeding times remotely. It features Bluetooth Low Energy (BLE) connectivity for local control, MQTT for remote monitoring, and a React Native mobile app for management.

## 🏗️ Project Structure

```
pet-feeder/
├── microcontroller/    # Raspberry Pi Pico W firmware
└── mobile/            # React Native mobile app
```

## 🔧 Microcontroller

**Hardware:** Raspberry Pi Pico W  
**Framework:** Arduino (PlatformIO)

### Tech Stack

- **Platform:** Raspberry Pi Pico W with Bluetooth support
- **Communication:**
  - BLE (Bluetooth Low Energy) for local device control
  - MQTT for remote messaging
  - WiFi connectivity
- **Hardware Modules:**
  - RTC (Real-Time Clock) for accurate scheduling
  - Servo motor for gate control
  - NeoPixel RGB LED for status indication

### Features

- ⏰ Scheduled feeding with RTC
- 📱 BLE connectivity for mobile app
- 🌐 MQTT integration for remote control
- 💾 Persistent storage for schedules and WiFi config
- 🎨 RGB LED status indicators
- 🔄 NTP time synchronization

## 📱 Mobile App

**Platform:** iOS & Android  
**Framework:** Expo (React Native)

### Features

- 📡 BLE device pairing and control
- ⏱️ Schedule management with visual interface
- 🌓 Dark mode support
- 📊 Feeding history tracking
- ⚙️ WiFi configuration for device
- 🎨 Modern, responsive UI with NativeWind
