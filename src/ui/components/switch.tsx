import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/ui/lib/cn';

export function Switch({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'vd-focus-ring relative h-6 w-11 rounded-full bg-vd-panel-subtle transition data-[state=checked]:bg-vd-rail',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-0.5 rounded-full bg-vd-panel shadow transition data-[state=checked]:translate-x-5 data-[state=checked]:bg-vd-accent" />
    </SwitchPrimitive.Root>
  );
}
