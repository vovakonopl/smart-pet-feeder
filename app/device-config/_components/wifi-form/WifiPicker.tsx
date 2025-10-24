import { Picker, PickerItem } from '@/components/nativewindui/Picker';
import { cn } from '@/src/lib/utils/cn';

type TWifiPickerProps = {
  error?: string;
  isScanning: boolean;
  ssidList: string[];
  onChange?: (ssid: string) => void;
  value?: string;
};

const WifiPicker = ({
  error,
  isScanning,
  ssidList,
  onChange,
  value,
}: TWifiPickerProps) => {
  return (
    <Picker
      selectedValue={value}
      onValueChange={onChange}
      className={cn('flex-1 border-neutral-300', error && 'border-destructive')}
    >
      {ssidList.map((ssid: string) => (
        <PickerItem label={ssid} value={ssid} color="black" key={ssid} />
      ))}

      {isScanning && (
        <PickerItem label="Scanning" color="gray" value="" enabled={false} />
      )}
    </Picker>
  );
};

export default WifiPicker;
