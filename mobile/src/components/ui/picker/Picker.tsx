import { ChevronDown } from 'lucide-react-native';
import { Fragment, ReactNode, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import BreakLine from '@/src/components/ui/BreakLine';
import Icon from '@/src/components/ui/Icon';
import Modal from '@/src/components/ui/Modal';
import PickerItem from '@/src/components/ui/picker/PickerItem';
import Text from '@/src/components/ui/Text';
import { Title2 } from '@/src/components/ui/titles';
import { cn } from '@/src/lib/utils/cn';

type TPickerProps = {
  children?: ReactNode;
  className?: string;
  placeholder?: string;
  onChange?: (val: string) => void;
  title?: string;
  value?: string;
  values: string[];
};

const Picker = ({
  children,
  className,
  placeholder = 'Select item',
  onChange,
  title,
  value,
  values,
}: TPickerProps) => {
  const [localValue, setLocalValue] = useState<string>(value ?? '');
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);

  useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);

  const handleOpenModal = () => {
    setIsModalOpened(true);
  };

  const handleCloseModal = () => {
    setIsModalOpened(false);
  };

  const handleSelect = (value: string) => {
    onChange?.(value);
    handleCloseModal();

    // if uncontrolled
    if (!value) {
      setLocalValue(value);
      return;
    }
  };

  return (
    <>
      <Pressable
        className={cn(
          'flex-row items-center justify-between gap-2 rounded-md border border-neutral-300 px-4 py-2',
          className,
        )}
        onPress={handleOpenModal}
      >
        <Text className={cn(!localValue && 'text-muted-foreground')}>
          {localValue || placeholder}
        </Text>

        <Icon icon={ChevronDown} className="size-3 color-neutral-600" />
      </Pressable>

      <Modal isVisible={isModalOpened} close={handleCloseModal}>
        <View className="min-h-[50vh]">
          {title && <Title2 className="mb-2 text-center">{title}</Title2>}

          <View>
            {values.map((value, idx) => (
              <Fragment key={Math.random()}>
                <PickerItem value={value} onPress={handleSelect} />
                {idx !== values.length - 1 && <BreakLine />}
              </Fragment>
            ))}

            {children}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Picker;
