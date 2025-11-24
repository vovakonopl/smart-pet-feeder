#include <Arduino.h>

#include "modules/rgb_led.h"

RgbLed::RgbLed(const uint8_t pin) : pixels(1, pin, NEO_GRB + NEO_KHZ800) {}

void RgbLed::setup() {
    this->pixels.begin();
    this->pixels.setBrightness(50);
    this->turnOff();
}

void RgbLed::turnOff() {
    this->pixels.clear();
    this->pixels.show();
}

void RgbLed::setColor(const uint8_t red, const uint8_t green, const uint8_t blue) {
    pixels.setPixelColor(0, Adafruit_NeoPixel::Color(red, green, blue));
    pixels.show();
}
