#pragma once

#include <cstdint>
#include <cstddef>

class ServoGate {
    uint8_t pin;
    
    // Logic state
    uint16_t timeoutMs;
    uint32_t openedAtMs; // changed to uint32_t to match to_ms_since_boot result type
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

private:
    void writeAngle(uint8_t angle);
    void setPwm(uint16_t pulseUs);
};