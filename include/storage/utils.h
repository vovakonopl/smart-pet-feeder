#pragma once

#include <ArduinoJson.h>

namespace storage {
    bool mountFS();
    bool atomicWriteJson(const char *path, const JsonDocument &doc);
}
