import { View } from 'react-native';

import Button from '@/src/components/ui/Button';
import Modal from '@/src/components/ui/Modal';
import { Title2 } from '@/src/components/ui/titles';
import { TScheduleItem } from '@/src/lib/types/schedule-item';
import { deviceStore } from '@/src/store/device-store';

type TConfirmDeleteModalProps = {
  scheduleItem: TScheduleItem | null;
  isOpened: boolean;
  close: () => void;
};

const ConfirmDeleteModal = ({
  isOpened,
  close,
  scheduleItem,
}: TConfirmDeleteModalProps) => {
  const handleDelete = () => {
    if (scheduleItem) {
      deviceStore.deleteItemAtMinutes(scheduleItem.feedTimeMinutes);
    }

    close();
  };

  return (
    <Modal isVisible={isOpened} close={close} className="w-96">
      <View className="h-fit py-2">
        <Title2 className="mb-4 text-center ">
          Are sure you want to delete an item?
        </Title2>

        <View className="w-full flex-row gap-3">
          <Button
            variant="destructive"
            className="flex-1"
            onPress={handleDelete}
          >
            Delete
          </Button>
          <Button variant="outlined" className="flex-1" onPress={close}>
            Cancel
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmDeleteModal;
