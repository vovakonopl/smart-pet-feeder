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
  const notifySubscriptionRef = useRef<Subscription | null>(null);

  // Акуратне відкріплення моніторингу
  const stopNotify = useCallback(async () => {
    try {
      notifySubscriptionRef.current?.remove();
    } catch {}

    notifySubscriptionRef.current = null;
  }, []);

  // connection/disconnection logic
  const disconnect = useCallback(async () => {
    try {
      await device.cancelConnection();
      await stopNotify();
    } catch {}

    setIsConnected(false);
  }, [device, stopNotify]);

  const connect = useCallback(async () => {
    setIsConnecting(true);

    try {
      const isAllowed = await askBlePermissions();
      if (!isAllowed) {
        setIsConnected(false);
        return;
      }

      let connectedDevice: Device = device;
      if (!(await connectedDevice.isConnected())) {
        connectedDevice = await device.connect();
      }

      await connectedDevice.discoverAllServicesAndCharacteristics();
      if (Platform.OS === 'android') {
        try {
          await connectedDevice.requestMTU(185);
        } catch {}
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
  }, [device, disconnect]);

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

  const subscribeNotifications = useCallback(
    async (onMsg: (str: string) => void) => {
      if (!isConnected || !device || !gattData) return;

      // clear previous subscription if there is one
      await stopNotify();
      try {
        notifySubscriptionRef.current = device.monitorCharacteristicForService(
          gattData.service.uuid,
          gattData.notifyChar.uuid,
          (_, char) => {
            if (!char?.value) return;

            try {
              onMsg(base64.decode(char.value));
            } catch {}
          },
        );
      } catch {
        await stopNotify();
      }
    },
    [device, gattData, isConnected, stopNotify],
  );

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    readDeviceId,
    writeWifiConfig,
    subscribeNotifications,
  };
}
