#pragma once

#include <Arduino.h>

// stores time in seconds
namespace storage::lastTimeAlive {
    bool store(const uint32_t time);
    bool load(uint32_t &out);
}