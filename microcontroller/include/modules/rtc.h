#pragma once

#include <cstdint>
#include <string>

// Simple DateTime structure compatible with typical RTC usage
struct DateTime {
    uint16_t year;
    uint8_t month;
    uint8_t day;
    uint8_t hour;
    uint8_t minute;
    uint8_t second;

    DateTime(uint16_t year, uint8_t month, uint8_t day, uint8_t hour, uint8_t minute, uint8_t second)
        : year(year), month(month), day(day), hour(hour), minute(minute), second(second) {}
        
    DateTime(uint32_t epochTime); // Construct from unix timestamp
    DateTime() : year(2000), month(1), day(1), hour(0), minute(0), second(0) {}
    
    uint32_t unixtime() const;
};

class RTC {
private:
    uint8_t sdaPin;
    uint8_t sclPin;

public:
    RTC(uint8_t sdaPin, uint8_t sclPin);

    void init();
    
    DateTime now();
    void adjust(const DateTime& dt);
    bool lostPower(); // Check OSF bit

    uint16_t getDayMinutes();
    static uint16_t getDayMinutes(const DateTime &date);
    std::string getCurrentTimeISO();
    
    // Trigger NTP sync (requires WiFi)
    void fetchGMT();
};

extern RTC rtc;