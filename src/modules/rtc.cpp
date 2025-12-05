#include <Wire.h>

#include "modules/rtc.h"

namespace {
    String getTwoDigitsStr(const int num) {
        String res = "";
        if (num < 10) {
            res += '0';
        }

        res += num;

        return res;
    }
}

RTC::RTC(const uint8_t sdaPin, const uint8_t sclPin) {
    this->sdaPin = sdaPin;
    this->sclPin = sclPin;
}

void RTC::init() {
    Wire.setSDA(this->sdaPin);
    Wire.setSCL(this->sclPin);
    Wire.begin();

    this->begin();

    // TODO: REMOVE! Fetch GMT time when connected to WiFi
    this->adjust(DateTime(F(__DATE__), F(__TIME__)));
    Serial.println(String(F(__DATE__)) + " + " + F(__TIME__));
    if (this->lostPower()) {
        Serial.println("Power loss occurred");
        // upload time of the compilation moment
        this->adjust(DateTime(F(__DATE__), F(__TIME__)));
    }
}

uint16_t RTC::getDayMinutes() {
    const DateTime now = this->now();
    const uint16_t minutes = now.hour() * 60 + now.minute();

    return minutes;
}

uint16_t RTC::getDayMinutes(const DateTime &date) {
    const uint16_t minutes = date.hour() * 60 + date.minute();

    return minutes;
}

// YYYY-MM-DDTHH:MM:SSZ
String RTC::getCurrentTimeISO() {
    const DateTime now = this->now();
    String timeString = "";

    Serial.print("Current time: ");
    Serial.println(String(now.hour()) + ":" + now.minute());

    // YYYY-MM-DD
    timeString += now.year();
    timeString += '-';
    timeString += getTwoDigitsStr(now.month());
    timeString += '-';
    timeString += getTwoDigitsStr(now.day());

    timeString += 'T';

    // HH:MM:SS
    timeString += getTwoDigitsStr(now.hour());
    timeString += ':';
    timeString += getTwoDigitsStr(now.minute());
    timeString += ':';
    timeString += getTwoDigitsStr(now.second());

    timeString += 'Z';

    Serial.print("ISO: ");
    Serial.println(timeString);

    return timeString;
}
