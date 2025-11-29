#include "modules/servo_gate.h"

ServoGate::ServoGate(const uint8_t pin) {
    this->pin = pin;
    this->isOpened = false;
    this->openedAtMs = 0;
    this->timeoutMs = 0;
}

void ServoGate::setup() {
    servo.attach(pin);
    close();
}

void ServoGate::loop() {
    if (!this->isOpened) return;
    if (millis() < this->openedAtMs + this->timeoutMs) return;

    this->close();
}

void ServoGate::open() {
    servo.write(ServoGate::angleOpen);
    this->isOpened = true;
    Serial.println("Opened");
}

void ServoGate::close() {
    servo.write(ServoGate::angleClosed);
    this->isOpened = false;
    Serial.println("Closed");
}

void ServoGate::openForMs(const uint16_t ms) {
    this->openedAtMs = millis();
    this->timeoutMs = ms;

    this->open();
}
