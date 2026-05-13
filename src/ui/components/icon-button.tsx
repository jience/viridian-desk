import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/ui/lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
}

export function IconButton({ label, icon, className, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cn(
        'vd-focus-ring inline-grid size-10 place-items-center rounded-xl bg-vd-panel text-vd-text transition hover:bg-vd-panel-subtle active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      type="button"
      {...props}
    >
      {icon}
    </button>
  );
}
