import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NewScheduleModal from '@/app/_components/NewScheduleModal';
import { ASYNC_STORAGE_DEVICE_ID_KEY } from '@/src/lib/constants/async-storage-keys';
import { TScheduleItem, EFeedingState } from '@/src/lib/types/schedule-item';

import { AddScheduleItem } from './_components/AddScheduleItem';
import { FeedingSchedule } from './_components/FeedingSchedule';
import FooterActions from './_components/FooterActions';

const mockData: TScheduleItem[] = [
  {
    feedTimeMinutes: 10,
    state: EFeedingState.Enabled,
  },
  {
    feedTimeMinutes: 1420,
    state: EFeedingState.Enabled,
  },
  {
    feedTimeMinutes: 555,
    state: EFeedingState.DisabledForNextFeed,
  },
  {
    feedTimeMinutes: 1439,
    state: EFeedingState.Enabled,
  },
  {
    feedTimeMinutes: 0,
    state: EFeedingState.Enabled,
  },
  {
    feedTimeMinutes: 225,
    state: EFeedingState.Enabled,
  },
  {
    feedTimeMinutes: 1001,
    state: EFeedingState.DisabledForNextFeed,
  },
  {
    feedTimeMinutes: 1430,
    state: EFeedingState.Enabled,
  },
];

const lastFedMock = 'Today at 5:00 PM';

export default function FeedingScheduleScreen() {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);

  // TODO: replace mock data with MQTT data + state
  const items = useMemo(() => mockData, []);

  const handleEditItem = useCallback((item: TScheduleItem) => {
    console.log('Edit', item.feedTimeMinutes);
    AsyncStorage.getItem(ASYNC_STORAGE_DEVICE_ID_KEY).then((deviceId) => {
      console.log('Device ID:', deviceId);
    });
  }, []);

  const handleDeleteItem = useCallback((item: TScheduleItem) => {
    console.log('Delete', item.feedTimeMinutes);
  }, []);

  const handleAddItem = useCallback(() => {
    console.log('Add new item');
    setIsModalOpened(true);
  }, []);

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={['left', 'right', 'bottom']}
    >
      <View className="flex-1">
        <FeedingSchedule
          items={items}
          lastFedLabel={lastFedMock}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
        />

        <AddScheduleItem onPress={handleAddItem} />
      </View>

      <FooterActions />

      <NewScheduleModal
        isOpened={isModalOpened}
        close={() => setIsModalOpened(false)}
      />
    </SafeAreaView>
  );
}
