import { cn } from '@/lib/utils';

export function GlassCard({
  as: Tag = 'div',
  padding = 'p-5',
  glow = true,
  className,
  children,
  ...rest
}) {
  return (
    <Tag
      className={cn(
        'glass-card rounded-[1.25rem]',
        padding,
        glow && 'seasonal-down-glow',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
