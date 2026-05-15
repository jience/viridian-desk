import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntl } from 'react-intl';
import { Outlet, useLocation } from 'react-router';
import Sidebar from '@/components/Sidebar';
import { GatewaySelect } from '@/components/GatewaySelect';
import { AssistantPanel } from '@/ui/assistant/assistant-panel';
import { Button } from '@/ui/components/button';
import { AppShell, type AssistantState } from '@/ui/shell/app-shell';
import '@/styles/redesign.css';
import './index.scss';

const routeTitleIds: Array<{ match: string; titleId: string; fallback: string }> = [
  { match: '/app/deskDetail', titleId: 'DETAIL', fallback: 'Detail' },
  { match: '/app/desk', titleId: 'DESK', fallback: 'Desktop' },
  { match: '/app/application', titleId: 'Application', fallback: 'Application' },
  { match: '/app/peripheral', titleId: 'Peripheral', fallback: 'Peripheral' },
  { match: '/app/approval', titleId: 'APPROVAL', fallback: 'Approval' },
  { match: '/app/malfunction', titleId: 'DesktopIssues', fallback: 'Faults' },
];

export function RedesignAppLayout() {
  const intl = useIntl();
  const { t: assistantT } = useTranslation('assistant');
  const { t: commonT } = useTranslation('common');
  const location = useLocation();
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);

  const routeMeta = useMemo(() => {
    return routeTitleIds.find((item) => location.pathname.startsWith(item.match)) ?? routeTitleIds[1];
  }, [location.pathname]);

  const assistantState: AssistantState = assistantCollapsed ? 'collapsed' : 'expanded';

  return (
    <div className="redesign-app-layout">
      <AppShell
        assistant={
          <AssistantPanel
            collapsed={assistantCollapsed}
            onToggle={() => setAssistantCollapsed((current) => !current)}
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
              <h1 className="redesign-app-layout__title">
                {intl.formatMessage({ id: routeMeta.titleId, defaultMessage: routeMeta.fallback })}
              </h1>
            </div>
            <Button
              aria-pressed={!assistantCollapsed}
              onClick={() => setAssistantCollapsed((current) => !current)}
              size="sm"
              variant="secondary"
            >
              {assistantCollapsed ? assistantT('title') : commonT('actions.close')}
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
