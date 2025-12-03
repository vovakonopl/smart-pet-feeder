import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { DatePicker } from '@/src/components/nativewindui/DatePicker';
import Button from '@/src/components/ui/Button';
import Modal from '@/src/components/ui/Modal';
import { Title2 } from '@/src/components/ui/titles';
import { EFeedingState, TScheduleItem } from '@/src/lib/types/schedule-item';
import { deviceStore } from '@/src/store/device-store';

type TNewScheduleModalProps = {
  isOpened: boolean;
  close: () => void;
};

const AddScheduleModal = ({ isOpened, close }: TNewScheduleModalProps) => {
  const [time, setTime] = useState<Date>(() => new Date());

  useEffect(() => {
    if (isOpened) {
      setTime(new Date());
    }
  }, [isOpened]);

  const handleAdd = () => {
    const feedTimeMinutes = time.getHours() * 60 + time.getMinutes();
    const item: TScheduleItem = {
      feedTimeMinutes,
      state: EFeedingState.Enabled,
    };

    deviceStore.scheduleAddItem(item);
    close();
  };

  return (
    <Modal isVisible={isOpened} close={close}>
      <View className="h-44 w-full items-center justify-center pt-2">
        <Title2 className="mb-2 text-center ">Add New Feeding Schedule</Title2>

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
            <Button className="flex-1" onPress={handleAdd}>
              Add Schedule
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddScheduleModal;
