#include <ArduinoJson.h>
#include <LittleFS.h>

#include "constants/storage_file_names.h"
#include "storage/utils.h"
#include "storage/last_fed_time_iso.h"

namespace storage::lastFedTimeISO {
    bool store(const String &lastFedTimeISO) {
        if (!mountFS()) return false;

        JsonDocument doc;
        doc["lastFedTimeISO"] = lastFedTimeISO;
        if (doc.overflowed()) return false;

        return atomicWriteJson(lastFedTimeFile, doc);
    }

    bool load(String &out) {
        if (!mountFS()) return false;
        if (!LittleFS.exists(lastFedTimeFile)) return false;

        File file = LittleFS.open(wifiConfigFile, "r");
        if (!file) return false;

        JsonDocument doc;
        const auto err = deserializeJson(doc, file);
        file.close();
        if (err) return false;

        const String lastFedTimeISO = doc["lastFedTimeISO"] | "";
        Serial.print("Loaded lastFedTimeISO: ");
        Serial.println(lastFedTimeISO);

        out = lastFedTimeISO;
        return true;
    }
}