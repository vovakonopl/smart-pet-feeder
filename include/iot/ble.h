#pragma once

#include <Arduino.h>

class BleManager {
    String receivedData;

public:
    BleManager();

    // initialises the Bluetooth
    static void init();

    // handles connections and data reading (should be called inside the loop function)
    void handle();
};

// global object
inline BleManager bleManager;
