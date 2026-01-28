import { LucideIcon, LucideProps } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { ComponentType, memo, useMemo } from 'react';

type TIconProps = {
  icon: LucideIcon;
  className?: string;
} & LucideProps;

const Icon = memo(({ icon, className, ...props }: TIconProps) => {
  const IconComponent = useMemo(() => {
    return cssInterop(icon, {
      className: {
        target: 'style',
        nativeStyleToProp: {
          color: true,
          width: true,
          height: true,
        },
      },
    }) as ComponentType<LucideProps & { className?: string }>;
  }, [icon]);

  return <IconComponent {...props} className={className} />;
});

export default Icon;
