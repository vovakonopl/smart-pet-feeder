#pragma once

#include <Arduino.h>

#include "RTClib.h"
#include "schedule.h"
#include "modules/servo_gate.h"

class Feeder {
    Schedule schedule;
    String lastFedTimeISO;
    DateTime scheduleLastCheckTime; // latest checked schedule item
    ServoGate servo;

public:
    Feeder();

    void setup();
    void loop();

    void feed();
    void moveNextFeedingForNow();
    bool writeStatusJson(char *buffer);
    bool setSchedule(const char *json);
};

inline Feeder feeder;