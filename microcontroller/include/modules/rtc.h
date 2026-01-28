#pragma once

#include <RTClib.h>

#include "constants/pins.h"

class RTC : public RTC_DS3231 {
private:
    uint8_t sdaPin;
    uint8_t sclPin;

public:
    RTC(uint8_t sdaPin, uint8_t sclPin);

    void init();

    uint16_t getDayMinutes();
    static uint16_t getDayMinutes(const DateTime &date);
    String getCurrentTimeISO();
    void fetchGMT();
};

inline RTC rtc(RTC_SDA_PIN, RTC_SCL_PIN);