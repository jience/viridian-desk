import type { ReactNode } from 'react';

interface PreLoginSettingsShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function PreLoginSettingsShell({ sidebar, children }: PreLoginSettingsShellProps) {
  return (
    <div className="vd-prelogin-settings-shell">
      <aside className="vd-prelogin-settings-shell__sidebar">{sidebar}</aside>
      <main className="vd-prelogin-settings-shell__main">{children}</main>
    </div>
  );
}
