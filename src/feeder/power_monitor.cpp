#include "storage/last_time_alive.h"
#include "feeder/power_monitor.h"

#include "modules/rtc.h"

uint32_t PowerLossLog::getFrom() const {
    return this->from;
}

uint32_t PowerLossLog::getTo() const {
    return this->to;
}

void PowerMonitor::begin() {
    const DateTime now = rtc.now();
    uint32_t lastTimeAlive = 0;

    // Time wasn't stored yet
    if (!storage::lastTimeAlive::load(lastTimeAlive)) {
        storage::lastTimeAlive::store(now.unixtime());
        return;
    }
}

void PowerMonitor::loop() {

}