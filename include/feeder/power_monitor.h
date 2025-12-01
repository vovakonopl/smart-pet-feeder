#pragma once

#include <cstdint>

class PowerLossLog {
private:
    uint32_t from;
    uint32_t to;

public:
    PowerLossLog() : from(0), to(0) {}
    PowerLossLog(const uint32_t from, const uint32_t to) : from(from), to(to) {}

    uint32_t getFrom() const;
    uint32_t getTo() const;
};

class PowerMonitor {
private:
    uint32_t lastLogAt;
    static uint32_t logInterval;

public:
    PowerMonitor() : lastLogAt(0) {}

    static void begin();
    void loop();
};