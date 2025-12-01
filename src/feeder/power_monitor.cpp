#include "storage/last_time_alive.h"
#include "feeder/power_monitor.h"

#include "modules/rtc.h"
#include "storage/power_loss_logs.h"

uint32_t PowerLossLog::getFrom() const {
    return this->from;
}

uint32_t PowerLossLog::getTo() const {
    return this->to;
}

uint32_t PowerMonitor::logInterval = 60 * 60; // 1 hour

void PowerMonitor::begin() {
    const DateTime now = rtc.now();
    const uint32_t to = now.unixtime();
    uint32_t from = 0;

    const bool success = storage::lastTimeAlive::load(from);
    storage::lastTimeAlive::store(to);
    if (!success) return; // Time wasn't stored yet

    if (from > to || to - from < logInterval) {
        // TODO: add check whether no schedule items were skipped during the power loss
        return;
    }


    const PowerLossLog log(from, to);
    storage::powerLossLogs::add(log);
}

void PowerMonitor::loop() {

}