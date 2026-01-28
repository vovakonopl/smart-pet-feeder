import base64 from 'base-64';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';

import { ensureBleReady } from '@/src/lib/ble/ble-state';
import { DEVICE_MANUFACTURER } from '@/src/lib/constants/ble-device-data';

type TScanValidDevices = {
  isScanActive: boolean;
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  devices: Device[];
};

export function useScanValidDevices(bleManager: BleManager): TScanValidDevices {
  const [validDevices, setValidDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // to avoid duplicates
  const validIdsSetRef = useRef<Set<string>>(new Set());

  const startScan = useCallback(async () => {
    // already scanning or unmounted
    if (isScanning) return;

    setIsScanning(true);
    await bleManager.startDeviceScan(null, null, async (_, device) => {
      if (!device?.manufacturerData) return;

      const decodedManufactureData = base64.decode(device.manufacturerData);

      // skip company id (first 2 chars)
      const manufactureDataPayload = decodedManufactureData.slice(2);
      if (!manufactureDataPayload.startsWith(DEVICE_MANUFACTURER)) return; // invalid device

      // already found
      if (validIdsSetRef.current.has(device.id)) return;

      validIdsSetRef.current.add(device.id);
      setValidDevices((prev) => [...prev, device]);
    });
  }, [bleManager, isScanning]);

  const stopScan = useCallback(async () => {
    if (!isScanning) return;

    await bleManager.stopDeviceScan();
    setIsScanning(false);
  }, [bleManager]);

  // on mount: ensure BLE is ready, start scanning
  // on unmount: stop scanning
  useEffect(() => {
    (async () => {
      const isBleReady = await ensureBleReady(bleManager);
      if (!isBleReady) return;

      await startScan();
    })();

    return () => {
      stopScan();
    };
  }, [bleManager]);

  return {
    isScanActive: isScanning,
    startScan: startScan,
    stopScan: stopScan,
    devices: validDevices,
  };
}
