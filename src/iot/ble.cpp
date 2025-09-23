#include <ArduinoJson.h>
#include <SerialBT.h>

#include "constants/device_name.h"
#include "iot/ble.h"
#include "iot/wifi.h"

// local utils
static void handleConnection(const WifiStatus status) {
    switch (status) {
        case WifiStatus::Disconnected:
            SerialBT.println(R"({"status":"ERROR","reason":"wifi"})");
            break;

        case WifiStatus::Connected:
            SerialBT.println(R"({"status":"OK"})");
            break;

        default:
            return;
    }
}

BleManager::BleManager() {
    // avoid reallocation by reserving some memory
    constexpr uint16_t reservedCount = 256;
    this->receivedData.reserve(reservedCount);
}

void BleManager::init() {
    SerialBT.setName(deviceName);
    SerialBT.begin();
}

void BleManager::handle() {
    if (!SerialBT) return;

    while (SerialBT.available()) {
        char ch = SerialBT.read();
        if (ch != '\n') {
            this->receivedData += ch;
            continue;
        }

        // received full json string
        Serial.printf("Got line: %s\n", this->receivedData.c_str());

        // try to parse
        JsonDocument doc;
        DeserializationError err = deserializeJson(doc, this->receivedData);
        if (err) {
            SerialBT.println(R"({"status":"ERROR","reason":"json"})");
            this->receivedData.remove(0); // clear the buffer
            continue;
        }

        WifiConfig config;
        config.ssid = doc["ssid"].as<String>();
        config.password = doc["password"].as<String>();
        Serial.printf("SSID='%s', PASS='%s'\n", config.ssid.c_str(), config.password.c_str());

        if (!config.isValid()) {
            SerialBT.println(R"({"status":"ERROR","reason":"invalid data"})");
            this->receivedData.remove(0); // clear the buffer
            continue;
        }

        wifiManager.connect(config, &handleConnection);
        this->receivedData.remove(0); // clear the buffer
    }
}
