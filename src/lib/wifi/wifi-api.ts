import { Alert, Linking, Platform } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';

export async function isWifiOn(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  try {
    return await WifiManager.isEnabled();
  } catch {
    return false;
  }
}

export async function openWifiSettings() {
  if (Platform.OS === 'ios') {
    await Linking.openURL('App-Prefs:WIFI');
    return;
  }

  try {
    // works on Android 10+
    await Linking.sendIntent?.(
      'android.settings.panel.action.INTERNET_CONNECTIVITY',
    );
    return;
  } catch {}

  try {
    // if previous try was unsuccessful
    await Linking.sendIntent?.('android.settings.WIFI_SETTINGS');
    return;
  } catch {}

  // send an alert if the settings could not be opened
  Alert.alert('Wi-Fi disabled', 'Enable Wi-Fi first', [
    {
      text: 'Open settings',
      onPress: Linking.openSettings,
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
