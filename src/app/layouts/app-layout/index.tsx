import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';
import Sidebar from '@/features/shell/components/sidebar';
import { AppShell, type AssistantState } from '@/shared/ui/shell/app-shell';
import { DocumentTitle } from '@/shared/ui/shell/document-title';
import '@/styles/design-system.css';
import './index.scss';

const AssistantPanel = lazy(() =>
  import('@/shared/ui/assistant/assistant-panel').then((module) => ({
    default: module.AssistantPanel,
  })),
);
const LoginGatewayDock = lazy(() =>
  import('@/features/shell/components/gateway-dock').then((module) => ({
    default: module.LoginGatewayDock,
  })),
);

const routeTitles = [
  { match: '/app/empty', titleKey: 'navigation.empty' },
  { match: '/app/deskDetail', titleKey: 'navigation.detail' },
  { match: '/app/desk', titleKey: 'navigation.desktop' },
  { match: '/app/application', titleKey: 'navigation.application' },
  { match: '/app/peripheral', titleKey: 'navigation.peripheral' },
  { match: '/app/approval', titleKey: 'navigation.approval' },
  { match: '/app/malfunction', titleKey: 'navigation.desktopIssues' },
] as const;

export function AppLayout() {
  const { t: commonT } = useTranslation('common');
  const location = useLocation();
  const [assistantOpen, setAssistantOpen] = useState(false);

  const routeMeta = useMemo(() => {
    return routeTitles.find((item) => location.pathname.startsWith(item.match)) ?? routeTitles[1];
  }, [location.pathname]);

  const assistantState: AssistantState = assistantOpen ? 'expanded' : 'hidden';
  const isAssistantOpen = assistantState === 'expanded';
  const toggleAssistant = useCallback(() => {
    setAssistantOpen((current) => !current);
  }, []);

  const assistantSlot = useMemo(() => {
    if (assistantState === 'hidden') return undefined;
    return (
      <Suspense fallback={null}>
        <AssistantPanel collapsed={false} onToggle={toggleAssistant} />
      </Suspense>
    );
  }, [assistantState, toggleAssistant]);

  const navSlot = useMemo(
    () => <Sidebar assistantOpen={isAssistantOpen} onAssistantToggle={toggleAssistant} />,
    [isAssistantOpen, toggleAssistant],
  );

  const footerSlot = useMemo(
    () => (
      <Suspense fallback={null}>
        <LoginGatewayDock readonly />
      </Suspense>
    ),
    [],
  );

  return (
    <div className="app-layout">
      <DocumentTitle title={commonT(routeMeta.titleKey)} />
      <AppShell
        assistant={assistantSlot}
        assistantState={assistantState}
        nav={navSlot}
        userMenu={null}
      >
        <section className="app-layout__workspace">
          <header className="app-layout__header">
            <div>
              <h1 className="app-layout__title">{commonT(routeMeta.titleKey)}</h1>
            </div>
          </header>

          <main className="app-layout__content">
            <Outlet />
          </main>

          <footer className="app-layout__footer">{footerSlot}</footer>
        </section>
      </AppShell>
    </div>
  );
}
