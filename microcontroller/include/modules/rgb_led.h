#pragma once

#include <cstdint>
#include "hardware/pio.h"

class RgbLed {
private:
    uint8_t pin;
    PIO pio;
    uint sm;

public:
    explicit RgbLed(uint8_t pin);
    
    // Setup PIO
    void setup();
    
    // Set color (0-255)
    void setColor(uint8_t red, uint8_t green, uint8_t blue);
    
    void turnOff();

private:
    void putPixel(uint32_t pixel_grb);
};
