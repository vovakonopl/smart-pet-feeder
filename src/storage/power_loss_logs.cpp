#include "storage/utils.h"
#include "storage/power_loss_logs.h"

#include <LittleFS.h>

#include "constants/power_loss_logs_max_count.h"
#include "constants/storage_file_names.h"

namespace {
    bool readLogs(JsonDocument &doc) {
        if (!storage::mountFS()) return false;
        if (!LittleFS.exists(powerLossLogsFile)) return false;

        File file = LittleFS.open(powerLossLogsFile, "r");
        if (!file) return false;

        const DeserializationError error = deserializeJson(doc, file);
        file.close();
        if (error) return false;

        return true;
    }
}

namespace storage::powerLossLogs {
    bool add(const PowerLossLog &log) {
        JsonDocument doc;
        readLogs(doc);
        JsonArray array;
        if (doc.is<JsonArray>()) {
            array = doc.as<JsonArray>();
        } else {
            array = doc.to<JsonArray>();
        }

        JsonDocument newDoc;
        const auto newArray = newDoc.to<JsonArray>();

        const auto newItem = newArray.add<JsonObject>();
        newItem["from"] = log.getFrom();
        newItem["to"] = log.getTo();

        size_t count = 1;
        for (JsonObject item : array) {
            if (count >= powerLossLogsMaxCount) break;

            newArray.add(item);
            count++;
        }

        return atomicWriteJson(powerLossLogsFile, newDoc);
    }

    bool load(PowerLossLog *logs, const uint8_t size) {
        JsonDocument doc;
        if (!readLogs(doc)) return false;

        const auto jsonArray = doc.as<JsonArray>();
        if (jsonArray.isNull()) return false;

        uint8_t count = 0;
        for (JsonObject itemJson : jsonArray) {
            if (count >= size) break;

            const uint32_t from = itemJson["from"] | 0;
            const uint32_t to = itemJson["to"] | 0;
            if (from >= to) continue;

            const PowerLossLog log(from, to);
            logs[count] = log;
            count++;
        }

        return true;
    }
}
