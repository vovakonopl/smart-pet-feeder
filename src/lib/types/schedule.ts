import { SCHEDULE_MAX_ITEMS } from '@/src/lib/constants/schedule-max-items';
import { EFeedingState, TScheduleItem } from '@/src/lib/types/schedule-item';

export class Schedule {
  items: TScheduleItem[] = [];

  setSchedule(items: TScheduleItem[]) {
    if (items.length >= SCHEDULE_MAX_ITEMS) {
      throw new Error(
        `Schedule cannot have more than ${SCHEDULE_MAX_ITEMS} items.`,
      );
    }

    this.items = items;
  }

  addItem(item: TScheduleItem) {
    if (this.items.length >= SCHEDULE_MAX_ITEMS) return;

    for (let i = 0; i < this.items.length; i++) {
      // schedule contains unique timeMinutes
      if (this.items[i].feedTimeMinutes === item.feedTimeMinutes) return;

      if (this.items[i].feedTimeMinutes > item.feedTimeMinutes) {
        this.items.splice(i, 0, item);
        return;
      }
    }

    this.items.push(item);
  }

  deleteItemAtMinutes(minutes: number) {
    this.items = this.items.filter((item) => item.feedTimeMinutes !== minutes);
  }

  updateItemAtMinutes(minutes: number, data: Partial<TScheduleItem>) {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.feedTimeMinutes === minutes) {
        this.items[i] = { ...item, ...data };
        return;
      }
    }
  }
}
