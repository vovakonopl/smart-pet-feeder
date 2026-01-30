#pragma once

#include <ArduinoJson.h>
#include "storage/pico_hal.h"

namespace storage {
    bool mountFS();
    bool atomicWriteJson(const char *path, const JsonDocument &doc);
}
