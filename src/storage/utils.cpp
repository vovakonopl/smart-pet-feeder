#include <LittleFS.h>

#include "storage/utils.h"

namespace storage {
    bool mountFS() {
        static bool mounted = false;
        if (mounted) return true;
        if (!LittleFS.begin()) {
            return false;
        }

        mounted = true;
        return true;
    }

    // write in temporary file and then rename it on success
    bool atomicWriteJson(const char *path, const JsonDocument &doc) {
        const String tmpPath = String(path) + ".tmp";

        File tmp = LittleFS.open(tmpPath, "w");
        if (!tmp) return false;

        const size_t bytesWritten = serializeJson(doc, tmp);
        tmp.close();
        if (bytesWritten == 0) {
            LittleFS.remove(tmpPath);
            return false;
        }

        // remove old and rename template
        LittleFS.remove(path);
        if (!LittleFS.rename(tmpPath, path)) {
            LittleFS.remove(tmpPath);
            return false;
        }

        return true;
    }
}
