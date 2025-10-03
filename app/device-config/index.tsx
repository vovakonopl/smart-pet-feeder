// export default function App() {
//   return (
//     <View className="flex-1 items-center justify-center bg-background">
//       <Text variant="title1" className="text-primary/50">
//         Hello BLE
//       </Text>
//     </View>
//   );
// }

// BleScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Button,
  Platform,
  PermissionsAndroid,
  Linking,
  Alert,
} from 'react-native';
import { BleManager, State as BleState } from 'react-native-ble-plx';

import { Text } from '@/components/nativewindui/Text';

export default function BleScreen() {
  const manager = useMemo(() => new BleManager(), []);
  const [ready, setReady] = useState(false);
  const [bleState, setBleState] = useState<BleState | null>(null);
  const [log, setLog] = useState<string>('idle');

  // 1) Запитуємо runtime-пермішени (ANDROID)
  const requestAndroidPermissions = useCallback(async () => {
    if (Platform.OS !== 'android') return true;
    const api = Platform.Version; // Android API level
    try {
      if (api >= 31) {
        const scan = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        );
        const conn = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        );
        return scan === 'granted' && conn === 'granted';
      } else {
        const loc = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return loc === 'granted';
      }
    } catch {
      return false;
    }
  }, []);

  // 2) Слухаємо стан BLE та перевіряємо “PoweredOn”
  useEffect(() => {
    const sub = manager.onStateChange((state) => {
      setBleState(state);
    }, true); // emit current state immediately
    return () => sub.remove();
  }, [manager]);

  // 3) Вхід на екран: перевірити пермішени + стан BLE
  useEffect(() => {
    let isActive = true;
    (async () => {
      const okPerms = await requestAndroidPermissions();
      if (!okPerms && Platform.OS === 'android') {
        Alert.alert(
          'Bluetooth permissions',
          'Надай дозволи для Bluetooth у налаштуваннях.',
          [
            {
              text: 'Відкрити налаштування',
              onPress: () => Linking.openSettings(),
            },
            { text: 'Скасувати' },
          ],
        );
        setReady(false);
        return;
      }
      // чекаємо, поки BLE стане PoweredOn
      const state = await manager.state();
      setBleState(state);
      if (state !== 'PoweredOn') {
        Alert.alert(
          'Bluetooth вимкнено',
          'Увімкни Bluetooth, щоб продовжити.',
          [
            {
              text: 'Відкрити налаштування',
              onPress: () => Linking.openSettings(),
            },
          ],
        );
        setReady(false);
        return;
      }
      isActive && setReady(true);
    })();
    return () => {
      isActive = false;
    };
  }, [manager, requestAndroidPermissions]);

  // 4) Кнопка “Почати скан” доступна тільки коли все готово
  const startScan = async () => {
    setLog('scanning…');
    // ... тут твій startDeviceScan(...) і далі — як у попередньому коді
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>BLE Screen</Text>
      <Text>BLE state: {bleState ?? 'unknown'}</Text>
      <Button title="Почати скан" onPress={startScan} disabled={!ready} />
      <Text>{log}</Text>
    </View>
  );
}
