import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface MessageDescriptor {
  id: string;
  defaultMessage?: string;
}

export interface MessageFormatterShape {
  formatMessage(
    descriptor: MessageDescriptor,
    values?: Record<string, unknown>,
  ): string;
}

export function useMessageFormatter(): MessageFormatterShape {
  const { t } = useTranslation();
  const formatMessage = useCallback<MessageFormatterShape['formatMessage']>(
    ({ id, defaultMessage }, values) =>
      t(id, {
        defaultValue: defaultMessage ?? id,
        ...(values ?? {}),
      }),
    [t],
  );

  return useMemo(() => ({ formatMessage }), [formatMessage]);
}
