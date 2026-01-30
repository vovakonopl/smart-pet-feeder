#include <ArduinoJson.h>
#include "storage/pico_hal.h"

#include "constants/storage_file_names.h"
#include "storage/utils.h"
#include "storage/last_fed_time_iso.h"
#include <string>

namespace storage::lastFedTimeISO {
    bool store(const std::string &lastFedTimeISO) {
        if (!mountFS()) return false;

        JsonDocument doc;
        doc["lastFedTimeISO"] = lastFedTimeISO;
        if (doc.overflowed()) return false;

        return atomicWriteJson(lastFedTimeFile, doc);
    }

    bool load(std::string &out) {
        if (!mountFS()) return false;
        
        lfs_file_t file;
        int err = lfs_file_open(&lfs, &file, lastFedTimeFile, LFS_O_RDONLY);
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

        const char* val = doc["lastFedTimeISO"] | "";
        out = val;

        return true;
    }
}