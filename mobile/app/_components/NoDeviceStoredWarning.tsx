import { Link } from 'expo-router';
import { View } from 'react-native';

import Text from '@/src/components/ui/Text';
import { cn } from '@/src/lib/utils/cn';

const NoDeviceStoredWarning = () => {
  return (
    <View
      className={cn(
        'mb-3 flex-row items-center justify-between rounded-2xl bg-amber-50 px-4 py-3',
      )}
    >
      <Text className="text-sm text-amber-400">No device was found.</Text>
      <Link href="/device-config" asChild>
        <Text weight="semibold" className="text-sm text-amber-400">
          Configure Device
        </Text>
      </Link>
    </View>
  );
};

export default NoDeviceStoredWarning;
