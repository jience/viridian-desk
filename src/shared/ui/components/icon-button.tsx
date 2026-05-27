import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/ui/lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, icon, className, type, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={cn('vd-icon-button vd-focus-ring', className)}
        type={type ?? 'button'}
        {...props}
      >
        {icon}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
