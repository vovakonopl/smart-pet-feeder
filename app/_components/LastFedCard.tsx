import { Clock } from 'lucide-react-native';
import { useMemo } from 'react';
import { View } from 'react-native';

import Icon from '@/src/components/ui/Icon';
import Text from '@/src/components/ui/Text';

type TLastFedCardProps = {
  lastFedTime: Date;
};

export const LastFedCard = ({ lastFedTime }: TLastFedCardProps) => {
  const lastFedMessage = useMemo(() => {
    const now = new Date();
    const isToday =
      lastFedTime.getFullYear() === now.getFullYear() &&
      lastFedTime.getMonth() === now.getMonth() &&
      lastFedTime.getDate() === now.getDate();

    const time = lastFedTime.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });

    if (isToday) {
      return `Today at ${time}`;
    }

    const dateStr = lastFedTime.toLocaleDateString('en-us', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return `${dateStr} at ${time}`;
  }, [lastFedTime]);

  return (
    <View className="mb-3 flex-row items-center rounded-2xl bg-slate-50 px-4 py-3">
      <Icon icon={Clock} size={18} className="mr-2 text-slate-600" />

      <Text className="text-sm text-slate-600">
        Last fed: <Text weight="semibold">{lastFedMessage}</Text>
      </Text>
    </View>
  );
};
