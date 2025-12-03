import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { DatePicker } from '@/src/components/nativewindui/DatePicker';
import Button from '@/src/components/ui/Button';
import Modal from '@/src/components/ui/Modal';
import Text from '@/src/components/ui/Text';
import { Title2 } from '@/src/components/ui/titles';
import { EFeedingState, TScheduleItem } from '@/src/lib/types/schedule-item';
import { normalizeScheduleItemTime } from '@/src/lib/utils/time';
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
    EFeedingState.Enabled,
  );

  useEffect(() => {
    if (!scheduleItem) return;

    const itemDate = new Date();
    const hours = Math.floor(scheduleItem.feedTimeMinutes / 60);
    const minutes = scheduleItem.feedTimeMinutes % 60;
    itemDate.setHours(hours, minutes, 0, 0);

    setTime(itemDate);
  }, [scheduleItem]);

  const handleEdit = () => {
    if (!scheduleItem) {
      close();
      return;
    }

    const feedTimeMinutes = time.getHours() * 60 + time.getMinutes();
    const item: TScheduleItem = {
      feedTimeMinutes,
      state: feedingState,
    };

    deviceStore.updateItemAtMinutes(scheduleItem?.feedTimeMinutes, item);
    close();
  };

  return (
    <Modal isVisible={isOpened} close={close}>
      <View className="min-h-52 gap-4 pt-2">
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
