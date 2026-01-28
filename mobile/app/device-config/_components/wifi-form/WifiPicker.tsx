import Picker from '@/src/components/ui/picker/Picker';
import PickerItem from '@/src/components/ui/picker/PickerItem';
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
      className={cn('flex-1', error && 'border-destructive')}
      values={ssidList}
      onChange={onChange}
      title="Select Network"
      value={value}
    >
      {isScanning && (
        <PickerItem
          className="text-neutral-300"
          value="Scanning"
          disabled={true}
        />
      )}
    </Picker>
  );
};

export default WifiPicker;
