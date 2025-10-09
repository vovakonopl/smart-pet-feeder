import { View } from 'react-native';

import { Text } from '@/src/components/nativewindui/Text';

export default function BleScreen() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>BLE Screen</Text>
    </View>
  );
}
