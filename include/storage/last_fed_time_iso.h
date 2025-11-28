#pragma once

#include "iot/wifi.h"

namespace storage::lastFedTimeISO {
    bool store(const String &lastFedTimeISO);
    bool load(String &out);
}