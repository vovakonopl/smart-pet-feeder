#include "modules/rtc.h"
#include <cstdio>
#include <ctime>
#include "hardware/i2c.h"
#include "hardware/gpio.h"
#include "pico/stdlib.h"

namespace {
    constexpr uint8_t ds3231Address = 0x68;

    uint8_t bcd2bin(uint8_t val) { return val - 6 * (val >> 4); }
    uint8_t bin2bcd(uint8_t val) { return val + 6 * (val / 10); }
}

RTC rtc(RTC_SDA_PIN, RTC_SCL_PIN);

DateTime::DateTime(uint32_t epoch) {
    time_t rawtime = static_cast<time_t>(epoch);
    struct tm* ti = gmtime(&rawtime);
    year = ti->tm_year + 1900;
    month = ti->tm_mon + 1;
    day = ti->tm_mday;
    hour = ti->tm_hour;
    minute = ti->tm_min;
    second = ti->tm_sec;
}

uint32_t DateTime::unixtime() const {
    struct tm t;
    t.tm_year = year - 1900;
    t.tm_mon = month - 1;
    t.tm_mday = day;
    t.tm_hour = hour;
    t.tm_min = minute;
    t.tm_sec = second;
    t.tm_isdst = 0;
    return static_cast<uint32_t>(mktime(&t));
}

RTC::RTC(const uint8_t sdaPin, const uint8_t sclPin) {
    this->sdaPin = sdaPin;
    this->sclPin = sclPin;
}

void RTC::init() {
    i2c_init(i2c_default, 100 * 1000);
    
    gpio_set_function(sdaPin, GPIO_FUNC_I2C);
    gpio_set_function(sclPin, GPIO_FUNC_I2C);
    
    gpio_pull_up(sdaPin);
    gpio_pull_up(sclPin);
}

DateTime RTC::now() {
    uint8_t reg = 0x00;
    i2c_write_blocking(i2c_default, ds3231Address, &reg, 1, true);
    
    uint8_t buf[7];
    i2c_read_blocking(i2c_default, ds3231Address, buf, 7, false);

    uint8_t ss = bcd2bin(buf[0] & 0x7F);
    uint8_t mm = bcd2bin(buf[1]);
    uint8_t hh = bcd2bin(buf[2]);
    uint8_t d  = bcd2bin(buf[4]);
    uint8_t m  = bcd2bin(buf[5] & 0x7F);
    uint16_t y = bcd2bin(buf[6]) + 2000;

    return DateTime(y, m, d, hh, mm, ss);
}

void RTC::adjust(const DateTime& dt) {
    uint8_t buf[8];
    buf[0] = 0x00;
    buf[1] = bin2bcd(dt.second);
    buf[2] = bin2bcd(dt.minute);
    buf[3] = bin2bcd(dt.hour);
    buf[4] = 0;
    buf[5] = bin2bcd(dt.day);
    buf[6] = bin2bcd(dt.month);
    buf[7] = bin2bcd(dt.year - 2000);

    i2c_write_blocking(i2c_default, ds3231Address, buf, 8, false);
}

bool RTC::lostPower() {
    uint8_t reg = 0x0F;
    i2c_write_blocking(i2c_default, ds3231Address, &reg, 1, true);
    
    uint8_t status;
    i2c_read_blocking(i2c_default, ds3231Address, &status, 1, false);
    
    return (status >> 7) & 1;
}

uint16_t RTC::getDayMinutes() {
    DateTime dt = now();
    return getDayMinutes(dt);
}

uint16_t RTC::getDayMinutes(const DateTime& date) {
    return date.hour * 60 + date.minute;
}

std::string RTC::getCurrentTimeISO() {
    DateTime dt = now();
    char buf[25];
    
    // YYYY-MM-DDTHH:MM:SSZ
    snprintf(
        buf, sizeof(buf), "%04d-%02d-%02dT%02d:%02d:%02dZ", 
        dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second
    );
    
    return std::string(buf);
}

void RTC::fetchGMT() {
    // TODO: Implement SNTP integration with lwIP
    // For now, this requires the WiFi manager to be ported and initialized
    printf("RTC: Fetch GMT requested (Not implemented yet)\n");
}