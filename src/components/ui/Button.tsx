import { cva } from 'class-variance-authority';
import { LucideIcon } from 'lucide-react-native';
import { ComponentProps, ReactNode } from 'react';
import { Pressable } from 'react-native';

import Icon from '@/src/components/ui/Icon';
import Text from '@/src/components/ui/Text';
import { cn } from '@/src/lib/utils/cn';

const buttonVariants = cva(
  'flex-row justify-center gap-2 rounded-md px-6 py-3 transition active:opacity-85 disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        destructive: 'bg-destructive',
        outlined:
          'border border-primary bg-black/0 active:bg-black/5 dark:bg-white/0 dark:active:bg-white/10',
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
      destructive: 'text-primary-foreground',
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
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  iconClassName?: string;
  textClassName?: string;
  variant?: 'default' | 'destructive' | 'outlined';
} & ComponentProps<typeof Pressable>;

const Button = ({
  children,
  className,
  leftIcon,
  rightIcon,
  iconClassName,
  textClassName,
  variant = 'default',
  ...props
}: TButtonProps) => {
  const iconStyles = cn(
    buttonTextVariants({ variant }),
    'size-6',
    iconClassName,
  );

  return (
    <Pressable
      {...props}
      className={cn(buttonVariants({ variant }), className)}
    >
      {leftIcon && <Icon icon={leftIcon} className={iconStyles} />}

      <Text
        weight="semibold"
        className={cn(buttonTextVariants({ variant }), textClassName)}
      >
        {children}
      </Text>

      {rightIcon && <Icon icon={rightIcon} className={iconStyles} />}
    </Pressable>
  );
};

type TIconButtonProps = Omit<TButtonProps, 'textClassName' | 'children'> & {
  icon: LucideIcon;
  iconClassName?: string;
};

const IconButton = ({
  className,
  icon,
  iconClassName,
  variant = 'default',
  ...props
}: TIconButtonProps) => {
  return (
    <Pressable
      {...props}
      className={cn(
        buttonVariants({ variant }),
        'aspect-square items-center justify-center p-2',
        className,
      )}
    >
      <Icon
        icon={icon}
        className={cn(buttonTextVariants({ variant }), 'size-6', iconClassName)}
      />
    </Pressable>
  );
};

export default Button;
export { IconButton };
