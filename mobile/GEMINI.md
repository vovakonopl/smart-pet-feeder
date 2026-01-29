# Pet Feeder Mobile App Context

## 📱 Project Overview

This directory contains the source code for the **Mobile Application** of the Smart Pet Feeder project. It is built with **React Native** and **Expo**, designed to control the feeder hardware.

The app serves two primary functions:

1.  **Provisioning (Local):** Uses **BLE (Bluetooth Low Energy)** to connect to a new Feeder, configure its WiFi credentials, and link it to the app.
2.  **Control (Remote):** Uses **MQTT** to communicate with the Feeder over the internet. Features include viewing/editing the feeding schedule, manual feeding, and checking the last fed time.

## 🛠 Tech Stack

- **Framework:** [Expo](https://expo.dev/) (SDK 54) + [React Native](https://reactnative.dev/) (0.81.4)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **State Management:** [MobX](https://mobx.js.org/) (Reactive state)
- **Styling:** [NativeWind](https://www.nativewind.dev/) v4 (Tailwind CSS for React Native)
- **UI Components:**
  - Icons: `lucide-react-native`
  - Toasts: `sonner-native`
  - Fonts: `NunitoSans` & `OpenSans` (@expo-google-fonts)
  - Prestyled components: `nativewindUI`
- **Connectivity:**
  - BLE: `react-native-ble-plx`
  - WiFi: `react-native-wifi-reborn`
  - MQTT: `mqtt` (v5)
- **Storage:** `@react-native-async-storage/async-storage`

## 📂 Key Directory Structure

```text
mobile/
├── app/                  # Expo Router pages & layouts
│   ├── _layout.tsx       # Root layout (Providers, Navigation Stack)
│   ├── index.tsx         # Main Screen (Feeding Schedule)
│   └── device-config/    # Device Setup Screens (BLE Scanning, WiFi Config)
├── src/
│   ├── components/       # Reusable UI components (Buttons, Inputs, etc.)
│   ├── lib/              # Logic & Utilities
│   │   ├── ble/          # BLE State & GATT logic
│   │   ├── mqtt/         # MQTT Service & Polyfills
│   │   └── validation/   # Zod Schemas
│   └── store/            # MobX Stores
│       └── device-store.ts # MAIN LOGIC: Manages device state, MQTT sync, & actions
├── assets/               # Images & Icons
└── package.json          # Dependencies & Scripts
```

## 📐 Architecture & Logic

### 1. State Management (`device-store.ts`)

The `deviceStore` is a singleton that manages the application state.

- **Initialization:** Loads persisted state (schedule, deviceId) from `AsyncStorage`.
- **Syncing:** Maintains `isSynced` and `isSyncError` flags. Automatically retries syncing with the hardware via MQTT if the connection is lost or requests time out.
- **Actions:** Methods like `feedNow()`, `updateSchedule()`, `setDeviceId()` trigger MQTT messages to the broker.

### 2. Navigation

- **Root (`app/_layout.tsx`):** Sets up the `Stack` navigator.
- **Home (`app/index.tsx`):** Displays the feeding schedule and status.
- **Config (`app/device-config/`):** Handles the flow for finding a device via BLE and sending WiFi credentials.

### 3. Connectivity

- **MQTT:** Used for "Steady State" operation. The app subscribes to device topics to receive real-time updates (e.g., "Fed successfully").
- **BLE:** Used _only_ for initial setup to bridge the gap before the device has WiFi access.

## 🚀 Build & Run

**Prerequisites:**

- **Bun** is the preferred package manager. No other package managers are allowed.
- **Development Build:** Since this project uses Native Modules (`ble-plx`, `wifi-reborn`), it **cannot** run in the standard "Expo Go" client. You must build a custom Dev Client. For testing, build dev client for android if ios wasn't requested in the prompt.

**Commands:**

| Command            | Description                                                      |
| :----------------- | :--------------------------------------------------------------- |
| `bun install`      | Install dependencies                                             |
| `bun run prebuild` | Generate native android/ios folders (do not edit these manually) |
| `bun run android`  | Build/Run the Dev Client on Android Emulator or Device           |
| `bun run ios`      | Build/Run the Dev Client on iOS Simulator or Device              |
| `bun run start`    | Start the Metro Bundler (after Dev Client is installed)          |

## 📝 Development Conventions

- **Styling:** Use Tailwind classes via the `className` prop.
  - _Example:_ `<View className="flex-1 bg-background p-4">`
- **Store Access:** Import `deviceStore` directly from `@/src/store/device-store`. Use `observer` from `mobx-react-lite` for components that need to react to state changes.
- **Icons:** Use the `Icon` wrapper component: `<Icon icon={Bluetooth} size={24} />`.
- **Files:** Prefer creating small, focused components in `src/components` or co-located `_components` folders within `app`.
- **Comments:** Add comments only when necessary because the code block is very complex or has confusing conditions. To avoid unnecessary comments, make the code self-documenting by using meaningful variable and function names and moving long or confusing conditions into well-named helper functions or local variables.
- **Code Style:**
  - React components should be an arrow functions.
  - Page components should be a plain functional components.
  - Use `observer` from `mobx-react-lite` for components that need to react to state changes.
  - All tsx files with components must be named with PascalCase.
  - All files with hooks must be named with camelCase and start with `use`.
  - All hooks and components files must have the same name as a main exported hook or component.

## ⚠️ Known Issues / Notes

- **BLE Permissions:** Ensure your testing device has granted Bluetooth and Location permissions, or scanning will fail silently or throw errors.
- **Polyfills:** `text-encoding` and other polyfills are imported in `src/lib/mqtt/polyfills.ts` to support the MQTT library in the React Native environment.
