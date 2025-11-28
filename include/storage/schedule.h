#pragma once

class Schedule;

namespace storage::schedule {
    bool store(const Schedule &schedule);
    bool load(Schedule &out);
}
