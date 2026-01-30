#include "iot/wifi.h"
#include <cstdio>
#include "pico/stdlib.h"
#include "pico/cyw43_arch.h"

#include "constants/pins.h"
#include "storage/wifi_config.h"
#include "constants/wifi_config_limits.h"
#include "iot/wifi_status_led.h"

namespace {
    WifiStatusLed statusLed(WIFI_STATUS_NEOPIXEL_LED_PIN);
}

WifiManager wifiManager;

WifiConfig::WifiConfig() {
    this->ssid = "";
    this->password = "";
}

bool WifiConfig::isValid() const {
    if (ssid.length() < minSsidLen || ssid.length() > maxSsidLen) return false; // invalid ssid

    // password must be empty string or with specified length limits
    return
        password.length() == 0 ||
        (password.length() >= minPasswordLen && password.length() <= maxPasswordLen);
}

bool WifiConfig::equals(const WifiConfig& other) const {
    return ssid == other.ssid && password == other.password;
}

WifiManager::WifiManager() {
    this->onConnectionResultCb = nullptr;
    this->status = WifiStatus::Disconnected;
    this->lastConnectionAttemptMs = 0;
}

void WifiManager::init() {
    // Cyw43 arch must be initialized by main
    cyw43_arch_enable_sta_mode();

    statusLed.setup();

    WifiConfig config;
    if (storage::wifiConfig::load(config)) {
        this->currentConfig = config;
        this->reconnect();
    } else {
        printf("No valid WiFi config found.\n");
    }
}

void WifiManager::connect(const WifiConfig &config) {
    if(!config.isValid()) {
        printf("Invalid WiFi config.\n");
        return;
    }

    // Check if we are already connected to this SSID
    // Note: cyw43_wifi_link_status can tell us if we are connected, 
    // but not strictly which SSID without more work. 
    // For now, we trust our internal tracking or force reconnect.

    printf("Connecting to %s...\n", config.ssid.c_str());
    
    int err = cyw43_arch_wifi_connect_async(config.ssid.c_str(), config.password.c_str(), CYW43_AUTH_WPA2_AES_PSK);
    if (err) {
        printf("Failed to start connection: %d\n", err);
        return;
    }

    this->status = WifiStatus::Connecting;
    this->lastTriedConfig = config;
    this->lastConnectionAttemptMs = to_ms_since_boot(get_absolute_time());
}

void WifiManager::connect(const WifiConfig &config, void (*cb)(WifiStatus)) {
    if(!config.isValid()) return;

    this->status = WifiStatus::Connecting;
    this->onConnectionResult(cb);
    this->connect(config);
}

void WifiManager::reconnect() {
    this->connect(this->currentConfig);
}

void WifiManager::handleStatus() {
    int link_status = cyw43_tcpip_link_status(&cyw43_state, CYW43_ITF_STA);
    bool is_connected = (link_status == CYW43_LINK_UP);

    if (this->status == WifiStatus::Connecting && is_connected) {
        this->status = WifiStatus::Connected;
        printf("WiFi Connected!\n");
    }

    constexpr uint32_t connectionTimeoutMs = 10000;
    if (
        this->status == WifiStatus::Connecting &&
        (to_ms_since_boot(get_absolute_time()) - this->lastConnectionAttemptMs >= connectionTimeoutMs) &&
        !is_connected
    ) {
        printf("WiFi Connect Timeout.\n");
        this->status = WifiStatus::Disconnected;
    }

    static WifiStatus prevState = WifiStatus::Connecting;
    if (
        this->status != WifiStatus::Connecting &&
        prevState != this->status &&
        this->onConnectionResultCb
    ) {
        this->onConnectionResultCb(this->status);

        if (this->status == WifiStatus::Connected) {
            this->clearOnConnectionResult();
        }
    }
    prevState = this->status;

    if (
        this->status == WifiStatus::Connected
        && !this->lastTriedConfig.equals(this->currentConfig)
    ) {
        this->currentConfig = this->lastTriedConfig;
        
        storage::wifiConfig::store(this->currentConfig);
        
        // Reboot? Original code did rp2040.restart().
        // Maybe we don't need to reboot, but if we do:
        // watchdog_reboot(0, 0, 0); 
    }

    if (this->status == WifiStatus::Connected && !is_connected) {
        this->status = WifiStatus::Disconnected;
        printf("WiFi Connection Lost.\n");
    } else if (this->status == WifiStatus::Disconnected && is_connected) {
        this->status = WifiStatus::Connected;
        printf("WiFi Reconnected.\n");
    }

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