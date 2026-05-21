import { useAppSelector } from '@/store';
import { selectConnected, selectNetwork } from '@/store/feature/gateway';
import { Button } from '@/ui/components/button';
import { Form } from '@/ui';
import { useMessageFormatter } from '@/utils/message-format';
import { memo, useCallback, useEffect } from 'react';
import { useLoginHandler } from './hooks/useLoginHandler';
import type { LoginFormType } from './types';
import { UsernamePwd } from './UsernamePwd';

const LoginAuthPanelComponent = () => {
  const { formatMessage } = useMessageFormatter();
  const [form] = Form.useForm<LoginFormType>();

  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);

  const { userLogin, loginLoading, submitLockRef } = useLoginHandler();
  const localLoginLabel = formatMessage({
    id: 'LocalAuthLogin',
    defaultMessage: '本地账号',
  });
  const panelTitle = formatMessage({
    id: 'LoginPanelTitle',
    defaultMessage: '欢迎回来',
  });
  const panelSubtitle = formatMessage({
    id: 'LoginPanelSubtitle',
    defaultMessage: '安全访问你的工作空间',
  });

  const canSubmit = connected && network;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || loginLoading || submitLockRef.current) return;

    submitLockRef.current = true;
    try {
      const values = await form.validateFields();
      await userLogin(values);
    } finally {
      submitLockRef.current = false;
    }
  }, [canSubmit, form, loginLoading, submitLockRef, userLogin]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;

      const target = event.target instanceof HTMLElement ? event.target : null;
      const isDialogInput = target?.closest('.vdui-modal-root, .vdui-drawer, [role="dialog"]');

      if (event.defaultPrevented || event.isComposing || isDialogInput) return;

      event.preventDefault();
      handleSubmit();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <section className="auth-page__auth-zone" aria-label={formatMessage({ id: 'LOGIN' })}>
      <div className="auth-page__card">
        <div className="auth-page__card-heading">
          <div>
            <h2>{panelTitle}</h2>
            <p>{panelSubtitle}</p>
          </div>
        </div>

        <div className="vd-auth-stack">
          <Form form={form} layout="vertical" className="vd-auth-form" requiredMark={false}>
            <UsernamePwd formIns={form} />
          </Form>

          <Button
            aria-busy={loginLoading}
            className="auth-page__submit"
            disabled={!canSubmit || loginLoading}
            onClick={handleSubmit}
            size="lg"
          >
            {loginLoading && <span className="auth-page__submit-spinner" />}
            {formatMessage({ id: loginLoading ? 'LOGING' : 'LOGIN' })}
          </Button>

          <div className="auth-page__mode-divider" aria-label={localLoginLabel}>
            <span>{localLoginLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export const LoginAuthPanel = memo(LoginAuthPanelComponent);
