import { Picker as RNPicker } from '@react-native-picker/picker';
import { View } from 'react-native';

import { cn } from '@/src/lib/utils/cn';

export function Picker<T>({
  mode = 'dropdown',
  style,
  dropdownIconColor,
  dropdownIconRippleColor,
  className,
  ...props
}: React.ComponentProps<typeof RNPicker<T>>) {
  return (
    <View
      className={cn(
        'ios:shadow-sm ios:shadow-black/5 h-12 justify-center rounded-md border border-neutral-300 bg-background',
        className,
      )}
    >
      <RNPicker
        mode={mode}
        style={
          style ?? {
            borderRadius: 8,
          }
        }
        dropdownIconColor={dropdownIconColor}
        dropdownIconRippleColor={dropdownIconRippleColor}
        {...props}
      />
    </View>
  );
}

export const PickerItem = RNPicker.Item;
