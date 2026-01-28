import { RefreshCw } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  withDelay,
  withSequence,
} from 'react-native-reanimated';

import Icon from '@/src/components/ui/Icon';
import Text from '@/src/components/ui/Text';
import { cn } from '@/src/lib/utils/cn';
import { deviceStore } from '@/src/store/device-store';

const SyncStatus = () => {
  const { isSynced, isSyncError, retrySync } = deviceStore;
  const isSyncing = !isSynced && !isSyncError;

  // refresh icon rotation animation
  const rotation = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  useEffect(() => {
    if (isSyncing) {
      rotation.value = withRepeat(
        withSequence(
          withTiming(360, {
            duration: 1000,
            easing: Easing.bezier(0.42, 0, 0.58, 1),
          }),
          withDelay(350, withTiming(0, { duration: 0 })),
        ),
        -1,
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = withTiming(0);
    }
  }, [isSyncing, rotation]);

  let status = 'Syncing';
  if (isSynced) {
    status = 'Synced';
  } else if (isSyncError) {
    status = 'Not Synced';
  }

  return (
    <View
      className={cn(
        'mb-3 flex-row items-center justify-between rounded-2xl px-4 py-3',
        isSynced ? 'bg-green-50' : 'bg-rose-50',
        isSyncing && 'bg-amber-50',
      )}
    >
      <Text
        weight="semibold"
        className={cn(
          'text-sm',
          isSynced ? 'text-green-400' : 'text-rose-400',
          isSyncing && 'text-amber-400',
        )}
      >
        Status: {status}{' '}
        {isSyncError && (
          <Text weight="medium" className="ml-4 text-xs text-rose-400">
            (trying to re-sync)
          </Text>
        )}
      </Text>

      <Pressable onPress={retrySync} disabled={isSyncing}>
        <Animated.View style={animatedStyle}>
          <Icon
            icon={RefreshCw}
            className={cn(
              'size-5',
              isSynced ? 'text-green-600' : 'text-rose-600',
              isSyncing && 'text-amber-600',
            )}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
};

export default observer(SyncStatus);
