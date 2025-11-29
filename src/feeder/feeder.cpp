#include "feeder/feeder.h"

#include "modules/rtc.h"
#include "storage/last_fed_time_iso.h"
#include <RTClib.h>

Feeder::Feeder() : servo(SERVO_PIN) {}

void Feeder::setup() {
    storage::schedule::load(this->schedule);
    storage::lastFedTimeISO::load(this->lastFedTimeISO);
    this->scheduleLastCheckTime = rtc.now();
    this->servo.setup();
}

// TODO
void Feeder::loop() {
    ScheduleItem &currItem =  this->schedule.getCurrentScheduleItem();
    const uint32_t lastCheckDays = this->scheduleLastCheckTime.unixtime() / SECONDS_PER_DAY;
    const uint32_t currentDays = rtc.now().unixtime() / SECONDS_PER_DAY;

    if (
        // last check was today
        lastCheckDays >= currentDays &&
        // current item is already checked
        currItem.getFeedTimeMinutes() < RTC::getDayMinutes(this->scheduleLastCheckTime)
    ) {
        return;
    }

    this->scheduleLastCheckTime = rtc.now();
    switch (currItem.getState()) {
        case ItemState::Disabled:
            return;

        case ItemState::DisabledForNextFeed:
            currItem.setState(ItemState::Enabled);
            return;

        case ItemState::Enabled:
            this->feed();
            break;
    }
}

// TODO
void Feeder::writeStatusJson(char *buffer) {}

void Feeder::feed() {
    constexpr uint16_t openGateForMs = 10000; // 10s
    this->lastFedTimeISO = rtc.getCurrentTimeISO();
    storage::lastFedTimeISO::store(this->lastFedTimeISO);
    this->servo.openForMs(openGateForMs);
}

void Feeder::moveNextFeedingForNow() {
    const bool wasDisabled = this->schedule.disableNextItemForNextFeed();
    if (!wasDisabled) return;

    this->feed();
}

// TODO
void Feeder::setSchedule(const char *json) {}