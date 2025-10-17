import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

import ConnectableDevicesList from '@/app/device-config/_components/devices-list/ConnectableDevicesList';
import WifiForm from '@/app/device-config/_components/WifiForm';
import ThemeWrapper from '@/src/components/ThemeWrapper';
import { Title1 } from '@/src/components/ui/titles';

export default function DeviceConfigScreen() {
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const bleManager = useMemo(() => new BleManager(), []);

  const removeDevice = async () => {
    try {
      if (!connectedDevice) return;
      await connectedDevice.cancelConnection();
    } finally {
      setConnectedDevice(null);
    }
  };

  // clean-up on unmount
  useEffect(() => {
    return () => {
      connectedDevice?.cancelConnection();
    };
  }, [connectedDevice]);

  return (
    <ThemeWrapper>
      <View className="flex-1 gap-3 bg-background p-4">
        <Title1 className="text-center">Device Configuration</Title1>

        {/* display a list of available devices if not selected yet*/}
        {!connectedDevice && (
          <ConnectableDevicesList
            bleManager={bleManager}
            onConnect={setConnectedDevice}
          />
        )}

        {/* form to configure the selected device */}
        {connectedDevice && (
          <WifiForm device={connectedDevice} removeDevice={removeDevice} />
        )}
      </View>
    </ThemeWrapper>
  );
}
