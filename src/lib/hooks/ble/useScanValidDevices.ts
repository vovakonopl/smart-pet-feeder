import { useCallback, useEffect, useRef, useState } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';

import { ensureBleReady } from '@/src/lib/ble/ble-state';
import { verifyDeviceHasGatt } from '@/src/lib/ble/device-verification';

type TScanValidDevices = {
  isScanActive: boolean;
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  devices: Device[];
};

export function useScanValidDevices(bleManager: BleManager): TScanValidDevices {
  const [validDevices, setValidDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // to avoid duplicates and re-processing
  const seenIdsRef = useRef<Set<string>>(new Set());
  const validIdsRef = useRef<Set<string>>(new Set());

  const startScan = useCallback(async () => {
    // already scanning or unmounted
    if (isScanning) return;

    setIsScanning(true);
    await bleManager.startDeviceScan(null, null, async (_, device) => {
      if (!device) return;

      // already found
      if (seenIdsRef.current.has(device.id)) return;

      await processDevice(device);
    });
  }, [bleManager, isScanning]);

  const stopScan = useCallback(async () => {
    if (!isScanning) return;

    await bleManager.stopDeviceScan();
    setIsScanning(false);
  }, [bleManager]);

  const processDevice = async (device: Device) => {
    if (isProcessing) return;

    setIsProcessing(true);
    // while processing a device, stop scanning to avoid connection issues
    await stopScan();
    seenIdsRef.current.add(device.id);
    const isValid = await verifyDeviceHasGatt(device);

    if (isValid && !validIdsRef.current.has(device.id)) {
      validIdsRef.current.add(device.id);
      setValidDevices((prev) => [...prev, device]);
    }

    // after processing, resume scanning
    await startScan();
  };

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
    isScanActive: isScanning || isProcessing,
    startScan: startScan,
    stopScan: stopScan,
    devices: validDevices,
  };
}
