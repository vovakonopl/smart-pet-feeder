#include <RTClib.h>
#include <ArduinoJson.h>

#include "modules/rtc.h"
#include "storage/last_fed_time_iso.h"
#include "constants/buffer_size.h"
#include "feeder/feeder.h"


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

bool Feeder::writeStatusJson(char *buffer) {
    JsonDocument doc;
    doc["lastFedTime"] = this->lastFedTimeISO;
    const auto scheduleArr = doc["schedule"].to<JsonArray>();

    for (uint8_t i = 0; i < schedule.itemCount; i++) {
        ScheduleItem &item = this->schedule.itemsArray[i];

        auto itemJson = scheduleArr.add<JsonObject>();
        itemJson["feedTimeMinutes"] = item.getFeedTimeMinutes();
        itemJson["state"] = static_cast<uint8_t>(item.getState());

        if (doc.overflowed()) return false;
    }

    serializeJson(doc, buffer, BUFFER_SIZE);
    return true;
}

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

bool Feeder::setSchedule(const char *json) {
    JsonDocument doc;
    const auto err = deserializeJson(doc, json);
    if (err) return false;

    const JsonArray jsonArray = doc.as<JsonArray>();
    if (jsonArray.isNull()) return false;

    this->schedule.itemCount = 0;
    for (JsonObject itemJson : jsonArray) {
        const int16_t feedTime = itemJson["feedTimeMinutes"] | -1;
        uint8_t stateValue = itemJson["state"] | 0;
        if (feedTime == -1) continue;

        ScheduleItem item(feedTime);
        item.setState(static_cast<ItemState>(stateValue));

        this->schedule.addItem(item);
    }

    return true;
}