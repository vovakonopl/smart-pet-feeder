#include <ArduinoJson.h>
#include "storage/pico_hal.h"
#include <cstdio>
#include <string>

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
        
        lfs_file_t file;
        int err = lfs_file_open(&lfs, &file, scheduleFile, LFS_O_RDONLY);
        if (err) return false;

        lfs_soff_t size = lfs_file_size(&lfs, &file);
        if (size < 0) {
            lfs_file_close(&lfs, &file);
            return false;
        }

        std::string buffer;
        buffer.resize(size);
        lfs_file_read(&lfs, &file, &buffer[0], size);
        lfs_file_close(&lfs, &file);

        JsonDocument doc;
        const auto jsonErr = deserializeJson(doc, buffer);
        
        if (jsonErr) {
            printf("Failed to deserialize schedule file: %s\n", jsonErr.c_str());
            return false;
        }

        const auto jsonArray = doc.as<JsonArray>();
        if (jsonArray.isNull()) {
            printf("Schedule file root is not a JSON array.\n");
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
