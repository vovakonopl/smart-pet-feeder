#pragma once

#include <string>

namespace storage::lastFedTimeISO {
    bool store(const std::string &lastFedTimeISO);
    bool load(std::string &out);
}