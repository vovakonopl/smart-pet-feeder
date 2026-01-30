#pragma once

#include <string>
#include "modules/rtc.h"
#include "schedule.h"
#include "modules/servo_gate.h"

class Feeder {
    Schedule schedule;
    std::string lastFedTimeISO;
    DateTime scheduleLastCheckTime; // latest checked schedule item
    ServoGate servo;

public:
    Feeder();

    void setup();
    void loop();

    void feed();
    void moveNextFeedingForNow();
    bool writeStateJson(char *buffer);
    bool setSchedule(const char *json);
};

extern Feeder feeder;