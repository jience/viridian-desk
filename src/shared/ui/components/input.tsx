import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/ui/lib/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn('vd-input vd-focus-ring', className)}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
