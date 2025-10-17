import { cva } from 'class-variance-authority';
import { ComponentProps, ReactNode } from 'react';
import { Pressable } from 'react-native';

import Text from '@/src/components/ui/Text';
import { cn } from '@/src/lib/utils/cn';

const buttonVariants = cva(
  'rounded-md px-6 py-3 transition active:opacity-85 disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        outlined:
          'bg-black/0 border border-primary active:bg-black/5 dark:bg-white/0 dark:active:bg-white/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const buttonTextVariants = cva('text-center', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      outlined: 'text-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type TButtonProps = {
  children: ReactNode;
  className?: string;
  textClassName?: string;
  variant?: 'default' | 'outlined';
} & ComponentProps<typeof Pressable>;

const Button = ({
  children,
  className,
  textClassName,
  variant = 'default',
  ...props
}: TButtonProps) => {
  return (
    <Pressable
      {...props}
      className={cn(buttonVariants({ variant }), className)}
    >
      <Text
        weight="semibold"
        className={cn(buttonTextVariants({ variant }), textClassName)}
      >
        {children}
      </Text>
    </Pressable>
  );
};

export default Button;
