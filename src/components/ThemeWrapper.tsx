import { ReactNode } from 'react';
import { useColorScheme, View } from 'react-native';

import { cn } from '@/src/lib/utils/cn';

type TThemeWrapperProps = {
  children: ReactNode;
};

const ThemeWrapper = ({ children }: TThemeWrapperProps) => {
  const colorScheme = useColorScheme();
  return <View className={cn('size-full', colorScheme)}>{children}</View>;
};

export default ThemeWrapper;
