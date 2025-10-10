import { useEffect, useMemo, useRef, useState } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';

import { askBlePermissions, ensureBleReady } from '@/src/lib/ble/ble-state';
import { verifyDeviceHasGatt } from '@/src/lib/ble/device-verification';

export function useFindValidDevices(): Device[] {
  const [validDevices, setValidDevices] = useState<Device[]>([]);
  const manager = useMemo(() => new BleManager(), []);
  const queue = useRef<Device[]>([]); // queue of devices to verify

  // avoid duplicates and re-processing
  const seenIdsRef = useRef<Set<string>>(new Set());
  const validIdsRef = useRef<Set<string>>(new Set());

  const isScanning = useRef<boolean>(false); // scanning is in progress
  const isProcessing = useRef<boolean>(false); // queue processing is in progress
  const isUnmounted = useRef<boolean>(false); // avoid state updates after unmount

  const startScan = () => {
    // already scanning or unmounted
    if (isScanning.current || isUnmounted.current) return;

    isScanning.current = true;
    manager.startDeviceScan(null, null, (_, device) => {
      if (!device) return;

      const id = device.id;
      // already found
      if (seenIdsRef.current.has(id) || validIdsRef.current.has(id)) return;

      seenIdsRef.current.add(id);
      queue.current.push(device);
      processQueue(); // нон-блокінг
    });
  };

  const stopScan = () => {
    if (!isScanning.current) return;

    manager.stopDeviceScan();
    isScanning.current = false;
  };

  const processQueue = async () => {
    if (isProcessing.current) return;

    isProcessing.current = true;
    while (!isUnmounted.current && queue.current.length > 0) {
      // while processing a device, stop scanning to avoid connection issues
      stopScan();

      const dev = queue.current.shift()!;
      const isValid = await verifyDeviceHasGatt(dev);

      // after processing, resume scanning
      startScan();

      if (isValid && !validIdsRef.current.has(dev.id)) {
        validIdsRef.current.add(dev.id);
        setValidDevices((prev) => [...prev, dev]);
      }
    }

    isProcessing.current = false;
  };

  // on mount: ask permissions, ensure BLE is ready, start scanning
  // on unmount: stop scanning, destroy manager
  useEffect(() => {
    (async () => {
      const isBleAllowed = await askBlePermissions();
      if (!isBleAllowed) return;

      const isBleReady = await ensureBleReady(manager);
      if (!isBleReady) return;

      startScan();
    })();

    return () => {
      isUnmounted.current = true;
      stopScan();
      manager.destroy();
    };
  }, [manager]);

  return validDevices;
}
