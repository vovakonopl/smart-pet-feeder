import { ListCheck, TextCursorInput } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Platform,
  AppState,
  ActivityIndicator,
  TextInput,
} from 'react-native';

import WifiPicker from '@/app/device-config/_components/wifi-form/WifiPicker';
import { IconButton } from '@/src/components/ui/Button';
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
  onChange?: (val: string) => void;
  value?: string;
};

const WifiSsidInput = ({ error, onChange, value }: TWifiSsidInputProps) => {
  const [isPickerDisplaying, setIsPickerDisplaying] = useState(false);
  const [wifiState, setWifiState] = useState<TWifiState>(INITIAL_WIFI_STATE);
  const [ssidList, setSsidList] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasScannedOnce, setHasScannedOnce] = useState<boolean>(false);

  const appStateRef = useRef(AppState.currentState);
  const lastScanTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  const runWifiCheck = useCallback(async () => {
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
  }, []);

  const scanNearbyNetworks = useCallback(async () => {
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
  }, [isPickerDisplaying, isScanning, ssidList, wifiState]);

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
  }, [runWifiCheck]);

  // Scan once on first Picker appear, then only by request with timeouts
  useEffect(() => {
    if (hasScannedOnce) return;
    if (isScanning) {
      setHasScannedOnce(true);
    }

    scanNearbyNetworks();
  }, [isScanning, hasScannedOnce, scanNearbyNetworks]);

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
      {isPickerDisplaying && (
        <View className="w-full gap-2">
          <Text
            className={cn('mb-1 ml-2 text-sm', error && 'text-destructive')}
          >
            Wi-Fi Network
          </Text>
          <View className="w-full flex-row items-center gap-3">
            <WifiPicker
              error={error}
              isScanning={isScanning}
              ssidList={ssidList}
              onChange={onChange}
              value={value}
            />

            <IconButton
              icon={TextCursorInput}
              disabled={!wifiState.isWifiEnabled}
              onPress={handleTogglePicker}
            />
          </View>

          {error && (
            <Text
              className={cn('mb-1 ml-2 text-sm', error && 'text-destructive')}
            >
              {error}
            </Text>
          )}
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
          onChange={(e) => onChange?.(e.nativeEvent.text)}
          value={value}
          renderInput={(inputProps) => (
            <View className="flex-row gap-3">
              <TextInput
                {...inputProps}
                className={cn(inputProps?.className, 'flex-1')}
              />

              <IconButton
                icon={ListCheck}
                disabled={!wifiState.isWifiEnabled}
                onPress={handleTogglePicker}
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

export default WifiSsidInput;
