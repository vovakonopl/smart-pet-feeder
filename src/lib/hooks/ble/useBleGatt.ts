import base64 from 'base-64';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Device, Subscription } from 'react-native-ble-plx';

import { askBlePermissions } from '@/src/lib/ble/ble-state';
import {
  findValidGattService,
  type GattData,
} from '@/src/lib/ble/gatt-resolver';

type TBleGatt = {
  isConnected: boolean;
  isConnecting: boolean;
  readDeviceId: () => string | null;
  writeSsid: (val: string) => Promise<void>;
  writePassword: (val: string) => Promise<void>;
  subscribeNotifications: (onMsg: (str: string) => void) => Promise<void>;
};

export function useBleGatt(device: Device): TBleGatt {
  const [gattData, setGattData] = useState<GattData | null>(null);
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

  const writeChar = async (charUuid: string, val: string) => {
    if (!isConnected) return;
    if (!device || !gattData) return;

    await device.writeCharacteristicWithResponseForService(
      gattData.service.uuid,
      charUuid,
      base64.encode(val),
    );
  };
  const writeSsid = (val: string) =>
    writeChar(gattData?.ssidWriteChar.uuid ?? '', val);
  const writePassword = (val: string) =>
    writeChar(gattData?.passwordWriteChar.uuid ?? '', val);

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
    writeSsid,
    writePassword,
    subscribeNotifications,
  };
}
