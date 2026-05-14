import type { ReactNode } from 'react';

interface LoginShellProps {
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

export function LoginShell({ header, children, footer }: LoginShellProps) {
  return (
    <div className="vd-login-shell">
      <header>{header}</header>
      <main className="vd-login-shell__main">{children}</main>
      <footer>{footer}</footer>
    </div>
  );
}
