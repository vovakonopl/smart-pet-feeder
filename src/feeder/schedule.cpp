#include "feeder/schedule.h"

#include "modules/rtc.h"

// =-=-=-=-= private =-=-=-=-=
uint8_t Schedule::binarySearchNearestItemIdx(const uint16_t mins) const {
    int8_t low = 0;
    auto high = static_cast<int8_t>(this->itemCount - 1);

    while (low <= high) {
        const int8_t mid = low + (high - low) / 2;
        const uint16_t itemMins = this->itemsArray[mid].getFeedTimeMinutes();

        // found exactly the same time
        if (mins == itemMins) return mid;

        // found item must be used later, skip
        if (mins < itemMins) {
            high = mid - 1;
            continue;
        }

        // found required item
        if (
            mid + 1 >= this->itemCount || // end of the array
            mins < this->itemsArray[mid + 1].getFeedTimeMinutes() // in required range
        ) {
            return mid;
        }

        // item was already performed (skip)
        low = mid + 1;
    }

    // item should be found during the loop
    return this->itemCount - 1;
}

int8_t Schedule::binarySearchSpecifiedMinutes(const uint16_t mins) const {
    int16_t low = 0;
    int16_t high = this->itemCount - 1;

    while (low <= high) {
        const int16_t mid = low + (high - low) / 2;
        const uint16_t itemMins = this->itemsArray[mid].getFeedTimeMinutes();

        if (mins == itemMins) return static_cast<int8_t>(mid);

        if (mins < itemMins) {
            high = mid - 1;
            continue;
        }

        low = mid + 1;
    }

    return -1;
}

// =-=-=-=-= public =-=-=-=-=
Schedule::Schedule() {
    this->itemCount = 0;
}

uint8_t Schedule::getItemCount() const {
    return this->itemCount;
}

bool Schedule::addItem(const ScheduleItem &item) {
    if (item.getFeedTimeMinutes() < 0) return false;
    if (itemCount >= SCHEDULE_MAX_ITEMS) return false;
    if (itemCount == 0) {
        this->itemsArray[0] = item;
        this->itemCount++;

        return true;
    }

    const uint8_t prevItemIdx =
        binarySearchNearestItemIdx(item.getFeedTimeMinutes());

    if (this->itemsArray[prevItemIdx].getFeedTimeMinutes() == item.getFeedTimeMinutes()) {
        return true; // already in the list
    }

    // shift items to right
    for (uint8_t i = this->itemCount - 1; i > prevItemIdx; i--) {
        this->itemsArray[i + 1] = this->itemsArray[i];
    }

    this->itemCount++;
    this->itemsArray[prevItemIdx + 1] = item;
    return true;
}

void Schedule::removeItemAtSpecifiedTime(const int16_t timeMinutes) {
    if (this->itemCount <= 0) return;

    const int8_t idx = binarySearchSpecifiedMinutes(timeMinutes);
    if (idx < 0) return;

    // shift items to left
    for (uint8_t i = idx; i < this->itemCount - 1; i++) {
        this->itemsArray[i] = this->itemsArray[i + 1];
    }

    this->itemCount--;
}

ScheduleItem &Schedule::getCurrentScheduleItem() {
    const uint8_t idx = binarySearchNearestItemIdx(rtc.getDayMinutes());

    return this->itemsArray[idx];
}

bool Schedule::disableNextItemForNextFeed(ScheduleItem *writeItemData) {
    if (this->itemCount <= 0) return false;

    const ScheduleItem &currItem = this->getCurrentScheduleItem();
    const int8_t currIdx = binarySearchSpecifiedMinutes(currItem.getFeedTimeMinutes());
    if (currIdx == -1) return false;

    uint8_t nextItemIdx = currIdx + 1;
    if (nextItemIdx >= this->itemCount) {
        nextItemIdx = 0;
    }

    if (this->itemsArray[nextItemIdx].getState() == ItemState::Enabled) {
        this->itemsArray[nextItemIdx].setState(ItemState::DisabledForNextFeed);
        if (writeItemData) {
            *writeItemData = this->itemsArray[nextItemIdx];
        }

        return true;
    }

    while (nextItemIdx != currIdx) {
        nextItemIdx = nextItemIdx + 1 < this->itemCount ? nextItemIdx + 1 : 0;
        if (this->itemsArray[nextItemIdx].getState() == ItemState::Enabled) break;
    }

    // all items already disabled
    if (this->itemsArray[nextItemIdx].getState() != ItemState::Enabled) {
        return false;
    };

    this->itemsArray[nextItemIdx].setState(ItemState::DisabledForNextFeed);
    if (writeItemData) {
        *writeItemData = this->itemsArray[nextItemIdx];
    }

    return true;
}

void Schedule::disableItemAtSpecifiedTime(const int16_t timeMinutes) {
    const int8_t idx = binarySearchSpecifiedMinutes(timeMinutes);
    if (idx < 0) return;

    this->itemsArray[idx].setState(ItemState::Disabled);
}

void Schedule::disableItemAtSpecifiedTimeForNextFeed(const int16_t timeMinutes) {
    const int8_t idx = binarySearchSpecifiedMinutes(timeMinutes);
    if (idx < 0) return;

    this->itemsArray[idx].setState(ItemState::DisabledForNextFeed);
}

void Schedule::enableItemAtSpecifiedTime(const int16_t timeMinutes) {
    const int8_t idx = binarySearchSpecifiedMinutes(timeMinutes);
    if (idx < 0) return;

    this->itemsArray[idx].setState(ItemState::Enabled);
}

// void Schedule::printList() const {
//     Serial.print("items count: ");
//     Serial.println(this->itemCount);
//
//     Serial.println("items: [");
//     for (uint8_t i = 0; i < this->itemCount; i++) {
//         Serial.println("  " + this->itemsArray[i].toString());
//     }
//     Serial.println("];");
// }
