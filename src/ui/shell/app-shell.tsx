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
        'vd-app-shell',
        assistantState === 'expanded' && 'vd-app-shell--assistant-expanded',
        assistantState === 'collapsed' && 'vd-app-shell--assistant-collapsed',
        assistantState === 'hidden' && 'vd-app-shell--assistant-hidden',
      )}
    >
      <aside className="vd-app-shell__rail">
        {nav}
        <div className="vd-app-shell__spacer" />
        {userMenu}
      </aside>
      <main className="vd-app-shell__main">{children}</main>
      {assistantState !== 'hidden' && (
        <aside className="vd-app-shell__assistant">{assistant}</aside>
      )}
    </div>
  );
}
