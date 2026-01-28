import { useState } from 'react';
import { Alert, View } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

import BleDevice from '@/app/device-config/_components/devices-list/BLEDevice';
import Button from '@/src/components/ui/Button';
import Text from '@/src/components/ui/Text';
import { Title3 } from '@/src/components/ui/titles';
import { useScanValidDevices } from '@/src/lib/hooks/ble/useScanValidDevices';

type TConnectableDevicesListProps = {
  bleManager: BleManager;
  onConnect: (device: Device) => void;
};

const ConnectableDevicesList = ({
  bleManager,
  onConnect,
}: TConnectableDevicesListProps) => {
  const { isScanActive, startScan, stopScan, devices } =
    useScanValidDevices(bleManager);
  const [connectingToId, setConnectingToId] = useState<string | null>(null);

  const handleStartScan = () => {
    if (isScanActive) return;
    startScan();
  };

  const onPress = async (device: Device) => {
    setConnectingToId(device.id);

    // stop scan before connecting
    await stopScan();

    try {
      const connectedDevice = await device.connect();

      // if successfully connected
      if (await connectedDevice.isConnected()) {
        onConnect(connectedDevice);
      }
    } catch {
      setConnectingToId(null);
      Alert.alert(`Can't connect to ${device.name}`, 'Something went wrong.');
    }
  };

  return (
    <View className="gap-6">
      <View className="gap-3 rounded-lg bg-primary/20 p-4 dark:bg-primary/50">
        <Title3 weight="semibold" className="text-center">
          Available devices
        </Title3>

        {/* list */}
        <View className="gap-3">
          {devices.map((device) => (
            <BleDevice
              device={device}
              connectingToId={connectingToId}
              onPress={() => onPress(device)}
              key={device.id}
            />
          ))}

          {devices.length === 0 && (
            <Text className="text-center text-sm text-gray-600 dark:text-gray-300">
              No devices found
            </Text>
          )}
        </View>
      </View>

      <Button
        disabled={isScanActive || !!connectingToId} // disabled while scanning or connecting
        onPress={handleStartScan}
      >
        {isScanActive ? 'Scanning' : 'Start scanning'}
      </Button>
    </View>
  );
};

export default ConnectableDevicesList;
