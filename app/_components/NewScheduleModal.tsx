import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { DatePicker } from '@/src/components/nativewindui/DatePicker';
import Button from '@/src/components/ui/Button';
import Modal from '@/src/components/ui/Modal';
import { Title2 } from '@/src/components/ui/titles';

type TNewScheduleModalProps = {
  isOpened: boolean;
  close: () => void;
};

const NewScheduleModal = ({ isOpened, close }: TNewScheduleModalProps) => {
  const [time, setTime] = useState<Date>(() => new Date());

  useEffect(() => {
    if (isOpened) {
      setTime(new Date());
    }
  }, [isOpened]);

  return (
    <Modal isVisible={isOpened} close={close}>
      <View className="min-h-[25vh]">
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

          <View className="border-top flex-col items-stretch gap-2 border-neutral-300">
            <Button>Add Schedule</Button>
            <Button variant="outlined">Cancel</Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NewScheduleModal;
