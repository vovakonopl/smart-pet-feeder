#include "feeder/feeder.h"

#include "modules/rtc.h"
#include "storage/last_fed_time_iso.h"
#include <RTClib.h>

Feeder::Feeder() {}

void Feeder::setup() {
    storage::schedule::load(this->schedule);
    storage::lastFedTimeISO::load(this->lastFedTimeISO);
    this->scheduleLastCheckTime = rtc.now();
}

// TODO
void Feeder::loop() {
    ScheduleItem &currItem =  this->schedule.getCurrentScheduleItem();
    const long lastCheckDays = this->scheduleLastCheckTime.unixtime() / SECONDS_PER_DAY;
    const long currentDays = rtc.now().unixtime() / SECONDS_PER_DAY;

    if (
        lastCheckDays >= currentDays && // last check was today
        currItem.getFeedTimeMinutes() < rtc.getDayMinutes(this->scheduleLastCheckTime) // current item is already checked
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
            this->lastFedTimeISO = rtc.getCurrentTimeISO();
            // TODO: feed
            break;
    }
}