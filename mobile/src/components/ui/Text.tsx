import { VariantProps, cva } from 'class-variance-authority';
import { ComponentProps, ReactNode } from 'react';
import { Text as RNText } from 'react-native';

import { cn } from '@/src/lib/utils/cn';

const textVariants = cva('text-base', {
  variants: {
    color: {
      primary: 'text-foreground',
      secondary: 'text-secondary-foreground',
      muted: 'text-muted-foreground',
      destructive: 'text-destructive',
    },
    font: {
      openSans: null,
      nunito: null,
    },
    weight: {
      regular: null,
      medium: null,
      semibold: null,
      bold: null,
    },
  },
  compoundVariants: [
    // Open Sans
    { font: 'openSans', weight: 'regular', class: 'font-openSans' },
    { font: 'openSans', weight: 'medium', class: 'font-openSans-medium' },
    { font: 'openSans', weight: 'semibold', class: 'font-openSans-semibold' },
    { font: 'openSans', weight: 'bold', class: 'font-openSans-bold' },
    // Nunito Sans
    { font: 'nunito', weight: 'regular', class: 'font-nunito' },
    { font: 'nunito', weight: 'medium', class: 'font-nunito-medium' },
    { font: 'nunito', weight: 'semibold', class: 'font-nunito-semibold' },
    { font: 'nunito', weight: 'bold', class: 'font-nunito-bold' },
  ],
  defaultVariants: {
    color: 'primary',
    font: 'openSans',
    weight: 'regular',
  },
});

type TTextProps = {
  children?: ReactNode;
  className?: string;
} & ComponentProps<typeof RNText> &
  VariantProps<typeof textVariants>;

function Text({ className, color, font, weight, ...props }: TTextProps) {
  return (
    <RNText
      {...props}
      className={cn(textVariants({ color, font, weight }), className)}
    />
  );
}

export default Text;
