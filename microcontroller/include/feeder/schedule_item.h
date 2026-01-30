#pragma once

#include <cstdint>
#include <string>

enum class ItemState {
    Disabled,
    DisabledForNextFeed,
    Enabled
};

class ScheduleItem {
    int16_t feedTimeMinutes; // -1 = invalid/uninitialised item
    ItemState state;

public:
    ScheduleItem();
    explicit ScheduleItem(int16_t feedTimeMinutes);

    ItemState getState() const;
    void setState(ItemState newState);

    int16_t getFeedTimeMinutes() const;
    std::string toString() const;
};
