import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/styles/redesign.css';
import { AssistantPanel } from '@/ui/assistant/assistant-panel';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Switch } from '@/ui/components/switch';
import { AppShell } from '@/ui/shell/app-shell';
import { LoginShell } from '@/ui/shell/login-shell';
import { PreLoginSettingsShell } from '@/ui/shell/pre-login-settings-shell';
import { redesignNamespaces } from '@/ui/i18n/namespaces';
import { useUiTheme } from '@/ui/theme/use-ui-theme';
import { UserMenu } from '@/ui/user/user-menu';
import './index.scss';

export default function RedesignPreview() {
  const { t } = useTranslation(redesignNamespaces);
  const { t: assistantT } = useTranslation('assistant');
  const { mode, resolvedTheme, setMode } = useUiTheme();
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const isDark = resolvedTheme === 'dark';
  const assistantState = assistantCollapsed ? 'collapsed' : 'expanded';

  return (
    <div className="redesign-preview">
      <section className="redesign-preview__pane redesign-preview__pane--login">
        <LoginShell
          header={
            <div className="redesign-preview__stack">
              <span className="redesign-preview__kicker">{t('status.online')}</span>
              <h1>{t('appName')}</h1>
            </div>
          }
          footer={
            <div className="redesign-preview__footer">
              <span>{t('status.offline')}</span>
              <Button size="sm" variant="ghost">
                {t('actions.cancel')}
              </Button>
            </div>
          }
        >
          <div className="redesign-preview__card">
            <Input aria-label={t('actions.search')} placeholder={t('actions.search')} />
            <div className="redesign-preview__actions">
              <Button>{t('actions.confirm')}</Button>
              <Button variant="secondary">{t('actions.open')}</Button>
            </div>
          </div>
        </LoginShell>
      </section>

      <section className="redesign-preview__pane redesign-preview__pane--settings">
        <PreLoginSettingsShell
          sidebar={
            <nav className="redesign-preview__nav" aria-label={t('theme.system')}>
              <Button variant={mode === 'light' ? 'primary' : 'ghost'} onClick={() => setMode('light')}>
                {t('theme.light')}
              </Button>
              <Button variant={mode === 'dark' ? 'primary' : 'ghost'} onClick={() => setMode('dark')}>
                {t('theme.dark')}
              </Button>
              <Button
                variant={mode === 'system' ? 'primary' : 'ghost'}
                onClick={() => setMode('system')}
              >
                {t('theme.system')}
              </Button>
            </nav>
          }
        >
          <div className="redesign-preview__settings">
            <div>
              <h2>{t('appName')}</h2>
              <p>{assistantT('subtitle')}</p>
            </div>
            <label className="redesign-preview__switch-row">
              <span>{isDark ? t('theme.dark') : t('theme.light')}</span>
              <Switch
                aria-label={isDark ? t('theme.dark') : t('theme.light')}
                checked={isDark}
                onCheckedChange={(checked) => setMode(checked ? 'dark' : 'light')}
              />
            </label>
            <label className="redesign-preview__switch-row">
              <span>{enabled ? t('status.online') : t('status.offline')}</span>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </label>
            <Button variant="secondary">{t('actions.save')}</Button>
          </div>
        </PreLoginSettingsShell>
      </section>

      <section className="redesign-preview__pane redesign-preview__pane--app">
        <AppShell
          assistantState={assistantState}
          nav={
            <nav className="redesign-preview__rail" aria-label={t('appName')}>
              <Button aria-label={t('appName')} size="sm">
                V
              </Button>
              <Button aria-label={assistantT('title')} size="sm" variant="secondary">
                A
              </Button>
            </nav>
          }
          userMenu={<UserMenu email="preview@viridian.local" initials="VD" name={t('appName')} />}
          assistant={
            <AssistantPanel
              collapsed={assistantCollapsed}
              onToggle={() => setAssistantCollapsed((current) => !current)}
            />
          }
        >
          <div className="redesign-preview__workspace">
            <div className="redesign-preview__workspace-header">
              <div>
                <h2>{t('appName')}</h2>
                <p>{assistantT('subtitle')}</p>
              </div>
              <label className="redesign-preview__assistant-toggle">
                <span>{assistantT('title')}</span>
                <Switch
                  aria-label={assistantT('title')}
                  checked={!assistantCollapsed}
                  onCheckedChange={(checked) => setAssistantCollapsed(!checked)}
                />
              </label>
            </div>
            <div className="redesign-preview__grid">
              <div>{assistantT('quick.connectionHelp')}</div>
              <div>{assistantT('quick.openLogs')}</div>
              <div>{assistantT('quick.reportFault')}</div>
            </div>
          </div>
        </AppShell>
      </section>
    </div>
  );
}
