#pragma once

#include "rgb_led.h"
#include "wifi.h"

class WifiStatusLed : public RgbLed {
public:
    WifiStatusLed(uint8_t pinR, uint8_t pinG, uint8_t pinB) : RgbLed(pinR, pinG, pinB) {};
    void displayStatus(WifiStatus status) const;
};
