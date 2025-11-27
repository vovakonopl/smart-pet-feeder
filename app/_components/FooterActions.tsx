import { View, Pressable } from 'react-native';

import Text from '@/src/components/ui/Text';

type TFooterActionsProps = {
  onOneTimeFeed: () => void;
  onFeedNowNextSlot: () => void;
};

export const FooterActions = ({
  onOneTimeFeed,
  onFeedNowNextSlot,
}: TFooterActionsProps) => {
  return (
    <View className="border-t border-slate-200 bg-background px-2 py-3">
      <View className="flex-row flex-wrap gap-2">
        <Pressable
          onPress={onOneTimeFeed}
          className="flex-1 rounded-full bg-primary p-3"
        >
          <Text
            className="text-center text-primary-foreground"
            weight="semibold"
          >
            Feed once now
          </Text>
        </Pressable>

        <Pressable
          onPress={onFeedNowNextSlot}
          className="flex-1 rounded-full bg-secondary p-3"
        >
          <Text
            className="text-center text-secondary-foreground"
            weight="semibold"
          >
            Next feed now
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
