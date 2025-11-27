import { Clock } from 'lucide-react-native';
import { View } from 'react-native';

import Icon from '@/src/components/ui/Icon';
import Text from '@/src/components/ui/Text';

type TLastFedCardProps = {
  lastFedLabel: string;
};

export const LastFedCard = ({ lastFedLabel }: TLastFedCardProps) => {
  return (
    <View className="mb-3 flex-row items-center rounded-2xl bg-slate-50 px-4 py-3">
      <Icon icon={Clock} size={18} className="mr-2 text-slate-600" />

      <Text className="text-sm text-slate-600">
        Last fed: <Text weight="semibold">{lastFedLabel}</Text>
      </Text>
    </View>
  );
};
