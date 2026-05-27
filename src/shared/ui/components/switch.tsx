import * as SwitchPrimitive from '@radix-ui/react-switch';
import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import { cn } from '@/shared/ui/lib/cn';

export const Switch = forwardRef<
  ComponentRef<typeof SwitchPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn('vd-switch vd-focus-ring', className)}
      {...props}
    >
      <SwitchPrimitive.Thumb className="vd-switch__thumb" />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = SwitchPrimitive.Root.displayName;
