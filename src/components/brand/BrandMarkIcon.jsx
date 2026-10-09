import { PearBrandMark } from '@/icons/PearBrandMark';
import { cn } from '@/lib/utils';

/** İki armut markası — dekoratif ikonların yerine. */
export function BrandMarkIcon({ size = 20, className, color = 'seasonal', ...props }) {
  const style =
    color === 'white'
      ? { color: '#ffffff' }
      : color === 'seasonal'
        ? { color: 'hsl(var(--seasonal-primary))' }
        : typeof color === 'string'
          ? { color }
          : undefined;

  return (
    <PearBrandMark
      size={size}
      backdrop={color !== 'seasonal' && color !== 'white'}
      className={cn('shrink-0', className)}
      style={style}
      aria-hidden
      {...props}
    />
  );
}
