import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-[15px]',
  lg: 'px-7 py-3.5 text-base',
};

const variants = {
  primary:
    'btn-shine btn-primary-surface text-white shadow-[var(--btn-shadow)] hover:brightness-[1.05] hover:shadow-[0_10px_28px_hsl(var(--seasonal-primary)/0.38)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98] active:brightness-95',
  secondary:
    'bg-white/60 backdrop-blur-md text-foreground border border-[hsl(var(--seasonal-primary)/0.13)] hover:bg-white/80 hover:-translate-y-px active:translate-y-0 active:scale-[0.98]',
  ghost:
    'bg-transparent text-foreground hover:bg-[hsl(var(--seasonal-primary)/0.06)] active:scale-[0.98]',
  outline:
    'border-2 border-[hsl(var(--seasonal-primary)/0.4)] bg-transparent text-foreground hover:bg-[hsl(var(--seasonal-primary)/0.06)] active:scale-[0.98]',
};

const baseClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--btn-radius)] font-semibold transition-[transform,box-shadow,filter,background-color,border-color,color,opacity] duration-[var(--btn-duration)] ease-[var(--btn-easing)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--seasonal-primary)/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none';

/** Shared classes for `<Link>` / `<a>` styled as buttons */
export function buttonClassName(variant = 'primary', size = 'md', className) {
  return cn(baseClass, variants[variant], sizes[size], className);
}

export const Button = forwardRef(
  ({ variant = 'primary', size = 'md', className, style, children, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      className={buttonClassName(variant, size, className)}
      style={style}
      {...rest}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
