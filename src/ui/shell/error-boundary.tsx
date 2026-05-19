import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { logger } from '@/utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: unknown;
  hasError: boolean;
}

function getErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error || 'Unknown error');
}

function ErrorFallback({ error }: { error: unknown }) {
  const { t } = useTranslation('common');
  const message = getErrorMessage(error);

  return (
    <main className="vd-error-boundary" role="alert">
      <section className="vd-error-boundary__panel">
        <p className="vd-error-boundary__eyebrow">{t('errorBoundary.eyebrow')}</p>
        <h1>{t('errorBoundary.title')}</h1>
        <p>{t('errorBoundary.description')}</p>
        {import.meta.env.DEV && <pre>{message}</pre>}
        <div className="vd-error-boundary__actions">
          <button type="button" onClick={() => window.location.reload()}>
            {t('errorBoundary.reload')}
          </button>
          <button type="button" onClick={() => window.location.assign('/login')}>
            {t('emptyPage.backToLogin')}
          </button>
        </div>
      </section>
    </main>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
    hasError: false,
  };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      error,
      hasError: true,
    };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    logger.error('React render error boundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

export function RouteErrorBoundary() {
  const error = useRouteError();

  logger.error('React Router error boundary caught an error', error);

  return <ErrorFallback error={error} />;
}
