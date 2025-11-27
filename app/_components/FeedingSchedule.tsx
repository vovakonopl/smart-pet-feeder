import { FlatList, ListRenderItemInfo } from 'react-native';

import { FeedingScheduleItem } from '@/src/lib/types/schedule-item';

import { FeedingItemCard } from './FeedingItemCard';
import { LastFedCard } from './LastFedCard';

type TFeedingScheduleProps = {
  items: FeedingScheduleItem[];
  lastFedLabel: string;
  onEditItem: (item: FeedingScheduleItem) => void;
  onDeleteItem: (item: FeedingScheduleItem) => void;
};

export const FeedingSchedule = ({
  items,
  lastFedLabel,
  onEditItem,
  onDeleteItem,
}: TFeedingScheduleProps) => {
  const renderItem = ({ item }: ListRenderItemInfo<FeedingScheduleItem>) => (
    <FeedingItemCard item={item} onEdit={onEditItem} onDelete={onDeleteItem} />
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.timeGmt}
      renderItem={renderItem}
      className="flex-1"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 68, // space for footer + FAB
      }}
      ListHeaderComponent={<LastFedCard lastFedLabel={lastFedLabel} />}
    />
  );
};
