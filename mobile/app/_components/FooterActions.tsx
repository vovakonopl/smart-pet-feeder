import { observer } from 'mobx-react-lite';
import { View, Pressable } from 'react-native';

import Text from '@/src/components/ui/Text';
import { deviceStore } from '@/src/store/device-store';

type TFooterActionsProps = {
  disabled?: boolean;
};

const FooterActions = ({ disabled }: TFooterActionsProps) => {
  return (
    <View className="border-t border-slate-200 bg-background px-2 py-3">
      <View className="flex-row flex-wrap gap-2">
        <Pressable
          onPress={deviceStore.feedNow}
          className="flex-1 rounded-full bg-primary p-3 disabled:opacity-75"
          disabled={disabled}
        >
          <Text
            className="text-center text-primary-foreground"
            weight="semibold"
          >
            Feed once now
          </Text>
        </Pressable>

        <Pressable
          onPress={deviceStore.moveNextFeedToNow}
          className="flex-1 rounded-full bg-secondary p-3 disabled:opacity-75"
          disabled={disabled}
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

export default observer(FooterActions);
