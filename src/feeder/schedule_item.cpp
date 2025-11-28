#include "feeder/schedule_item.h"

ScheduleItem::ScheduleItem() {
    this->feedTimeMinutes = -1;
    this->state = ItemState::Disabled;
}

ScheduleItem::ScheduleItem(const int16_t feedTimeMinutes) : ScheduleItem() {
    if (feedTimeMinutes < 0) return;

    this->feedTimeMinutes = feedTimeMinutes;
    this->state = ItemState::Enabled;
}

int16_t ScheduleItem::getFeedTimeMinutes() const {
    return this->feedTimeMinutes;
}

ItemState ScheduleItem::getState() const {
    return this->state;
}

void ScheduleItem::setState(const ItemState state)  {
    this->state = state;
}

String ScheduleItem::toString() const {
    String str =
        String("{feedTimeMinutes=") + this->feedTimeMinutes +
        ";state=" + static_cast<uint8_t>(this->state) + "}";

    return str;
};
