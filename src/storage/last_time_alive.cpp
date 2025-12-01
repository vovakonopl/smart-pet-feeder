#include "storage/utils.h"
#include "constants/storage_file_names.h"
#include "storage/last_time_alive.h"

#include <FS.h>
#include <LittleFS.h>

namespace storage::lastTimeAlive {
    bool store(const uint32_t time) {
        if (!mountFS()) return false;

        JsonDocument doc;
        doc["lastTimeAlive"] = time;
        if (doc.overflowed()) return false;

        return atomicWriteJson(lastTimeAliveFile, doc);
    }

    bool load(uint32_t &out) {
        if (!mountFS()) return false;

        File file = LittleFS.open(lastTimeAliveFile, "r");
        if (!file) return false;

        JsonDocument doc;
        const auto err = deserializeJson(doc, file);
        file.close();
        if (err) return false;

        out = doc["lastTimeAlive"] | 0;

        return out != 0;
    }
}
