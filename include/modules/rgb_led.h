#pragma once

#include "Adafruit_NeoPixel.h"

class RgbLed {
private:
    Adafruit_NeoPixel pixels;

public:
    explicit RgbLed(uint8_t pin);

    void setup();
    void setColor(uint8_t red, uint8_t green, uint8_t blue);
    void turnOff();
};
