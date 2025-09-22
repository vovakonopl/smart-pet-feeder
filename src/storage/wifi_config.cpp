#include <ArduinoJson.h>
#include <LittleFS.h>

#include "constants/storage_file_names.h"
#include "storage/utils.h"
#include "storage/wifi_config.h"

namespace storage::wifiConfig {
    bool store(const WifiConfig& config) {
        if (!mountFS()) return false;
        if (!config.isValid()) return false;

        JsonDocument doc;
        doc["ssid"] = config.ssid;
        doc["password"] = config.password;
        if (doc.overflowed()) return false;

        return atomicWriteJson(wifiConfigFile, doc);
    }

    bool load(WifiConfig& out) {
        if (!mountFS()) return false;
        if (!LittleFS.exists(wifiConfigFile)) return false;

        File file = LittleFS.open(wifiConfigFile, "r");
        if (!file) return false;

        if (file.size() == 0) {
            file.close();
            return false;
        }

        JsonDocument doc;
        const auto err = deserializeJson(doc, file);
        file.close();
        if (err) return false;

        out.ssid = doc["ssid"] | "";
        out.password = doc["password"] | "";

        return out.isValid();
    }
}