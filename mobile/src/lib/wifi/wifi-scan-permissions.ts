import { PermissionsAndroid, Platform } from 'react-native';

export async function requestWifiScanPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  const requestFineLocationPerm = async (): Promise<boolean> => {
    const loc = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    return loc === PermissionsAndroid.RESULTS.GRANTED;
  };

  const api = parseInt(Platform.Version.toString(), 10);
  try {
    if (api >= 33) {
      // on Android 13+ request NEARBY_WIFI_DEVICES to scan without geolocation
      const res = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
      );

      if (res === PermissionsAndroid.RESULTS.GRANTED) return true;
    }

    // Request ACCESS_FINE_LOCATION if Android version < 13 or access wasn't granted
    return await requestFineLocationPerm();
  } catch {
    return false;
  }
}
