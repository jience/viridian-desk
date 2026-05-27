import type { ReactNode } from 'react';

interface PreLoginSettingsShellProps {
  sidebar: ReactNode;
  children: ReactNode;
  header?: ReactNode;
}

export function PreLoginSettingsShell({ sidebar, children, header }: PreLoginSettingsShellProps) {
  return (
    <div className="vd-prelogin-settings-shell">
      <aside className="vd-prelogin-settings-shell__sidebar">{sidebar}</aside>
      <main className="vd-prelogin-settings-shell__main">
        {header && <header className="vd-prelogin-settings-shell__header">{header}</header>}
        <div className="vd-prelogin-settings-shell__content">{children}</div>
      </main>
    </div>
  );
}
