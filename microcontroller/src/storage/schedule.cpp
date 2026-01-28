#include <ArduinoJson.h>
#include <LittleFS.h>

#include "constants/storage_file_names.h"
#include "storage/utils.h"
#include "storage/schedule.h"
#include "feeder/schedule.h"

namespace storage::schedule {
    bool store(const Schedule &schedule) {
        if (!mountFS()) return false;

        JsonDocument doc;
        const auto jsonArray = doc.to<JsonArray>();
        if (jsonArray.isNull()) return false;

        for (uint8_t i = 0; i < schedule.itemCount; i++) {
            const ScheduleItem &item = schedule.itemsArray[i];
            if (item.getFeedTimeMinutes() == -1) continue;

            auto itemJson = jsonArray.add<JsonObject>();

            itemJson["feedTimeMinutes"] = item.getFeedTimeMinutes();
            itemJson["state"] = static_cast<uint8_t>(item.getState());
            if (doc.overflowed()) return false;
        }


        return atomicWriteJson(scheduleFile, doc);
    }

    bool load(Schedule& out) {
        if (!mountFS()) return false;
        if (!LittleFS.exists(scheduleFile)) return false;

        File file = LittleFS.open(scheduleFile, "r");
        if (!file) return false;

        JsonDocument doc;
        const auto err = deserializeJson(doc, file);
        file.close();

        if (err) {
            Serial.print(F("Failed to deserialize schedule file: "));
            Serial.println(err.c_str());
            return false;
        }

        const auto jsonArray = doc.as<JsonArray>();
        if (jsonArray.isNull()) {
            Serial.println(F("Schedule file root is not a JSON array."));
            return false;
        }

        for (JsonObject itemJson : jsonArray) {
            const int16_t feedTime = itemJson["feedTimeMinutes"] | -1;
            uint8_t stateValue = itemJson["state"] | 0;
            if (feedTime == -1) continue;

            ScheduleItem item(feedTime);
            item.setState(static_cast<ItemState>(stateValue));
            out.addItem(item);
        }

        return true;
    }
}
