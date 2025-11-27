import { Pencil, Trash2 } from 'lucide-react-native';
import { useMemo } from 'react';
import { View, Pressable } from 'react-native';

import Icon from '@/src/components/ui/Icon';
import Text from '@/src/components/ui/Text';
import {
  FeedingScheduleItem,
  FeedingState,
} from '@/src/lib/types/schedule-item';
import { cn } from '@/src/lib/utils/cn';
import { formatGmtToLocalTime } from '@/src/lib/utils/time';

type TFeedingItemCardProps = {
  item: FeedingScheduleItem;
  onEdit: (item: FeedingScheduleItem) => void;
  onDelete: (item: FeedingScheduleItem) => void;
};

const getStateBadges = (state: FeedingState) => {
  switch (state) {
    case FeedingState.Enabled:
      return [
        {
          label: 'Active',
          badgeClassName: 'bg-primary',
          textClassName: 'text-primary-foreground',
        },
      ];

    case FeedingState.DisabledForNextFeed:
      return [
        {
          label: 'Inactive',
          badgeClassName: 'bg-slate-100',
          textClassName: 'text-slate-700',
        },
        {
          label: 'Skip next',
          badgeClassName: 'bg-secondary',
          textClassName: 'text-secondary-foreground',
        },
      ];

    default:
      return [
        {
          label: 'Inactive',
          badgeClassName: 'bg-slate-100',
          textClassName: 'text-slate-500',
        },
      ];
  }
};

export const FeedingItemCard = ({
  item,
  onEdit,
  onDelete,
}: TFeedingItemCardProps) => {
  const badges = useMemo(() => getStateBadges(item.state), [item.state]);
  const timeFormatted = useMemo(
    () => formatGmtToLocalTime(item.timeGmt),
    [item.timeGmt],
  );

  return (
    <View className="mb-3 flex-row justify-between rounded-2xl border border-slate-200 bg-background p-4">
      <View className="gap-2">
        <Text className="px-1 text-xl text-foreground" weight="semibold">
          {timeFormatted}
        </Text>

        <View className="mt-1 flex-row flex-wrap gap-2">
          {badges.map((badge) => (
            <View
              key={badge.label}
              className={cn('rounded-full px-3 py-1', badge.badgeClassName)}
            >
              <Text
                className={cn('text-sm', badge.textClassName)}
                weight="medium"
              >
                {badge.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="flex-col justify-between gap-2">
        <Pressable
          onPress={() => onEdit(item)}
          className="rounded-full p-1"
          hitSlop={8}
        >
          <Icon icon={Pencil} size={20} className="text-foreground" />
        </Pressable>

        <Pressable
          onPress={() => onDelete(item)}
          className="rounded-full"
          hitSlop={8}
        >
          <Icon icon={Trash2} size={20} className="text-red-500" />
        </Pressable>
      </View>
    </View>
  );
};
