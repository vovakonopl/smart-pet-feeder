import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  FeedingScheduleItem,
  FeedingState,
} from '@/src/lib/types/schedule-item';

import { AddScheduleItem } from './_components/AddScheduleItem';
import { FeedingSchedule } from './_components/FeedingSchedule';
import { FooterActions } from './_components/FooterActions';

const mockData: FeedingScheduleItem[] = [
  {
    timeGmt: '2025-07-01T07:00:00Z',
    state: FeedingState.Enabled,
  },
  {
    timeGmt: '2025-07-01T12:00:00Z',
    state: FeedingState.Enabled,
  },
  {
    timeGmt: '2025-07-01T18:00:00Z',
    state: FeedingState.DisabledForNextFeed,
  },
  {
    timeGmt: '2025-07-01T22:10:00Z',
    state: FeedingState.Enabled,
  },
  {
    timeGmt: '2025-07-01T07:20:00Z',
    state: FeedingState.Enabled,
  },
  {
    timeGmt: '2025-07-01T12:30:00Z',
    state: FeedingState.Enabled,
  },
  {
    timeGmt: '2025-07-01T18:40:00Z',
    state: FeedingState.DisabledForNextFeed,
  },
  {
    timeGmt: '2025-07-01T22:50:00Z',
    state: FeedingState.Enabled,
  },
];

const lastFedMock = 'Today at 5:00 PM';

export default function FeedingScheduleScreen() {
  // TODO: replace mock data with MQTT data + state
  const items = useMemo(() => mockData, []);

  const handleEditItem = useCallback((item: FeedingScheduleItem) => {
    console.log('Edit', item.timeGmt);
  }, []);

  const handleDeleteItem = useCallback((item: FeedingScheduleItem) => {
    console.log('Delete', item.timeGmt);
  }, []);

  const handleAddItem = useCallback(() => {
    console.log('Add new item');
  }, []);

  const handleOneTimeFeed = useCallback(() => {
    console.log('One-time feed');
  }, []);

  const handleFeedNowNextSlot = useCallback(() => {
    console.log('Move next feeding to now');
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

      <FooterActions
        onOneTimeFeed={handleOneTimeFeed}
        onFeedNowNextSlot={handleFeedNowNextSlot}
      />
    </SafeAreaView>
  );
}
