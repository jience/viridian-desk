import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/components/button';

interface AssistantPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const workflowItems = [
  { key: 'quick.connectionHelp', icon: 'icon-net' },
  { key: 'quick.openLogs', icon: 'icon-log' },
  { key: 'quick.reportFault', icon: 'icon-fault' },
] as const;

export function AssistantPanel({ collapsed = false, onToggle }: AssistantPanelProps) {
  const { t } = useTranslation('assistant');
  const { t: commonT } = useTranslation('common');

  if (collapsed) {
    return (
      <div className="vd-assistant-panel vd-assistant-panel--collapsed">
        <Button aria-label={t('title')} onClick={onToggle} size="sm" variant="secondary">
          <i className="iconfont icon-c_question-s" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <div className="vd-assistant-panel">
      <div className="vd-assistant-panel__header">
        <span className="vd-assistant-panel__label">{t('title')}</span>
        <h2 className="vd-assistant-panel__title">{t('title')}</h2>
        <p className="vd-assistant-panel__subtitle">{t('subtitle')}</p>
      </div>

      <ul className="vd-assistant-panel__quick-list">
        {workflowItems.map((item) => (
          <li className="vd-assistant-panel__quick-item" key={item.key}>
            <i className={`iconfont ${item.icon}`} aria-hidden="true" />
            <span>{t(item.key)}</span>
          </li>
        ))}
      </ul>

      <div className="vd-assistant-panel__note">
        <span className="vd-assistant-panel__status-dot" />
        <span>{commonT('status.online')}</span>
      </div>

      <div className="vd-assistant-panel__spacer" />
      <Button onClick={onToggle} size="sm" variant="secondary">
        {commonT('actions.close')}
      </Button>
    </div>
  );
}
