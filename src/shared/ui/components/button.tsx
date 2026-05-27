import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/ui/lib/cn';

const buttonVariants = cva(
  'vd-button vd-focus-ring',
  {
    variants: {
      variant: {
        primary: 'vd-button--primary',
        secondary: 'vd-button--secondary',
        ghost: 'vd-button--ghost',
        danger: 'vd-button--danger',
      },
      size: {
        sm: 'vd-button--sm',
        md: 'vd-button--md',
        lg: 'vd-button--lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, className, variant, size, type, ...props }, ref) => {
    const classNames = cn(buttonVariants({ variant, size }), className);

    if (asChild) {
      return <Slot ref={ref} className={classNames} {...props} />;
    }

    return <button ref={ref} className={classNames} type={type ?? 'button'} {...props} />;
  },
);

Button.displayName = 'Button';
