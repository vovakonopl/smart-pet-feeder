import { Pressable } from 'react-native';

import Text from '@/src/components/ui/Text';
import { cn } from '@/src/lib/utils/cn';

type TPickerItemProps = {
  className?: string;
  disabled?: boolean;
  onPress?: (value: string) => void;
  label?: string;
  value: string;
};

const PickerItem = ({
  className,
  disabled,
  onPress,
  label,
  value,
}: TPickerItemProps) => {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onPress?.(value)}
      className={cn(
        'rounded border-neutral-300 p-2 transition-colors active:bg-black/5',
        className,
      )}
    >
      <Text className="text-lg">{label || value}</Text>
    </Pressable>
  );
};

export default PickerItem;
