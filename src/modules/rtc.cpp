#include <Wire.h>

#include "modules/rtc.h"

RTC::RTC(const uint8_t sdaPin, const uint8_t sclPin) {
    this->sdaPin = sdaPin;
    this->sclPin = sclPin;
}

void RTC::init() {
    Wire.setSDA(this->sdaPin);
    Wire.setSCL(this->sclPin);
    Wire.begin();

    this->begin();

    if (this->lostPower()) {
        // upload time of the compilation moment
        this->adjust(DateTime(F(__DATE__), F(__TIME__)));
    }
}

uint16_t RTC::getDayMinutes() {
    const DateTime now = this->now();
    const uint16_t minutes = now.hour() * 60 + now.minute();

    return minutes;
}
