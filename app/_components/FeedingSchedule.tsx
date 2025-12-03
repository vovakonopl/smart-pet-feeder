import { FlatList, ListRenderItemInfo } from 'react-native';

import { TScheduleItem } from '@/src/lib/types/schedule-item';

import { FeedingItemCard } from './FeedingItemCard';
import { LastFedCard } from './LastFedCard';

type TFeedingScheduleProps = {
  items: TScheduleItem[];
  lastFedLabel: Date | null;
  onEditItem: (item: TScheduleItem) => void;
  onDeleteItem: (item: TScheduleItem) => void;
};

export const FeedingSchedule = ({
  items,
  lastFedLabel,
  onEditItem,
  onDeleteItem,
}: TFeedingScheduleProps) => {
  const renderItem = ({ item }: ListRenderItemInfo<TScheduleItem>) => (
    <FeedingItemCard item={item} onEdit={onEditItem} onDelete={onDeleteItem} />
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
        lastFedLabel && <LastFedCard lastFedTime={lastFedLabel} />
      }
    />
  );
};
