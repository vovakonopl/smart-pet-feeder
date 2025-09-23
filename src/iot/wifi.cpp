#include <WiFi.h>

#include "iot/wifi.h"
#include "storage/wifi_config.h"

// Wi-Fi config
WifiConfig::WifiConfig() {
    this->ssid = "";
    this->password = "";
}

bool WifiConfig::isValid() const {
    return ssid.length() >= wifi::limits::minSsidLen &&
        ssid.length() <= wifi::limits::maxSsidLen &&
        password.length() >= wifi::limits::minPasswordLen &&
        password.length() <= wifi::limits::maxPasswordLen;
}

bool WifiConfig::equals(const WifiConfig& other) const {
    return ssid.equals(other.ssid) && password.equals(other.password);
}

// Wi-Fi manager
WifiManager::WifiManager() {
    this->onConnectResultCb = nullptr;
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
    this->onConnectResult(cb);
    this->connect(config);
}

void WifiManager::reconnect() {
    this->connect(this->currentConfig);
}

void WifiManager::handle() {
    switch (WiFi.status()) {
        case WL_CONNECTED:
            this->status = WifiStatus::Connected;
            break;

        case WL_IDLE_STATUS:
            this->status = WifiStatus::Connecting;
            break;

        default:
            this->status = WifiStatus::Disconnected;
    }

    // handle connection result
    if (this->onConnectResultCb && this->status != WifiStatus::Connecting) {
        this->onConnectResultCb(this->status);
        this->onConnectResultCb = nullptr;
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

void WifiManager::onConnectResult(void (*cb)(WifiStatus)) {
    if (this->status != WifiStatus::Connecting) return;

    this->onConnectResultCb = cb;
}

WifiStatus WifiManager::getStatus() const {
    return this->status;
};
