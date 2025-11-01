#pragma once

#include "iot/wifi.h"

namespace storage::wifiConfig {
    bool store(const WifiConfig &config);
    bool load(WifiConfig &out);
}