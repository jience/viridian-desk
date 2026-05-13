import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/ui/lib/cn';

const buttonVariants = cva(
  'vd-focus-ring inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-vd-rail text-vd-accent hover:brightness-110',
        secondary: 'bg-vd-panel-subtle text-vd-text hover:brightness-95',
        ghost: 'bg-transparent text-vd-text hover:bg-vd-panel-subtle',
        danger: 'bg-vd-danger text-white hover:brightness-110',
      },
      size: {
        sm: 'h-8 rounded-lg px-3 text-xs',
        md: 'h-10',
        lg: 'h-12 rounded-2xl px-5',
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
