import { Pencil, Trash2 } from 'lucide-react-native';
import { useMemo } from 'react';
import { View, Pressable } from 'react-native';

import Icon from '@/src/components/ui/Icon';
import Text from '@/src/components/ui/Text';
import { TScheduleItem, EFeedingState } from '@/src/lib/types/schedule-item';
import { cn } from '@/src/lib/utils/cn';
import { normalizeScheduleItemTime } from '@/src/lib/utils/time-formatters';

type TFeedingItemCardProps = {
  item: TScheduleItem;
  disabled?: boolean;
  onEdit: (item: TScheduleItem) => void;
  onDelete: (item: TScheduleItem) => void;
};

const getStateBadges = (state: EFeedingState) => {
  switch (state) {
    case EFeedingState.Enabled:
      return [
        {
          label: 'Active',
          badgeClassName: 'bg-primary',
          textClassName: 'text-primary-foreground',
        },
      ];

    case EFeedingState.DisabledForNextFeed:
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
  disabled,
  onEdit,
  onDelete,
}: TFeedingItemCardProps) => {
  const badges = useMemo(() => getStateBadges(item.state), [item.state]);
  const timeFormatted = useMemo(
    () => normalizeScheduleItemTime(item.feedTimeMinutes),
    [item.feedTimeMinutes],
  );

  return (
    <View
      className={cn(
        'mb-3 flex-row justify-between rounded-2xl border border-slate-200 bg-background p-4',
        disabled && 'opacity-75',
      )}
    >
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
          className="rounded-full p-1 disabled:opacity-75"
          disabled={disabled}
          hitSlop={8}
          onPress={() => onEdit(item)}
        >
          <Icon icon={Pencil} size={20} className="text-foreground" />
        </Pressable>

        <Pressable
          className="rounded-full p-1 disabled:opacity-75"
          disabled={disabled}
          hitSlop={8}
          onPress={() => onDelete(item)}
        >
          <Icon icon={Trash2} size={20} className="text-red-500" />
        </Pressable>
      </View>
    </View>
  );
};
