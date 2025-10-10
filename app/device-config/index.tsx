import { View } from 'react-native';

import { Text } from '@/src/components/nativewindui/Text';
import Button from '@/src/components/ui/Button';
import { useFindValidDevices } from '@/src/lib/hooks/ble/useFindValidDevices';

export default function BleScreen() {
  const devices = useFindValidDevices();

  return (
    <View className="flex-1 gap-3 p-4">
      <Text>BLE screen</Text>
      {devices.map((device) => (
        <Button key={device.id}>
          {device.id} ({device.name})
        </Button>
      ))}
    </View>
  );
}
