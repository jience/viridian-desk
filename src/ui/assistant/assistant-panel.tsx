import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/components/button';

interface AssistantPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AssistantPanel({ collapsed = false, onToggle }: AssistantPanelProps) {
  const { t } = useTranslation('assistant');

  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center gap-3 p-3">
        <Button aria-label={t('title')} onClick={onToggle} size="sm" variant="secondary">
          ?
        </Button>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-rows-[auto_auto_1fr_auto] gap-4 p-4">
      <div>
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <p className="mt-1 text-xs leading-5 text-vd-muted">{t('subtitle')}</p>
      </div>
      <div className="grid gap-2 text-xs">
        <div className="rounded-xl border border-vd-border bg-vd-panel p-3">
          {t('quick.connectionHelp')}
        </div>
        <div className="rounded-xl border border-vd-border bg-vd-panel p-3">
          {t('quick.openLogs')}
        </div>
        <div className="rounded-xl border border-vd-border bg-vd-panel p-3">
          {t('quick.reportFault')}
        </div>
      </div>
      <div />
      <Button onClick={onToggle} size="sm" variant="secondary">
        {t('actions.close', { ns: 'common' })}
      </Button>
    </div>
  );
}
