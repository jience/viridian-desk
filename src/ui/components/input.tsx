import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/ui/lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'vd-focus-ring h-10 w-full rounded-xl border border-vd-border bg-vd-panel px-3 text-sm text-vd-text placeholder:text-vd-muted disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
