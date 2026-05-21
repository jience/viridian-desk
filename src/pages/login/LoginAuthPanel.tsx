import { useAppSelector } from '@/store';
import { selectConnected, selectNetwork } from '@/store/feature/gateway';
import { useMessageFormatter } from '@/utils/message-format';
import { memo, type FormEvent, useCallback, useRef, useState } from 'react';
import { useLoginHandler } from './hooks/useLoginHandler';
import type { LoginFormType } from './types';

type LoginFieldErrors = Partial<Record<keyof LoginFormType, string>>;

const readLoginForm = (formData: FormData): LoginFormType => ({
  loginName: String(formData.get('loginName') ?? '').trim(),
  password: String(formData.get('password') ?? ''),
});

const LoginAuthPanelComponent = () => {
  const { formatMessage } = useMessageFormatter();
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [passwordVisible, setPasswordVisible] = useState(false);

  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);

  const { userLogin, loginLoading, submitLockRef } = useLoginHandler();
  const localLoginLabel = formatMessage({
    id: 'LocalAuthLogin',
    defaultMessage: '本地用户登录',
  });
  const panelTitle = formatMessage({
    id: 'LoginPanelTitle',
    defaultMessage: '欢迎回来',
  });
  const panelSubtitle = formatMessage({
    id: 'LoginPanelSubtitle',
    defaultMessage: '安全访问你的工作空间',
  });
  const usernameLabel = formatMessage({ id: 'login_page.username_label' });
  const usernamePlaceholder = formatMessage({ id: 'login_page.username_placeholder' });
  const usernameMinLengthTip = formatMessage({ id: 'login_page.username_min_length_tip' });
  const passwordLabel = formatMessage({ id: 'login_page.password_label' });
  const passwordPlaceholder = formatMessage({ id: 'login_page.password_placeholder' });

  const canSubmit = connected && network;

  const validateLoginForm = useCallback(
    (values: LoginFormType) => {
      const errors: LoginFieldErrors = {};
      if (!values.loginName) {
        errors.loginName = usernamePlaceholder;
      } else if (values.loginName.length < 2) {
        errors.loginName = usernameMinLengthTip;
      }
      if (!values.password) {
        errors.password = passwordPlaceholder;
      }
      return errors;
    },
    [passwordPlaceholder, usernameMinLengthTip, usernamePlaceholder],
  );

  const focusInvalidField = (name: keyof LoginFormType) => {
    const field = formRef.current?.elements.namedItem(name);
    if (field instanceof HTMLElement) field.focus();
  };

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit || loginLoading || submitLockRef.current || !formRef.current) return;

      const values = readLoginForm(new FormData(formRef.current));
      const errors = validateLoginForm(values);
      setFieldErrors(errors);
      const firstErrorName = Object.keys(errors)[0] as keyof LoginFormType | undefined;
      if (firstErrorName) {
        focusInvalidField(firstErrorName);
        return;
      }

      submitLockRef.current = true;
      try {
        await userLogin(values);
      } finally {
        submitLockRef.current = false;
      }
    },
    [canSubmit, loginLoading, submitLockRef, userLogin, validateLoginForm],
  );

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
          <form ref={formRef} className="vd-auth-form" noValidate onSubmit={handleSubmit}>
            <label className="auth-page__field">
              <span className="auth-page__label">{usernameLabel}</span>
              <span className="auth-page__input-shell">
                <i className="iconfont icon-user form-prefix-icon" aria-hidden="true" />
                <input
                  autoComplete="username"
                  className="auth-page__input"
                  maxLength={60}
                  name="loginName"
                  placeholder={usernamePlaceholder}
                  aria-invalid={fieldErrors.loginName ? 'true' : undefined}
                  aria-describedby={fieldErrors.loginName ? 'login-name-error' : undefined}
                />
              </span>
              {fieldErrors.loginName && (
                <span className="auth-page__field-error" id="login-name-error" role="alert">
                  {fieldErrors.loginName}
                </span>
              )}
            </label>

            <label className="auth-page__field">
              <span className="auth-page__label">{passwordLabel}</span>
              <span className="auth-page__input-shell">
                <i className="iconfont icon-lock form-prefix-icon" aria-hidden="true" />
                <input
                  autoComplete="current-password"
                  className="auth-page__input"
                  name="password"
                  placeholder={passwordPlaceholder}
                  type={passwordVisible ? 'text' : 'password'}
                  aria-invalid={fieldErrors.password ? 'true' : undefined}
                  aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                />
                <button
                  className="auth-page__password-toggle"
                  type="button"
                  tabIndex={-1}
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  aria-label={passwordLabel}
                >
                  <i
                    className={`iconfont ${passwordVisible ? 'icon-visible' : 'icon-invisible'}`}
                    aria-hidden="true"
                  />
                </button>
              </span>
              {fieldErrors.password && (
                <span className="auth-page__field-error" id="login-password-error" role="alert">
                  {fieldErrors.password}
                </span>
              )}
            </label>

            <button
              aria-busy={loginLoading}
              className="auth-page__submit"
              disabled={!canSubmit || loginLoading}
              type="submit"
            >
              {loginLoading && <span className="auth-page__submit-spinner" />}
              {formatMessage({ id: loginLoading ? 'LOGING' : 'LOGIN' })}
            </button>
          </form>

          <div className="auth-page__mode-divider" aria-label={localLoginLabel}>
            <span>{localLoginLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export const LoginAuthPanel = memo(LoginAuthPanelComponent);
