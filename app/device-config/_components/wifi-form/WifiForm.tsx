import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Alert, View } from 'react-native';
import { Device } from 'react-native-ble-plx';

import WifiSsidInput from '@/app/device-config/_components/wifi-form/WifiSsidInput';
import Button from '@/src/components/ui/Button';
import InputField from '@/src/components/ui/InputField';
import Text from '@/src/components/ui/Text';
import { Title2 } from '@/src/components/ui/titles';
import { ASYNC_STORAGE_DEVICE_ID_KEY } from '@/src/lib/constants/async-storage/device-id-key';
import { WIFI_FIELDS_LENGTHS } from '@/src/lib/constants/fields/wifi-fields-lengths';
import { useBleGatt } from '@/src/lib/hooks/ble/useBleGatt';
import { TWifiData, wifiSchema } from '@/src/lib/validation/wifi-schema';

type TWifiFormProps = {
  device: Device;
  removeDevice: () => void;
};

const WifiForm = ({ device, removeDevice }: TWifiFormProps) => {
  const [notification, setNotification] = useState<string | null>(null);
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
    clearErrors,
    control,
  } = useForm<TWifiData>({
    defaultValues: {
      ssid: '',
      password: '',
    },
    resolver: zodResolver(wifiSchema),
  });
  const {
    isConnected,
    isConnecting,
    readDeviceId,
    writeWifiConfig,
    subscribeNotifications,
  } = useBleGatt(device);

  // subscribe to notifications when connected
  useEffect(() => {
    if (!isConnected) return;

    subscribeNotifications((msg: string) => {
      setNotification(msg);
    });
  }, [isConnected, subscribeNotifications]);

  // redirect on success, store device id locally
  useEffect(() => {
    if (notification !== 'success') return;

    const deviceId = readDeviceId();
    if (!deviceId) return;

    AsyncStorage.setItem(ASYNC_STORAGE_DEVICE_ID_KEY, deviceId).catch(() => {
      Alert.alert(
        "Error: can't save device ID",
        'You successfully configured the device, but the device could not be saved.\n' +
          'You might need to connect to the device again in the future.',
      );
    });

    // TODO: store deviceId into the redux store
  }, [notification, readDeviceId]);

  const onSubmit = async (data: TWifiData) => {
    const res: boolean = await writeWifiConfig(data);
    console.log('wrote');
    if (!res) {
      setError('root', { message: 'Could not send data to the device' });
      return;
    }

    clearErrors('root');
  };

  // display connection error
  if (!isConnecting && !isConnected) {
    return (
      <View>
        <Title2 className="text-destructive">
          Can't connect to {device.name}!
        </Title2>

        <Button onPress={removeDevice}>Back to devices</Button>
      </View>
    );
  }

  return (
    <View className="gap-5 rounded-lg bg-card p-4">
      <Title2 className="text-center dark:text-white">
        Connect {device.name} to WiFi
      </Title2>

      <Controller
        control={control}
        name="ssid"
        render={({ fieldState: { error }, field: { onChange, value } }) => (
          <WifiSsidInput
            error={error?.message}
            onChange={onChange}
            value={value}
          />
        )}
      />

      {/* password */}
      <Controller
        control={control}
        name="password"
        render={({ fieldState: { error }, field: { onChange, value } }) => (
          <InputField
            error={error?.message}
            label="Password"
            placeholder="Enter password"
            maxLength={WIFI_FIELDS_LENGTHS.password.max}
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <View className="gap-2">
        <Button disabled={isSubmitting} onPress={handleSubmit(onSubmit)}>
          Connect
        </Button>

        <Button variant="outlined" onPress={removeDevice}>
          Cancel
        </Button>
      </View>

      {/* notification message */}
      {notification && (
        <Text className="text-sm text-muted-foreground">{notification}</Text>
      )}
    </View>
  );
};

export default WifiForm;
