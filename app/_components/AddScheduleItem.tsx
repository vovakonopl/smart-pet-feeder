import { Plus } from 'lucide-react-native';
import { Pressable } from 'react-native';

import Icon from '@/src/components/ui/Icon';

type TAddScheduleItemProps = {
  disabled?: boolean;
  onPress: () => void;
};

export const AddScheduleItem = ({
  disabled,
  onPress,
}: TAddScheduleItemProps) => {
  return (
    <Pressable
      className="absolute bottom-4 right-4 size-14 items-center justify-center rounded-full bg-primary shadow-lg disabled:opacity-75"
      disabled={disabled}
      onPress={onPress}
    >
      <Icon icon={Plus} size={26} className="text-primary-foreground" />
    </Pressable>
  );
};
