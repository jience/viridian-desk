import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface DocumentTitleProps {
  title?: string;
}

export function DocumentTitle({ title }: DocumentTitleProps) {
  const { t } = useTranslation('common');
  const appName = t('appName');

  useEffect(() => {
    document.title = title ? `${title} - ${appName}` : appName;

    return () => {
      document.title = appName;
    };
  }, [appName, title]);

  return null;
}
