#include <WiFi.h>

#include "iot/wifi.h"
#include "storage/wifi_config.h"
#include "constants/wifi_config_limits.h"

// Wi-Fi config
WifiConfig::WifiConfig() {
    this->ssid = "";
    this->password = "";
}

bool WifiConfig::isValid() const {
    return ssid.length() >= minSsidLen &&
        ssid.length() <= maxSsidLen &&
        password.length() >= minPasswordLen &&
        password.length() <= maxPasswordLen;
}

bool WifiConfig::equals(const WifiConfig& other) const {
    return ssid.equals(other.ssid) && password.equals(other.password);
}

// Wi-Fi manager
WifiManager::WifiManager() {
    this->onConnectCb = nullptr;
    this->status = WifiStatus::Disconnected;
    storage::wifiConfig::load(this->currentConfig); // load from storage
}

void WifiManager::init() {
    WiFi.mode(WIFI_STA);
    this->reconnect();
}

void WifiManager::connect(const WifiConfig &config) {
    if(!config.isValid()) return;

    WiFi.begin(config.ssid.c_str(), config.password.c_str());
    this->status = WifiStatus::Connecting;
    this->lastTriedConfig = config;
}

void WifiManager::connect(const WifiConfig &config, void (*cb)(WifiStatus)) {
    if(!config.isValid()) return;

    // guarantee that event will be fired after connection attempt will begin
    this->status = WifiStatus::Connecting;
    this->onConnect(cb);
    this->connect(config);
}

void WifiManager::reconnect() {
    this->connect(this->currentConfig);
}

// TODO: fix status handling (connecting state is incorrect)
void WifiManager::handleStatus() {
    switch (WiFi.status()) {
        case WL_CONNECTED:
            if (this->status != WifiStatus::Connected) {
                Serial.println("Connected");
            }

            this->status = WifiStatus::Connected;
            break;

        case WL_IDLE_STATUS:
            if (this->status != WifiStatus::Connecting) {
                Serial.println("Connecting");
            }

            this->status = WifiStatus::Connecting;
            break;

        default:
            if (this->status != WifiStatus::Disconnected) {
                Serial.println("Disconnected");
            }

            this->status = WifiStatus::Disconnected;
    }

    // handle connection result
    if (this->onConnectCb && this->status != WifiStatus::Connecting) {
        this->onConnectCb(this->status);
        this->onConnectCb = nullptr;
    }

    // save config on successful connection
    if (
        this->status == WifiStatus::Connected
        && !this->lastTriedConfig.equals(this->currentConfig)
    ) {
        this->currentConfig = this->lastTriedConfig;
        storage::wifiConfig::store(this->lastTriedConfig);
    }

    // TODO: display status with LED
}

void WifiManager::onConnect(void (*cb)(WifiStatus)) {
    if (this->status != WifiStatus::Connecting) return;

    this->onConnectCb = cb;
}

WifiStatus WifiManager::getStatus() const {
    return this->status;
};
