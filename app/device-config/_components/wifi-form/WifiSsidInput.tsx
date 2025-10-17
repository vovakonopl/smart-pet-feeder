import { useEffect, useRef, useState } from 'react';
import {
  View,
  Platform,
  AppState,
  ActivityIndicator,
  TextInput,
} from 'react-native';

import Button from '@/src/components/ui/Button';
import InputField from '@/src/components/ui/InputField';
import Text from '@/src/components/ui/Text';
import { WIFI_FIELDS_LENGTHS } from '@/src/lib/constants/fields/wifi-fields-lengths';
import { cn } from '@/src/lib/utils/cn';
import { scanNetworks } from '@/src/lib/wifi/scan-networks';
import { isWifiOn, openWifiSettings } from '@/src/lib/wifi/wifi-api';
import { requestWifiScanPermissions } from '@/src/lib/wifi/wifi-scan-permissions';

type TWifiState = {
  isChecking: boolean;
  isWifiEnabled: boolean;
  isPermissionGranted: boolean;
};

const INITIAL_WIFI_STATE: TWifiState = {
  isChecking: true,
  isWifiEnabled: false,
  isPermissionGranted: false,
};

const SCAN_TIMEOUT_MS = 30000;

type TWifiSsidInputProps = {
  error?: string;
};
const WifiSsidInput = ({ error }: TWifiSsidInputProps) => {
  const [isPickerDisplaying, setIsPickerDisplaying] = useState(false);
  const [wifiState, setWifiState] = useState<TWifiState>(INITIAL_WIFI_STATE);
  const [ssidList, setSsidList] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const appStateRef = useRef(AppState.currentState);
  const lastScanTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  const runWifiCheck = async () => {
    if (Platform.OS !== 'android') {
      setWifiState({
        isChecking: false,
        isWifiEnabled: false,
        isPermissionGranted: false,
      });
      return;
    }

    setWifiState((prev) => ({ ...prev, isChecking: true }));
    const isPermissionGranted = await requestWifiScanPermissions();
    const isWifiEnabled = await isWifiOn();

    setWifiState({
      isChecking: false,
      isWifiEnabled,
      isPermissionGranted,
    });
  };

  // toggle inputs
  const handleTogglePicker = async () => {
    if (isPickerDisplaying) {
      setIsPickerDisplaying(false);
      return;
    }

    if (!wifiState.isPermissionGranted) return;
    if (!wifiState.isWifiEnabled) {
      await openWifiSettings();
      return;
    }

    setIsPickerDisplaying(true);
  };

  // run first check on mount
  useEffect(() => {
    runWifiCheck();

    // recheck Wi-Fi state
    const subscription = AppState.addEventListener('change', async (state) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        state === 'active'
      ) {
        // user came back
        await runWifiCheck();
      }

      appStateRef.current = state;
    });

    return () => subscription.remove();
  }, []);

  // load nearby networks
  useEffect(() => {
    const load = async () => {
      if (isScanning) return;
      if (!isPickerDisplaying) return;
      if (!wifiState.isPermissionGranted || !wifiState.isWifiEnabled) {
        return;
      }

      try {
        const isDataFresh =
          Date.now() - lastScanTimeRef.current <= SCAN_TIMEOUT_MS;
        if (isDataFresh && ssidList.length > 0) return;

        // rescan the networks
        setIsScanning(true);
        const ssids = await scanNetworks();
        setIsScanning(false);

        if (!isMountedRef.current) return;

        lastScanTimeRef.current = Date.now();
        setSsidList(ssids);
      } catch (err) {
        if (!isMountedRef.current) return;

        setIsScanning(false);
        setSsidList([]);
      }
    };

    load();
  }, [isPickerDisplaying, isScanning, ssidList, wifiState]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (wifiState.isChecking) {
    return (
      <View className="gap-2">
        <InputField
          error={error}
          label="Wi-Fi Network"
          placeholder="Network name"
          maxLength={WIFI_FIELDS_LENGTHS.ssid.max}
        />

        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" />
          <Text color="muted" className="text-sm">
            Checking Wi-Fi & permissions…
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-3">
      {/* TODO: display picker */}
      {isPickerDisplaying && (
        <View className="flex-1 flex-row gap-3">
          <Text className="flex-1">Picker</Text>
          <Button
            variant={isPickerDisplaying ? 'outlined' : 'default'}
            disabled={!wifiState.isWifiEnabled}
            onPress={handleTogglePicker}
            className="p-2"
          >
            {/* TODO: display icon instead */}
            {isPickerDisplaying ? 'P' : 'T'}
          </Button>
        </View>
      )}

      {/* default input */}
      {!isPickerDisplaying && (
        <InputField
          error={error}
          label="Wi-Fi Network"
          placeholder="Network name"
          maxLength={WIFI_FIELDS_LENGTHS.ssid.max}
          containerClassName="flex-1"
          renderInput={(inputProps) => (
            <View className="flex-row gap-3">
              <TextInput
                {...inputProps}
                className={cn(inputProps?.className, 'flex-1')}
              />

              <Button
                variant={isPickerDisplaying ? 'outlined' : 'default'}
                disabled={!wifiState.isWifiEnabled}
                onPress={handleTogglePicker}
                className="p-2"
              >
                {/* TODO: display icon instead */}
                {isPickerDisplaying ? 'P' : 'T'}
              </Button>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default WifiSsidInput;
