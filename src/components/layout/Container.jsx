import { cn } from '@/lib/utils';

export function Container({ className, children, ...rest }) {
  return (
    <div className={cn('mx-auto max-w-[1180px] px-5 sm:px-8', className)} {...rest}>
      {children}
    </div>
  );
}
