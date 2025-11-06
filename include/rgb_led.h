#pragma once

#include <cstdint>

class RgbLed {
private:
    uint8_t pinR;
    uint8_t pinG;
    uint8_t pinB;

public:
    RgbLed(uint8_t pinR, uint8_t pinG, uint8_t pinB);

    void setup() const;
    void setColor(uint8_t red, uint8_t green, uint8_t blue) const;
    void turnOff() const;
};
