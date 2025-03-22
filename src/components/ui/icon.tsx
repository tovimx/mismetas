import { cn } from '@/lib/utils';
import { Icons, type IconName } from './icons';
import { type LucideIcon } from 'lucide-react';

interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 16, className, ...props }: IconProps) {
  const IconComponent = Icons[name] as LucideIcon;
  return (
    <div className={cn('inline-flex', className)} {...props}>
      <IconComponent size={size} />
    </div>
  );
}
