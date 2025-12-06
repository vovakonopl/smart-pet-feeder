import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { DatePicker } from '@/src/components/nativewindui/DatePicker';
import { Picker, PickerItem } from '@/src/components/nativewindui/Picker';
import Button from '@/src/components/ui/Button';
import Modal from '@/src/components/ui/Modal';
import Text from '@/src/components/ui/Text';
import { Title2 } from '@/src/components/ui/titles';
import { EFeedingState, TScheduleItem } from '@/src/lib/types/schedule-item';
import { normalizeScheduleItemTime } from '@/src/lib/utils/time-formatters';
import { timeToDayMinutes } from '@/src/lib/utils/time-to-day-minutes';
import { deviceStore } from '@/src/store/device-store';

const getFeedingStateStr = (state: EFeedingState): string => {
  switch (state) {
    case EFeedingState.Enabled:
      return 'Enabled';

    case EFeedingState.Disabled:
      return 'Disabled';

    case EFeedingState.DisabledForNextFeed:
      return 'Disabled for next feed';

    default:
      return 'Unknown';
  }
};

type TEditItemModalProps = {
  scheduleItem: TScheduleItem | null;
  isOpened: boolean;
  close: () => void;
};

const EditItemModal = ({
  isOpened,
  close,
  scheduleItem,
}: TEditItemModalProps) => {
  const [time, setTime] = useState<Date>(() => new Date());
  const [feedingState, setFeedingState] = useState<EFeedingState>(
    scheduleItem?.state || EFeedingState.Enabled,
  );

  useEffect(() => {
    if (!scheduleItem) return;

    const itemDate = new Date();
    const hours = Math.floor(scheduleItem.feedTimeMinutes / 60);
    const minutes = scheduleItem.feedTimeMinutes % 60;
    itemDate.setHours(hours, minutes, 0, 0);

    setTime(itemDate);
    setFeedingState(scheduleItem.state);
  }, [scheduleItem]);

  const handleEdit = () => {
    if (!scheduleItem) {
      close();
      return;
    }

    const item: Partial<TScheduleItem> = {
      feedTimeMinutes: timeToDayMinutes(time),
      state: feedingState,
    };

    deviceStore.updateItemAtMinutes(scheduleItem?.feedTimeMinutes, item);
    close();
  };

  return (
    <Modal isVisible={isOpened} close={close}>
      <View className="min-h-[16.5rem] gap-4 pt-2">
        <View className="items-center justify-center">
          <Title2>Edit Schedule Item</Title2>
          <Text weight="semibold" className="text-sm text-muted-foreground">
            (current:{' '}
            {normalizeScheduleItemTime(scheduleItem?.feedTimeMinutes || 0)},{' '}
            {getFeedingStateStr(
              EFeedingState.DisabledForNextFeed ||
                scheduleItem?.state ||
                EFeedingState.DisabledForNextFeed,
            )}
            )
          </Text>
        </View>

        <View className="w-full flex-1 gap-4">
          <DatePicker
            mode="time"
            materialTimeClassName="w-1/2 mx-auto"
            hour12={false}
            value={time}
            onChange={(ev) => {
              setTime(new Date(ev.nativeEvent.timestamp));
            }}
          />

          <View className="relative">
            <View className="absolute -top-3 left-3 z-10 bg-card px-2">
              <Text className="text-sm text-neutral-400">State</Text>
            </View>

            <Picker
              className="text-sm"
              onValueChange={setFeedingState}
              selectedValue={feedingState}
            >
              <PickerItem
                label={getFeedingStateStr(EFeedingState.Enabled)}
                value={EFeedingState.Enabled}
              />
              <PickerItem
                label={getFeedingStateStr(EFeedingState.DisabledForNextFeed)}
                value={EFeedingState.DisabledForNextFeed}
              />
              <PickerItem
                label={getFeedingStateStr(EFeedingState.Disabled)}
                value={EFeedingState.Disabled}
              />
            </Picker>
          </View>

          <View className="flex-row items-stretch gap-2">
            <Button variant="outlined" className="flex-1" onPress={close}>
              Cancel
            </Button>
            <Button className="flex-1" onPress={handleEdit}>
              Edit Schedule
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditItemModal;
