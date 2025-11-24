#include <WiFi.h>

#include "iot/wifi.h"

#include "constants/pins.h"
#include "storage/wifi_config.h"
#include "constants/wifi_config_limits.h"
#include "iot/wifi_status_led.h"

// RGB status LED
WifiStatusLed statusLed(WIFI_STATUS_NEOPIXEL_LED_PIN);

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
    this->onConnectionResultCb = nullptr;
    this->status = WifiStatus::Disconnected;
    this->lastConnectionAttemptMs = 0;
}

void WifiManager::init() {
    statusLed.setup();
    WiFi.mode(WIFI_STA);

    WifiConfig config;
    storage::wifiConfig::load(config); // load from storage
    this->currentConfig = config;

    this->reconnect();
}

void WifiManager::connect(const WifiConfig &config) {
    if(!config.isValid()) return;

    // if already connected to the specified network
    if (this->currentConfig.ssid.equals(config.ssid) && WiFi.status() == WL_CONNECTED) {
        this->status = WifiStatus::Connected;
        this->onConnectionResultCb(WifiStatus::Connected);
        this->clearOnConnectionResult();

        return;
    }

    WiFi.begin(config.ssid.c_str(), config.password.c_str());
    this->status = WifiStatus::Connecting;
    this->lastTriedConfig = config;
    this->lastConnectionAttemptMs = millis();
}

void WifiManager::connect(const WifiConfig &config, void (*cb)(WifiStatus)) {
    if(!config.isValid()) return;

    // guarantee that event will be fired after connection attempt will begin
    this->status = WifiStatus::Connecting;
    this->onConnectionResult(cb);
    this->connect(config);
}

void WifiManager::reconnect() {
    this->connect(this->currentConfig);
}

void WifiManager::handleStatus() {
    // Connection successful.
    if (this->status == WifiStatus::Connecting && WiFi.status() == WL_CONNECTED) {
        this->status = WifiStatus::Connected;
    }

    // connection timed out
    constexpr uint16_t connectionTimeoutMs = 10000;
    if (
        this->status == WifiStatus::Connecting &&
        millis() - this->lastConnectionAttemptMs >= connectionTimeoutMs
    ) {
        this->status = WifiStatus::Disconnected;
    }

    // handle connection result
    static WifiStatus prevState = WifiStatus::Connecting;
    if (
        this->status != WifiStatus::Connecting && // Wi-Fi status defined
        prevState != this->status && // state changed
        this->onConnectionResultCb // callback available
    ) {
        this->onConnectionResultCb(this->status);

        /*
         * NOTE:
         * Since it is not possible to notify the user
         * whether the connection failed due to a timeout or invalid data,
         * we notify them with an error message after a timeout.
         * However, if the connection is successful later,
         * we will notify them again and remove the callback.
        */
        if (this->status == WifiStatus::Connected) {
            this->clearOnConnectionResult();
        }
    }
    prevState = this->status;

    // save config on successful connection
    if (
        this->status == WifiStatus::Connected
        && !this->lastTriedConfig.equals(this->currentConfig)
    ) {
        this->currentConfig = this->lastTriedConfig;
        auto test = storage::wifiConfig::store(this->lastTriedConfig);

        Serial.println(test ? "saved" : "couldn't save");

        // TODO: replace with function, which will save all data first and then restart
        rp2040.restart();
    }
    // TODO: reconnect to last working WiFI on fail (+ forced to restart anyway).
    //  Notify about restart with BLE

    if (this->status == WifiStatus::Connected && WiFi.status() == WL_DISCONNECTED) {
        // Connection lost
        this->status = WifiStatus::Disconnected;
    } else if (this->status == WifiStatus::Disconnected && WiFi.status() == WL_CONNECTED) {
        // Reconnected
        this->status = WifiStatus::Connected;
    }

    // display status with LED
    statusLed.displayStatus(this->status);
}

void WifiManager::onConnectionResult(void (*cb)(WifiStatus)) {
    this->onConnectionResultCb = cb;
}

void WifiManager::clearOnConnectionResult() {
    this->onConnectionResultCb = nullptr;
}

WifiStatus WifiManager::getStatus() const {
    return this->status;
};