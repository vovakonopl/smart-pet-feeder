import { Device } from 'react-native-ble-plx';

import { findValidGattService } from '@/src/lib/ble/gatt-resolver';

// utility to limit promise time
function resolveWithin<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), ms);

    const onResolve = (val: T) => {
      clearTimeout(timeout);
      resolve(val);
    };
    const onReject = (err: any) => {
      clearTimeout(timeout);
      reject(err);
    };

    promise.then(onResolve, onReject);
  });
}

// verify that device has required GATT characteristics
export async function verifyDeviceHasGatt(device: Device): Promise<boolean> {
  let dev: Device | null = null;
  try {
    dev = await resolveWithin(device.connect(), 5000);
    const gattData = await resolveWithin(findValidGattService(device), 15000);

    return !!gattData;
  } catch (_) {
    return false;
  } finally {
    try {
      await dev?.cancelConnection();
    } catch {}
  }
}
