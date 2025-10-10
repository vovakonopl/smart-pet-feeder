import { Alert, Linking, Platform, PermissionsAndroid } from 'react-native';
import { BleManager, State as BleState } from 'react-native-ble-plx';

export async function askBlePermissions(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return true;
  }

  if (Platform.OS === 'android') {
    const apiLevel = parseInt(Platform.Version.toString(), 10);
    // before Android 12
    if (apiLevel < 31 && PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    // Android 12+
    if (
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    ) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

      return Object.values(result).every(
        (status) => status === PermissionsAndroid.RESULTS.GRANTED,
      );
    }
  }

  return false;
}

export async function isBlePoweredOn(manager: BleManager): Promise<boolean> {
  const state: BleState = await manager.state();
  return state === 'PoweredOn';
}

// TODO: remove this function
// wait for BLE PoweredOn state with timeout
const timeoutMs = 20000;
function waitForBlePoweredOn(manager: BleManager): Promise<boolean> {
  return new Promise(async (resolve) => {
    const currentState: BleState = await manager.state();
    if (currentState === 'PoweredOn') return resolve(true);

    const timeout = setTimeout(() => {
      try {
        subscription.remove();
      } finally {
        resolve(false);
      }
    }, timeoutMs);

    const subscription = manager.onStateChange((state: BleState) => {
      if (state !== 'PoweredOn') return;

      clearTimeout(timeout);
      subscription.remove();
      resolve(true);
    }, true);
  });
}

// Prompt user to enable Bluetooth: open Settings
export async function promptEnableBluetooth(): Promise<void> {
  const message = 'Enable Bluetooth to continue';
  Alert.alert('Bluetooth disabled', message, [
    {
      text: 'Open settings',
      onPress: () => {
        if (Platform.OS === 'ios') {
          Linking.openURL('App-Prefs:Bluetooth');
          return;
        }

        Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS');
      },
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}

// Checks for permissions returns whether BLE is powered on.
// Prompts user to enable if it is disabled.
export async function ensureBleReady(manager: BleManager): Promise<boolean> {
  await askBlePermissions();
  if (await isBlePoweredOn(manager)) return true;

  await promptEnableBluetooth();
  return waitForBlePoweredOn(manager);
}
