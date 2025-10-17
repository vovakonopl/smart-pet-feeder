import { ComponentProps, ReactElement } from 'react';
import { TextInput, View } from 'react-native';

import Text from '@/src/components/ui/Text';
import { cn } from '@/src/lib/utils/cn';

type TInputProps = ComponentProps<typeof TextInput>;

type TInputFieldProps = {
  containerClassName?: string;
  error?: string;
  label: string;
  renderInput?: (props?: TInputProps) => ReactElement;
} & TInputProps;

const InputField = ({
  containerClassName,
  error,
  label,
  renderInput,
  ...props
}: TInputFieldProps) => {
  const className = cn(
    'rounded-md border border-neutral-300 px-4 py-2 font-openSans',
    props.className,
    error && 'border-destructive',
  );

  return (
    <View className={containerClassName}>
      <Text className={cn('mb-1 ml-2 text-sm', error && 'text-destructive')}>
        {label}
      </Text>

      {/* display custom field if specified */}
      {renderInput?.({ ...props, className })}

      {/* display default field*/}
      {!renderInput && <TextInput {...props} className={className} />}

      {error && <Text className="text-sm text-destructive">{error}</Text>}
    </View>
  );
};

export default InputField;
