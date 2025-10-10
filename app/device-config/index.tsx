import { View } from 'react-native';

import { Text } from '@/src/components/nativewindui/Text';
import { useFindValidDevices } from '@/src/lib/hooks/ble/useFindValidDevices';

export default function BleScreen() {
  const devices = useFindValidDevices();

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      {devices.map((dev) => (
        <Text key={dev.id} style={{ fontSize: 18, fontWeight: '600' }}>
          {dev.id}
        </Text>
      ))}
      <Text>BLE screen</Text>
    </View>
  );
}
