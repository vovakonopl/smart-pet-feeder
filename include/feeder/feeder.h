#pragma once

#include <Arduino.h>

#include "RTClib.h"
#include "schedule.h"

class Feeder {
    Schedule schedule;
    String lastFedTimeISO;
    DateTime scheduleLastCheckTime; // latest checked schedule item

public:
    Feeder() {};

    void setup();
    void loop();
};
