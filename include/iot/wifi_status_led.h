#pragma once

#include "modules/rgb_led.h"
#include "wifi.h"

class WifiStatusLed : public RgbLed {
public:
    explicit WifiStatusLed(const uint8_t pin) : RgbLed(pin) {};
    void displayStatus(WifiStatus status);
};
