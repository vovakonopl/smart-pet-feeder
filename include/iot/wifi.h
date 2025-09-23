#pragma once

#include <Arduino.h>

class WifiConfig {
public:
    WifiConfig();

    String ssid;
    String password;

    bool isValid() const;
    bool equals(const WifiConfig& other) const;
};

namespace wifi::limits {
    inline constexpr uint8_t minSsidLen = 1;
    inline constexpr uint8_t maxSsidLen = 32;
    inline constexpr uint8_t minPasswordLen = 8;
    inline constexpr uint8_t maxPasswordLen = 63;
}

enum class WifiStatus {
    Disconnected,
    Connecting,
    Connected,
};

class WifiManager {
    WifiStatus status;
    WifiConfig currentConfig; // current saved config
    WifiConfig lastTriedConfig; // last config that was tried to connect

    void (*onConnectResultCb)(WifiStatus);

public:
    WifiManager();

    void init();

    // auto reconnect to old config if provided was unsuccessful
    void connect(const WifiConfig &config);
    void connect(const WifiConfig &config, void (*cb)(WifiStatus)); // cb for onConnectResult
    void reconnect();

    // monitors the status of the connection (should be called inside loop function)
    void handle();

    // callback that will be called after connection is finished
    void onConnectResult(void (*cb)(WifiStatus));

    WifiStatus getStatus() const;
};

// global object
inline WifiManager wifiManager;

