#pragma once

#include "schedule_item.h"
#include "constants/schedule_max_items.h"
#include "storage/schedule.h"

class Schedule {
    ScheduleItem itemsArray[SCHEDULE_MAX_ITEMS];
    uint8_t itemCount;

    // returns schedule item, where:
    // item's time of feed <= specified time < next item's time of feed
    uint8_t binarySearchNearestItemIdx(uint16_t mins) const;

    int8_t binarySearchSpecifiedMinutes(uint16_t mins) const;

public:
    Schedule();

    uint8_t getItemCount() const;
    bool addItem(const ScheduleItem &item);
    void removeItemAtSpecifiedTime(int16_t timeMinutes);

    // can return disabled items
    ScheduleItem &getCurrentScheduleItem();

    // true if success; false if every item already disabled;
    // if passed pointer in params, then it will write the data of the disabled object (if success)
    bool disableNextItemForNextFeed(ScheduleItem *writeItemData = nullptr);
    void disableItemAtSpecifiedTime(int16_t timeMinutes);
    void disableItemAtSpecifiedTimeForNextFeed(int16_t timeMinutes);
    void enableItemAtSpecifiedTime(int16_t timeMinutes);

    void printList() const;

    friend bool storage::schedule::store(const Schedule &schedule);
    friend bool storage::schedule::load(Schedule &out);
    friend class Feeder;
};
