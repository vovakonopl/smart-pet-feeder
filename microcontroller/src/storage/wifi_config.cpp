#include <ArduinoJson.h>
#include "storage/pico_hal.h"

#include "constants/storage_file_names.h"
#include "storage/utils.h"
#include "storage/wifi_config.h"
#include <string>
#include <vector>

namespace storage::wifiConfig {
    bool store(const WifiConfig &config) {
        if (!mountFS()) return false;
        if (!config.isValid()) return false;

        JsonDocument doc;
        doc["ssid"] = config.ssid;
        doc["password"] = config.password;
        if (doc.overflowed()) return false;

        return atomicWriteJson(wifiConfigFile, doc);
    }

    bool load(WifiConfig &out) {
        if (!mountFS()) return false;
        
        lfs_file_t file;
        int err = lfs_file_open(&lfs, &file, wifiConfigFile, LFS_O_RDONLY);
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
        if (jsonErr) return false;

        // ArduinoJson handles std::string assignment (via const char*)
        const char* ssid = doc["ssid"] | "";
        const char* password = doc["password"] | "";
        
        out.ssid = ssid;
        out.password = password;

        return out.isValid();
    }
}