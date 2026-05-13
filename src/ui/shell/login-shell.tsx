import type { ReactNode } from 'react';

interface LoginShellProps {
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

export function LoginShell({ header, children, footer }: LoginShellProps) {
  return (
    <div className="grid h-full min-h-[560px] grid-rows-[auto_1fr_auto] gap-5 bg-vd-bg p-6 text-vd-text">
      <header>{header}</header>
      <main className="flex min-h-0 flex-col justify-center">{children}</main>
      <footer>{footer}</footer>
    </div>
  );
}
