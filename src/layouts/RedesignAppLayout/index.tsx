import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';
import Sidebar from '@/components/Sidebar';
import { GatewaySelect } from '@/components/GatewaySelect';
import { AssistantPanel } from '@/ui/assistant/assistant-panel';
import { Button } from '@/ui/components/button';
import { AppShell, type AssistantState } from '@/ui/shell/app-shell';
import '@/styles/redesign.css';
import './index.scss';

const routeTitles = [
  { match: '/app/deskDetail', titleKey: 'navigation.detail' },
  { match: '/app/desk', titleKey: 'navigation.desktop' },
  { match: '/app/application', titleKey: 'navigation.application' },
  { match: '/app/peripheral', titleKey: 'navigation.peripheral' },
  { match: '/app/approval', titleKey: 'navigation.approval' },
  { match: '/app/malfunction', titleKey: 'navigation.desktopIssues' },
] as const;

export function RedesignAppLayout() {
  const { t: assistantT } = useTranslation('assistant');
  const { t: commonT } = useTranslation('common');
  const location = useLocation();
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);
  const [compactAssistantOpen, setCompactAssistantOpen] = useState(false);
  const [isCompactAssistant, setIsCompactAssistant] = useState(
    () => window.matchMedia('(max-width: 1080px)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1080px)');
    const updateCompactAssistant = () => setIsCompactAssistant(mediaQuery.matches);

    updateCompactAssistant();
    mediaQuery.addEventListener('change', updateCompactAssistant);

    return () => mediaQuery.removeEventListener('change', updateCompactAssistant);
  }, []);

  const routeMeta = useMemo(() => {
    return routeTitles.find((item) => location.pathname.startsWith(item.match)) ?? routeTitles[1];
  }, [location.pathname]);

  const effectiveAssistantCollapsed = isCompactAssistant
    ? !compactAssistantOpen
    : assistantCollapsed;
  const assistantState: AssistantState = effectiveAssistantCollapsed ? 'collapsed' : 'expanded';
  const toggleAssistant = () => {
    if (isCompactAssistant) {
      setCompactAssistantOpen((current) => !current);
      return;
    }

    setAssistantCollapsed((current) => !current);
  };

  return (
    <div className="redesign-app-layout">
      <AppShell
        assistant={
          <AssistantPanel
            collapsed={effectiveAssistantCollapsed}
            onToggle={toggleAssistant}
          />
        }
        assistantState={assistantState}
        nav={<Sidebar />}
        userMenu={null}
      >
        <section className="redesign-app-layout__workspace">
          <header className="redesign-app-layout__header">
            <div>
              <p className="redesign-app-layout__eyebrow">{commonT('appName')}</p>
              <h1 className="redesign-app-layout__title">{commonT(routeMeta.titleKey)}</h1>
            </div>
            <Button
              aria-pressed={!effectiveAssistantCollapsed}
              onClick={toggleAssistant}
              size="sm"
              variant="secondary"
            >
              {effectiveAssistantCollapsed ? assistantT('title') : commonT('actions.close')}
            </Button>
          </header>

          <main className="redesign-app-layout__content">
            <Outlet />
          </main>

          <footer className="redesign-app-layout__footer">
            <GatewaySelect readonly />
          </footer>
        </section>
      </AppShell>
    </div>
  );
}
