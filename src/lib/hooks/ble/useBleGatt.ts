import base64 from 'base-64';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Device, Subscription } from 'react-native-ble-plx';

import { askBlePermissions } from '@/src/lib/ble/ble-state';
import {
  findValidGattService,
  type GattServiceData,
} from '@/src/lib/ble/gatt-resolver';
import { TWifiData } from '@/src/lib/validation/wifi-schema';

type TBleGatt = {
  isConnected: boolean;
  isConnecting: boolean;
  readDeviceId: () => string | null;
  writeWifiConfig: (wifi: TWifiData) => Promise<boolean>;
  subscribeNotifications: (onMsg: (str: string) => void) => Promise<void>;
};

export function useBleGatt(device: Device): TBleGatt {
  const [gattData, setGattData] = useState<GattServiceData | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const notifyRef = useRef<Subscription | null>(null);

  // connection logic
  const connect = useCallback(async () => {
    setIsConnecting(true);

    try {
      const isAllowed = await askBlePermissions();
      if (!isAllowed) {
        setIsConnected(false);
        return;
      }

      let connectedDevice: Device = device;
      if (!(await device.isConnected())) {
        connectedDevice = await device.connect();
      }

      await connectedDevice.discoverAllServicesAndCharacteristics();
      if (Platform.OS === 'android') {
        await connectedDevice.requestMTU(185);
      }

      const gattData = await findValidGattService(connectedDevice);
      setGattData(gattData);
      setIsConnected(await device.isConnected());

      return;
    } catch {
      setIsConnected(false);
      await disconnect();
    } finally {
      setIsConnecting(false);
    }
  }, [device]);

  const disconnect = useCallback(async () => {
    notifyRef.current?.remove();
    notifyRef.current = null;
    try {
      await device.cancelConnection();
    } catch {}

    setGattData(null);
    setIsConnected(false);
  }, [device]);

  // characteristics accessors
  const readDeviceId = (): string | null => {
    if (!isConnected) return null;
    if (!gattData?.deviceIdReadChar.value) return null;
    return base64.decode(gattData.deviceIdReadChar.value);
  };

  // returns true if write was successful
  const writeWifiConfig = async (wifi: TWifiData): Promise<boolean> => {
    if (!isConnected) return false;
    if (!device || !gattData) return false;

    const wifiJson: string = JSON.stringify(wifi);
    try {
      await device.writeCharacteristicWithResponseForService(
        gattData.service.uuid,
        gattData.wifiWriteChar.uuid,
        base64.encode(wifiJson),
      );
      return true;
    } catch {
      return false;
    }
  };

  const subscribeNotifications = async (onMsg: (str: string) => void) => {
    if (!isConnected) return;
    if (!device || !gattData) return;

    notifyRef.current?.remove();
    notifyRef.current = device.monitorCharacteristicForService(
      gattData.service.uuid,
      gattData.notifyChar.uuid,
      (err, char) => {
        if (err || !char?.value) return;
        onMsg(base64.decode(char.value));
      },
    );
  };

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // unsubscribe on unmount
  useEffect(() => {
    return () => {
      notifyRef.current?.remove();
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    readDeviceId,
    writeWifiConfig,
    subscribeNotifications,
  };
}
