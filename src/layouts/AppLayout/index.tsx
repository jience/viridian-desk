import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';
import Sidebar from '@/components/Sidebar';
import { LoginGatewayDock } from '@/components/LoginGatewayDock';
import { AssistantPanel } from '@/ui/assistant/assistant-panel';
import { AppShell, type AssistantState } from '@/ui/shell/app-shell';
import '@/styles/design-system.css';
import './index.scss';

const routeTitles = [
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
  const toggleAssistant = () => {
    setAssistantOpen((current) => !current);
  };

  return (
    <div className="app-layout">
      <AppShell
        assistant={
          assistantState === 'hidden' ? undefined : (
            <AssistantPanel collapsed={false} onToggle={toggleAssistant} />
          )
        }
        assistantState={assistantState}
        nav={<Sidebar assistantOpen={isAssistantOpen} onAssistantToggle={toggleAssistant} />}
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

          <footer className="app-layout__footer">
            <LoginGatewayDock readonly />
          </footer>
        </section>
      </AppShell>
    </div>
  );
}
