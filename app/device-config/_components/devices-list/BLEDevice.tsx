import { Bluetooth } from 'lucide-react-native';
import { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import { Device } from 'react-native-ble-plx';

import Text from '@/src/components/ui/Text';
import { cn } from '@/src/lib/utils/cn';

type TBleDeviceProps = {
  connectingToId: string | null;
  device: Device;
} & ComponentProps<typeof Pressable>;

const BleDevice = ({ connectingToId, device, ...props }: TBleDeviceProps) => {
  return (
    <Pressable
      {...props}
      // disable all items while connecting to any
      disabled={!!connectingToId || props.disabled}
      className={cn(
        'flex-row items-center gap-3 rounded-lg bg-card p-3 transition-opacity active:opacity-80',
        props.className,
      )}
    >
      <View className="size-9 rounded-full bg-neutral-200 p-2">
        {/* color = neutral-600 */}
        <Bluetooth size={20} color="#565d6d" />
      </View>

      <View className="flex-1">
        <Text weight="medium">{device.name}</Text>
        <Text className="text-xs text-muted-foreground">{device.id}</Text>
      </View>

      {/* Connecting to the current device */}
      {connectingToId === device.id && (
        <View className="rounded-full bg-neutral-200 px-2 py-1">
          <Text className="font-openSans-semibold text-xs text-muted-foreground">
            Connecting
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export default BleDevice;
