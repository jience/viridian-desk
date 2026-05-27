import './index.scss';

import { LoginUserType, type LoginUserInfo } from '@/native/interfaces/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { logoutCurrentUser } from '@/store/feature/app';
import { selectConnected, selectNetwork } from '@/store/feature/gateway';
import { Button, Form, Input, Tooltip, message } from '@/shared/ui';
import { cn } from '@/shared/ui/lib/cn';
import { useMessageFormatter } from '@/utils/message-format';
import { LEGACY_PASSWORD_PREFIX } from '@/utils/passwordPrefix';
import Regex from '@/utils/regex';
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  KeyRound,
  LogOut,
  Mail,
  Monitor,
  Phone,
  ShieldCheck,
  Smartphone,
  UserRound,
} from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

type AccountWorkbenchView = 'overview' | 'password' | 'phone';

type PasswordFields = {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

type PhoneFields = {
  phone?: string;
  verifyCode?: string;
};

interface AccountWorkbenchProps {
  currentUser?: LoginUserInfo | null;
  forcePasswordChange?: boolean;
  onForcedClose?: () => void | Promise<void>;
  onLogout?: () => void | Promise<void>;
}

const emptyValue = '--';

const displayValue = (value?: string) => (value ? value : emptyValue);
const formatPhone = (phone?: string) =>
  phone && phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '';

const encodePassword = async (value: string) => {
  const { Buffer } = await import('buffer');
  const timestamp = Date.now();
  return Buffer.from(`${LEGACY_PASSWORD_PREFIX}${value}_${timestamp}`).toString('base64');
};

function AccountFact({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="account-workbench__fact">
      <span className="account-workbench__fact-icon">{icon}</span>
      <span className="account-workbench__fact-label">{label}</span>
      <strong className="account-workbench__fact-value">{value}</strong>
    </div>
  );
}

function AccountAction({
  icon,
  title,
  description,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="account-workbench__action"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      <span className="account-workbench__action-icon">{icon}</span>
      <span className="account-workbench__action-copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <ChevronRight aria-hidden="true" />
    </button>
  );
}

export function AccountWorkbench({
  currentUser,
  forcePasswordChange = false,
  onForcedClose,
  onLogout,
}: AccountWorkbenchProps) {
  const intl = useMessageFormatter();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<AccountWorkbenchView>('overview');
  const [passwordForm] = Form.useForm<PasswordFields>();
  const [phoneForm] = Form.useForm<PhoneFields>();
  const phoneValue = Form.useWatch('phone', phoneForm);
  const [strongPasswordSwitch, setStrongPasswordSwitch] = useState<string>();
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [phoneSubmitting, setPhoneSubmitting] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [number, setNumber] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const canModifyLocal = currentUser?.type === LoginUserType.LOCAL;
  const displayName = currentUser?.userName || currentUser?.loginName || emptyValue;
  const accountName = currentUser?.loginName || currentUser?.userName || emptyValue;
  const terminalName = currentUser?.deviceName || currentUser?.deviceIp || currentUser?.deviceId;
  const canSendCode = Regex.isMobile.test(phoneValue || '') && connected && network && !sent;

  const logout = useCallback(async () => {
    if (onLogout) {
      await onLogout();
      return;
    }

    await dispatch(logoutCurrentUser(false));
    navigate('/login');
  }, [dispatch, navigate, onLogout]);

  const requestClose = useCallback(() => {
    if (forcePasswordChange) {
      void onForcedClose?.();
      return;
    }

    setOpen(false);
    setView('overview');
  }, [forcePasswordChange, onForcedClose]);

  const toggleOpen = useCallback(() => {
    if (open) {
      requestClose();
      return;
    }

    setOpen(true);
    setView(forcePasswordChange ? 'password' : 'overview');
  }, [forcePasswordChange, open, requestClose]);

  const passwordRules = useMemo(() => {
    const passwordPattern =
      strongPasswordSwitch === 'Disabled' ? Regex.isNotStrongPassword : Regex.isStrongPassword;
    const passwordMessage =
      strongPasswordSwitch === 'Disabled'
        ? t('account.workbench.password_rule')
        : t('account.workbench.strong_password_rule');

    return {
      oldPassword: [
        {
          required: true,
          message: intl.formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: intl.formatMessage({ id: 'OLD_PASSWORD' }) },
          ),
        },
      ],
      newPassword: [
        {
          required: true,
          message: intl.formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: intl.formatMessage({ id: 'NEW_PASSWORD' }) },
          ),
        },
        {
          pattern: passwordPattern,
          message: passwordMessage,
        },
        ({ getFieldValue }: any) => ({
          validator(_rule: unknown, value: string) {
            if (!value || getFieldValue('oldPassword') !== value) return Promise.resolve();
            return Promise.reject(intl.formatMessage({ id: 'OLD_NEW_PASSWORD_NOTMATCH' }));
          },
        }),
      ],
      confirmPassword: [
        {
          required: true,
          message: intl.formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: intl.formatMessage({ id: 'CONFIRM_PASSWORD' }) },
          ),
        },
        {
          pattern: passwordPattern,
          message: passwordMessage,
        },
        ({ getFieldValue }: any) => ({
          validator(_rule: unknown, value: string) {
            if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
            return Promise.reject(intl.formatMessage({ id: 'TWICE_PASSWORD_NOTMATCH' }));
          },
        }),
      ],
    };
  }, [intl, strongPasswordSwitch, t]);

  const phoneRules = useMemo(
    () => ({
      phone: [
        {
          required: true,
          message: intl.formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: intl.formatMessage({ id: 'UserPhone' }) },
          ),
        },
        {
          pattern: Regex.isMobile,
          message: intl.formatMessage({ id: 'ValidPhoneError' }),
        },
      ],
      verifyCode: [
        {
          required: true,
          message: intl.formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: intl.formatMessage({ id: 'VERIFY_CODE' }) },
          ),
        },
      ],
    }),
    [intl],
  );

  const submitPassword = useCallback(async () => {
    const values = (await passwordForm.validateFields()) as PasswordFields;
    setPasswordSubmitting(true);

    try {
      const { changePasswordUser } = await import('@/services/user');
      await changePasswordUser({
        oldPassword: await encodePassword(values.oldPassword || ''),
        newPassword: await encodePassword(values.newPassword || ''),
        confirmPassword: await encodePassword(values.confirmPassword || ''),
      });
      message.success({
        content: intl.formatMessage({ id: 'SUCCESS_CHANGE_PASSWORD' }),
      });
      await logout();
    } finally {
      setPasswordSubmitting(false);
    }
  }, [intl, logout, passwordForm]);

  const sendPhoneCode = useCallback(async () => {
    if (!canSendCode) return;

    setCodeSending(true);
    try {
      const { getPhoneCode } = await import('@/services/public');
      await getPhoneCode({ phone: phoneValue });
      setNumber(60);
      setSent(true);
    } finally {
      setCodeSending(false);
    }
  }, [canSendCode, phoneValue]);

  const submitPhone = useCallback(async () => {
    const values = (await phoneForm.validateFields()) as PhoneFields;
    setPhoneSubmitting(true);

    try {
      const { updateUserPhone } = await import('@/services/user');
      await updateUserPhone({
        phone: values.phone,
        smsCaptcha: values.verifyCode,
      });
      message.success(
        `${intl.formatMessage({ id: 'ChangePhone' })}${intl.formatMessage({ id: 'SUCCESS' })}`,
      );
      phoneForm.resetFields();
      setView('overview');
    } finally {
      setPhoneSubmitting(false);
    }
  }, [intl, phoneForm]);

  useEffect(() => {
    if (!forcePasswordChange) return;
    setOpen(true);
    setView('password');
  }, [forcePasswordChange]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      requestClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, requestClose]);

  useEffect(() => {
    if (!open || view !== 'password') return;

    let disposed = false;
    const loadPasswordPolicy = async () => {
      try {
        const { getTerminalLoginConfig } = await import('@/services/public');
        const response = await getTerminalLoginConfig();
        if (!disposed) {
          setStrongPasswordSwitch((response as any)?.terminalStrongPasswordSwitch);
        }
      } catch {
        if (!disposed) setStrongPasswordSwitch(undefined);
      }
    };

    void loadPasswordPolicy();

    return () => {
      disposed = true;
    };
  }, [open, view]);

  useEffect(() => {
    if (view !== 'phone' || !currentUser?.telephone) return;
    phoneForm.setFieldsValue({ phone: currentUser.telephone });
  }, [currentUser?.telephone, phoneForm, view]);

  useEffect(() => {
    if (!sent || number <= 0) return;

    const timer = window.setInterval(() => {
      setNumber((current) => {
        if (current <= 1) {
          setSent(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [number, sent]);

  return (
    <div className="account-workbench" ref={rootRef}>
      <Tooltip title={t('account.workbench.title')} placement="right">
        <button
          aria-expanded={open}
          aria-label={t('account.workbench.title')}
          className={cn('sidebar__button', open && 'sidebar__button--active')}
          type="button"
          onClick={toggleOpen}
        >
          <i className="iconfont icon-user" />
        </button>
      </Tooltip>

      {open && (
        <section
          aria-label={t('account.workbench.title')}
          className="account-workbench__panel"
          role="dialog"
        >
          {view === 'overview' && (
            <div className="account-workbench__view">
              <div className="account-workbench__header">
                <div className="account-workbench__avatar" aria-hidden="true">
                  <UserRound />
                </div>
                <div className="account-workbench__identity">
                  <h2>{displayName}</h2>
                  <p>{accountName}</p>
                </div>
                <span className="account-workbench__status">
                  <BadgeCheck aria-hidden="true" />
                  {t('account.workbench.online')}
                </span>
              </div>

              <div className="account-workbench__facts">
                <AccountFact
                  icon={<ShieldCheck />}
                  label={t('account.workbench.login_method')}
                  value={canModifyLocal ? t('account.workbench.local_user') : emptyValue}
                />
                <AccountFact
                  icon={<Phone />}
                  label={t('account.workbench.phone')}
                  value={formatPhone(currentUser?.telephone) || t('account.workbench.not_bound')}
                />
                <AccountFact
                  icon={<Mail />}
                  label={t('account.workbench.email')}
                  value={displayValue(currentUser?.email)}
                />
                <AccountFact
                  icon={<Monitor />}
                  label={t('account.workbench.terminal')}
                  value={displayValue(terminalName)}
                />
              </div>

              <div className="account-workbench__actions">
                <AccountAction
                  disabled={!canModifyLocal}
                  icon={<KeyRound />}
                  title={t('account.workbench.change_password')}
                  description={t('account.workbench.change_password_desc')}
                  onClick={() => setView('password')}
                />
                <AccountAction
                  disabled={!canModifyLocal}
                  icon={<Smartphone />}
                  title={t('account.workbench.change_phone')}
                  description={t('account.workbench.change_phone_desc')}
                  onClick={() => setView('phone')}
                />
              </div>

              <button className="account-workbench__danger" type="button" onClick={logout}>
                <LogOut aria-hidden="true" />
                {t('account.workbench.logout')}
              </button>
            </div>
          )}

          {view === 'password' && (
            <div className="account-workbench__view">
              {!forcePasswordChange && (
                <button
                  className="account-workbench__back"
                  type="button"
                  onClick={() => setView('overview')}
                >
                  <ArrowLeft aria-hidden="true" />
                  {t('account.workbench.back')}
                </button>
              )}
              <div className="account-workbench__section-title">
                <h2>{t('account.workbench.security_title')}</h2>
                <p>
                  {forcePasswordChange
                    ? t('account.workbench.force_password_hint')
                    : t('account.workbench.password_hint')}
                </p>
              </div>
              <Form
                className="account-workbench__form"
                form={passwordForm}
                layout="vertical"
                requiredMark={false}
              >
                <Form.Item
                  liveValue={false}
                  name="oldPassword"
                  label={intl.formatMessage({ id: 'OLD_PASSWORD' })}
                  rules={passwordRules.oldPassword}
                >
                  <Input.Password
                    autoComplete="current-password"
                    placeholder={intl.formatMessage(
                      { id: 'FORM_ERROR_MSG' },
                      { name: intl.formatMessage({ id: 'OLD_PASSWORD' }) },
                    )}
                  />
                </Form.Item>
                <Form.Item
                  liveValue={false}
                  name="newPassword"
                  label={intl.formatMessage({ id: 'NEW_PASSWORD' })}
                  rules={passwordRules.newPassword}
                >
                  <Input.Password
                    autoComplete="new-password"
                    placeholder={intl.formatMessage(
                      { id: 'FORM_ERROR_MSG' },
                      { name: intl.formatMessage({ id: 'NEW_PASSWORD' }) },
                    )}
                  />
                </Form.Item>
                <Form.Item
                  liveValue={false}
                  name="confirmPassword"
                  label={intl.formatMessage({ id: 'CONFIRM_PASSWORD' })}
                  rules={passwordRules.confirmPassword}
                >
                  <Input.Password
                    autoComplete="new-password"
                    placeholder={intl.formatMessage(
                      { id: 'FORM_ERROR_MSG' },
                      { name: intl.formatMessage({ id: 'CONFIRM_PASSWORD' }) },
                    )}
                  />
                </Form.Item>
              </Form>
              <div className="account-workbench__footer vdui-modal-footer">
                {!forcePasswordChange && (
                  <Button type="default" onClick={() => setView('overview')}>
                    {intl.formatMessage({ id: 'CANCEL' })}
                  </Button>
                )}
                <Button type="primary" loading={passwordSubmitting} onClick={submitPassword}>
                  {t('account.workbench.save_password')}
                </Button>
              </div>
            </div>
          )}

          {view === 'phone' && (
            <div className="account-workbench__view">
              <button
                className="account-workbench__back"
                type="button"
                onClick={() => setView('overview')}
              >
                <ArrowLeft aria-hidden="true" />
                {t('account.workbench.back')}
              </button>
              <div className="account-workbench__section-title">
                <h2>{t('account.workbench.phone_title')}</h2>
                <p>{t('account.workbench.sms_hint')}</p>
              </div>
              <Form
                className="account-workbench__form"
                form={phoneForm}
                layout="vertical"
                requiredMark={false}
              >
                <Form.Item
                  name="phone"
                  label={intl.formatMessage({ id: 'UserPhone' })}
                  rules={phoneRules.phone}
                >
                  <Input placeholder={intl.formatMessage({ id: 'ChangePhonePlaceHolder' })} />
                </Form.Item>
                <p className="account-workbench__hint">
                  {intl.formatMessage({ id: 'SendPhoneLable' }, {
                    phone: formatPhone(phoneValue) || emptyValue,
                  })}
                </p>
                <div className="account-workbench__code-row">
                  <Form.Item
                    liveValue={false}
                    name="verifyCode"
                    className="account-workbench__code-item"
                    rules={phoneRules.verifyCode}
                  >
                    <Input
                      inputMode="numeric"
                      placeholder={intl.formatMessage(
                        { id: 'FORM_ERROR_MSG' },
                        { name: intl.formatMessage({ id: 'VERIFY_CODE' }) },
                      )}
                    />
                  </Form.Item>
                  <Button
                    className="account-workbench__code-button"
                    disabled={!canSendCode}
                    loading={codeSending}
                    type="default"
                    onClick={sendPhoneCode}
                  >
                    {sent
                      ? `${number}s ${intl.formatMessage({ id: 'RetryGetCode' })}`
                      : intl.formatMessage({ id: 'GetVerificationCode' })}
                  </Button>
                </div>
              </Form>
              <div className="account-workbench__footer vdui-modal-footer">
                <Button type="default" onClick={() => setView('overview')}>
                  {intl.formatMessage({ id: 'CANCEL' })}
                </Button>
                <Button type="primary" loading={phoneSubmitting} onClick={submitPhone}>
                  {t('account.workbench.save_phone')}
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
