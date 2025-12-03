import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AddScheduleModal from '@/app/_components/AddScheduleModal';
import ConfirmDeleteModal from '@/app/_components/ConfirmDeleteModal';
import EditItemModal from '@/app/_components/EditItemModal';
import { TScheduleItem } from '@/src/lib/types/schedule-item';
import { deviceStore } from '@/src/store/device-store';

import { AddScheduleItem } from './_components/AddScheduleItem';
import { FeedingSchedule } from './_components/FeedingSchedule';
import FooterActions from './_components/FooterActions';

enum EModals {
  None,
  AddScheduleItem,
  ConfirmDelete,
  EditScheduleItem,
}

function FeedingScheduleScreen() {
  const [openedModal, setOpenedModal] = useState<EModals>(EModals.None);
  const [targetScheduleItem, setTargetScheduleItem] =
    useState<TScheduleItem | null>(null);
  const { lastFedTime, schedule } = deviceStore;

  const handleDeleteItem = (item: TScheduleItem) => {
    setTargetScheduleItem(item);
    setOpenedModal(EModals.ConfirmDelete);
  };

  const handleEditItem = (item: TScheduleItem) => {
    setTargetScheduleItem(item);
    setOpenedModal(EModals.EditScheduleItem);
  };

  const handleClose = () => {
    setOpenedModal(EModals.None);
    setTargetScheduleItem(null);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={['left', 'right', 'bottom']}
    >
      <View className="flex-1">
        <FeedingSchedule
          items={schedule.items}
          lastFedLabel={lastFedTime}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
        />

        <AddScheduleItem
          onPress={() => setOpenedModal(EModals.AddScheduleItem)}
        />
      </View>

      <FooterActions />

      {/* modals */}
      <AddScheduleModal
        isOpened={openedModal === EModals.AddScheduleItem}
        close={handleClose}
      />
      <ConfirmDeleteModal
        scheduleItem={targetScheduleItem}
        isOpened={openedModal === EModals.ConfirmDelete}
        close={handleClose}
      />
      <EditItemModal
        scheduleItem={targetScheduleItem}
        isOpened={openedModal === EModals.EditScheduleItem}
        close={handleClose}
      />
    </SafeAreaView>
  );
}

export default observer(FeedingScheduleScreen);
