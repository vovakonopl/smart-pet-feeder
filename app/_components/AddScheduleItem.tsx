import { Plus } from 'lucide-react-native';
import { Pressable } from 'react-native';

import Icon from '@/src/components/ui/Icon';

type TAddScheduleItemProps = {
  onPress: () => void;
};

export const AddScheduleItem = ({ onPress }: TAddScheduleItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-4 right-4 size-14 items-center justify-center rounded-full bg-primary shadow-lg"
    >
      <Icon icon={Plus} size={26} className="text-primary-foreground" />
    </Pressable>
  );
};
