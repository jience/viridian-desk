import './index.scss';

import { LoginUserType, type LoginUserInfo } from '@/native/interfaces/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { logoutCurrentUser } from '@/store/feature/app';
import { selectConnected, selectNetwork } from '@/store/feature/gateway';
import { Form, Tooltip, message } from '@/shared/ui';
import { cn } from '@/shared/ui/lib/cn';
import { useMessageFormatter } from '@/utils/message-format';
import { LEGACY_PASSWORD_PREFIX } from '@/utils/passwordPrefix';
import Regex from '@/utils/regex';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { AccountOverviewView, PasswordView, PhoneView } from './account-workbench-views';
import type { AccountWorkbenchView, PasswordFields, PhoneFields } from './types';

interface AccountWorkbenchProps {
  currentUser?: LoginUserInfo | null;
  forcePasswordChange?: boolean;
  onForcedClose?: () => void | Promise<void>;
  onLogout?: () => void | Promise<void>;
}

const emptyValue = '--';

const encodePassword = async (value: string) => {
  const { Buffer } = await import('buffer');
  const timestamp = Date.now();
  return Buffer.from(`${LEGACY_PASSWORD_PREFIX}${value}_${timestamp}`).toString('base64');
};

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
      const { changePasswordUser } = await import('@/services/api/account');
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
      const { getPhoneCode } = await import('@/services/api/account');
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
      const { updateUserPhone } = await import('@/services/api/account');
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
        const { getTerminalLoginConfig } = await import('@/services/api/session');
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
            <AccountOverviewView
              t={t}
              currentUser={currentUser}
              displayName={displayName}
              accountName={accountName}
              terminalName={terminalName}
              canModifyLocal={canModifyLocal}
              onPassword={() => setView('password')}
              onPhone={() => setView('phone')}
              onLogout={logout}
            />
          )}

          {view === 'password' && (
            <PasswordView
              t={t}
              intl={intl}
              forcePasswordChange={forcePasswordChange}
              form={passwordForm}
              rules={passwordRules}
              submitting={passwordSubmitting}
              onBack={() => setView('overview')}
              onSubmit={submitPassword}
            />
          )}

          {view === 'phone' && (
            <PhoneView
              t={t}
              intl={intl}
              form={phoneForm}
              rules={phoneRules}
              phoneValue={phoneValue}
              canSendCode={canSendCode}
              codeSending={codeSending}
              phoneSubmitting={phoneSubmitting}
              sent={sent}
              countdown={number}
              onBack={() => setView('overview')}
              onSendCode={sendPhoneCode}
              onSubmit={submitPhone}
            />
          )}
        </section>
      )}
    </div>
  );
}
