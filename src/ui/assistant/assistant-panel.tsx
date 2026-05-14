import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/components/button';

interface AssistantPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AssistantPanel({ collapsed = false, onToggle }: AssistantPanelProps) {
  const { t } = useTranslation('assistant');
  const { t: commonT } = useTranslation('common');

  if (collapsed) {
    return (
      <div className="vd-assistant-panel vd-assistant-panel--collapsed">
        <Button aria-label={t('title')} onClick={onToggle} size="sm" variant="secondary">
          ?
        </Button>
      </div>
    );
  }

  return (
    <div className="vd-assistant-panel">
      <div>
        <h2 className="vd-assistant-panel__title">{t('title')}</h2>
        <p className="vd-assistant-panel__subtitle">{t('subtitle')}</p>
      </div>
      <div className="vd-assistant-panel__quick-list">
        <div className="vd-assistant-panel__quick-item">{t('quick.connectionHelp')}</div>
        <div className="vd-assistant-panel__quick-item">{t('quick.openLogs')}</div>
        <div className="vd-assistant-panel__quick-item">{t('quick.reportFault')}</div>
      </div>
      <div className="vd-assistant-panel__spacer" />
      <Button onClick={onToggle} size="sm" variant="secondary">
        {commonT('actions.close')}
      </Button>
    </div>
  );
}
