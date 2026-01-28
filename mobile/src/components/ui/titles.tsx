import { ComponentProps } from 'react';

import Text from '@/src/components/ui/Text';
import { cn } from '@/src/lib/utils/cn';

type TTitleProps = Omit<ComponentProps<typeof Text>, 'font'>;

const Title = (props: TTitleProps) => {
  return <Text {...props} font="nunito" />;
};

const Title1 = ({ className, weight, ...props }: TTitleProps) => {
  return (
    <Title
      {...props}
      weight={weight || 'semibold'}
      className={cn('text-2xl', className)}
    />
  );
};

const Title2 = ({ className, weight, ...props }: TTitleProps) => {
  return (
    <Title
      {...props}
      weight={weight || 'medium'}
      className={cn('text-xl', className)}
    />
  );
};

const Title3 = ({ className, ...props }: TTitleProps) => {
  return <Title {...props} className={cn('text-lg', className)} />;
};

export { Title, Title1, Title2, Title3 };
