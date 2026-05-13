import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/components/button';

interface AssistantPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AssistantPanel({ collapsed = false, onToggle }: AssistantPanelProps) {
  const { t } = useTranslation();
  const translate = t as unknown as (
    key: string,
    options: { ns: 'assistant' | 'common'; defaultValue: string },
  ) => string;
  const assistantText = (key: string, defaultValue: string) =>
    translate(key, { ns: 'assistant', defaultValue });
  const commonText = (key: string, defaultValue: string) =>
    translate(key, { ns: 'common', defaultValue });

  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center gap-3 p-3">
        <Button
          aria-label={assistantText('title', 'Assistant')}
          onClick={onToggle}
          size="sm"
          variant="secondary"
        >
          ?
        </Button>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-rows-[auto_auto_1fr_auto] gap-4 p-4">
      <div>
        <h2 className="text-lg font-semibold">{assistantText('title', 'Assistant')}</h2>
        <p className="mt-1 text-xs leading-5 text-vd-muted">
          {assistantText('subtitle', 'Status explanations, quick diagnostics, and local guidance.')}
        </p>
      </div>
      <div className="grid gap-2 text-xs">
        <div className="rounded-xl border border-vd-border bg-vd-panel p-3">
          {assistantText('quick.connectionHelp', 'Connection troubleshooting')}
        </div>
        <div className="rounded-xl border border-vd-border bg-vd-panel p-3">
          {assistantText('quick.openLogs', 'Open diagnostic logs')}
        </div>
        <div className="rounded-xl border border-vd-border bg-vd-panel p-3">
          {assistantText('quick.reportFault', 'Submit a fault report')}
        </div>
      </div>
      <div />
      <Button onClick={onToggle} size="sm" variant="secondary">
        {commonText('actions.close', 'Close')}
      </Button>
    </div>
  );
}
