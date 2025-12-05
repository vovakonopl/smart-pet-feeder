#include <Wire.h>
#include <ctime>
#include <WiFiUdp.h>
#include <NTPClient.h>

#include "iot/wifi.h"
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

    void fetchGMTOnWifiConnect(WifiStatus status) {
        Serial.println("fetchGMT onWifiConnect CB");
        rtc.fetchGMT();
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

    // upload time of the compilation moment to avoid unexpected behaviour
    if (this->lostPower()) {
        this->adjust(DateTime(F(__DATE__), F(__TIME__)));
    }

    wifiManager.onConnectionResult(fetchGMTOnWifiConnect);
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

    return timeString;
}

void RTC::fetchGMT() {
    if (wifiManager.getStatus() != WifiStatus::Connected) {
        Serial.println("Cannot sync time: No WiFi.");
        return;
    }

    Serial.println("Syncing time (Temporary NTP Client)...");

    WiFiUDP ntpUDP;
    NTPClient timeClient(ntpUDP, "pool.ntp.org", 0);
    timeClient.begin();

    if (!timeClient.forceUpdate()) {
        Serial.println("NTP update failed");
        timeClient.end();
        return;
    }

    const unsigned long epochTime = timeClient.getEpochTime();
    this->adjust(DateTime(epochTime));

    Serial.print("Time synced: ");
    Serial.println(epochTime);
    Serial.println(this->getCurrentTimeISO());
    Serial.println(this->getDayMinutes());

    timeClient.end();
}