#pragma once

#include <Arduino.h>

#include "feeder/power_monitor.h"

namespace storage::powerLossLogs {
    bool add(const PowerLossLog &log); // will just add it to the top of the list
    bool load(PowerLossLog *logs, uint8_t size);
}
