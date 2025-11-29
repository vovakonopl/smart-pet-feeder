#pragma once

#include <Servo.h>

class ServoGate {
    uint8_t pin;
    Servo servo;

    uint16_t timeoutMs;
    size_t openedAtMs;
    bool isOpened;

    static constexpr uint8_t angleClosed = 0;
    static constexpr uint8_t angleOpen = 155;

public:
    explicit ServoGate(uint8_t pin);

    void setup();
    void loop(); // required to close gate with delay

    void open();
    void close();
    void openForMs(uint16_t ms); // will be closed after specified time (ms)
};