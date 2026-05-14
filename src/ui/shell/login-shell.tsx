import type { ReactNode } from 'react';

interface LoginShellProps {
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  aside?: ReactNode;
}

export function LoginShell({ header, children, footer, aside }: LoginShellProps) {
  return (
    <div className="vd-login-shell">
      <section className="vd-login-shell__content">
        <header>{header}</header>
        <main className="vd-login-shell__main">{children}</main>
        <footer>{footer}</footer>
      </section>
      {aside && <aside className="vd-login-shell__aside">{aside}</aside>}
    </div>
  );
}
