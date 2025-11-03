#pragma once

#include <Arduino.h>

class WifiConfig {
public:
    WifiConfig();

    String ssid;
    String password;

    bool isValid() const;
    bool equals(const WifiConfig &other) const;
};

enum class WifiStatus {
    Disconnected,
    Connecting,
    Connected,
};

class WifiManager {
    WifiStatus status;
    // WifiConfig enqueuedConfig; // config to be applied on next attempt
    WifiConfig currentConfig; // current saved config
    WifiConfig lastTriedConfig; // last config that was tried to connect
    size_t lastConnectionAttemptMs;

    void (*onConnectionResultCb)(WifiStatus);

public:
    WifiManager();

    void init();

    // auto reconnect to old config if provided was unsuccessful
    void connect(const WifiConfig &config);
    void connect(const WifiConfig &config, void (*cb)(WifiStatus)); // cb for onConnectResult
    void reconnect();

    // monitors the status of the connection (should be called inside loop function)
    void handleStatus();

    // callback that will be called after connection is finished
    void onConnectionResult(void (*cb)(WifiStatus));
    void clearOnConnectionResult();

    WifiStatus getStatus() const;

    // void enqueueConfig(const WifiConfig &config, void (*cb)(WifiStatus));
};

// global object
inline WifiManager wifiManager;

