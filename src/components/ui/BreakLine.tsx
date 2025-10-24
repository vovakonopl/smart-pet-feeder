import { View } from 'react-native';

import { cn } from '@/src/lib/utils/cn';

type TBreakLineProps = {
  className?: string;
};

const BreakLine = ({ className }: TBreakLineProps) => {
  return <View className={cn('h-px w-full bg-gray-300', className)} />;
};

export default BreakLine;
