import { observer } from 'mobx-react-lite';
import { FlatList, ListRenderItemInfo, View } from 'react-native';

import NoDeviceStoredWarning from '@/app/_components/NoDeviceStoredWarning';
import SyncStatus from '@/app/_components/SyncStatus';
import { TScheduleItem } from '@/src/lib/types/schedule-item';
import { deviceStore } from '@/src/store/device-store';

import { FeedingItemCard } from './FeedingItemCard';
import { LastFedCard } from './LastFedCard';

type TFeedingScheduleProps = {
  items: TScheduleItem[];
  lastFedLabel: Date | null;
  disabled?: boolean;
  onEditItem: (item: TScheduleItem) => void;
  onDeleteItem: (item: TScheduleItem) => void;
};

const FeedingSchedule = ({
  items,
  lastFedLabel,
  disabled,
  onEditItem,
  onDeleteItem,
}: TFeedingScheduleProps) => {
  const { deviceId } = deviceStore;

  const renderItem = ({ item }: ListRenderItemInfo<TScheduleItem>) => (
    <FeedingItemCard
      item={item}
      disabled={disabled}
      onEdit={onEditItem}
      onDelete={onDeleteItem}
    />
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.feedTimeMinutes.toString()}
      renderItem={renderItem}
      className="flex-1"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 68, // space for footer + FAB
      }}
      ListHeaderComponent={
        <View>
          {deviceId ? <SyncStatus /> : <NoDeviceStoredWarning />}
          {lastFedLabel && <LastFedCard lastFedTime={lastFedLabel} />}
        </View>
      }
    />
  );
};

export default observer(FeedingSchedule);
