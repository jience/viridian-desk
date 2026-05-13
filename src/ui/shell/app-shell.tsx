import type { ReactNode } from 'react';
import { cn } from '@/ui/lib/cn';

export type AssistantState = 'expanded' | 'collapsed' | 'hidden';

interface AppShellProps {
  nav: ReactNode;
  userMenu: ReactNode;
  children: ReactNode;
  assistant?: ReactNode;
  assistantState?: AssistantState;
}

export function AppShell({
  nav,
  userMenu,
  children,
  assistant,
  assistantState = 'expanded',
}: AppShellProps) {
  return (
    <div
      className={cn(
        'grid h-full min-h-0 bg-vd-bg text-vd-text',
        assistantState === 'expanded' && 'grid-cols-[76px_minmax(0,1fr)_314px]',
        assistantState === 'collapsed' && 'grid-cols-[76px_minmax(0,1fr)_64px]',
        assistantState === 'hidden' && 'grid-cols-[76px_minmax(0,1fr)]',
      )}
    >
      <aside className="flex min-h-0 flex-col items-center gap-3 bg-vd-rail px-2 py-3 text-vd-panel">
        {nav}
        <div className="flex-1" />
        {userMenu}
      </aside>
      <main className="min-w-0 overflow-hidden p-5">{children}</main>
      {assistantState !== 'hidden' && (
        <aside className="min-w-0 border-l border-vd-border bg-vd-panel/70">{assistant}</aside>
      )}
    </div>
  );
}
