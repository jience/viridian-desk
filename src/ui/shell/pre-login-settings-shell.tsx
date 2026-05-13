import type { ReactNode } from 'react';

interface PreLoginSettingsShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function PreLoginSettingsShell({ sidebar, children }: PreLoginSettingsShellProps) {
  return (
    <div className="grid h-full min-h-[560px] grid-cols-[236px_minmax(0,1fr)] bg-vd-bg text-vd-text">
      <aside className="border-r border-vd-border bg-vd-panel p-5">{sidebar}</aside>
      <main className="min-w-0 overflow-hidden p-6">{children}</main>
    </div>
  );
}
