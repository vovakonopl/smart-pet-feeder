#include <Arduino.h>

#include "rgb_led.h"

RgbLed::RgbLed(uint8_t pinR, uint8_t pinG, uint8_t pinB) {
    this->pinR = pinR;
    this->pinG = pinG;
    this->pinB = pinB;
}

void RgbLed::setup() const {
    pinMode(pinR, OUTPUT);
    pinMode(pinG, OUTPUT);
    pinMode(pinB, OUTPUT);
}

void RgbLed::setColor(const uint8_t red, const uint8_t green, const uint8_t blue) const {
    analogWrite(this->pinR, red);
    analogWrite(this->pinG, green);
    analogWrite(this->pinB, blue);
}

void RgbLed::turnOff() const {
    this->setColor(0, 0, 0);
}
