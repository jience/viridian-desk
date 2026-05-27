import { Button, Form, Input, type FormInstance } from '@/shared/ui';
import type { LoginUserInfo } from '@/native/interfaces/api';
import type { MessageFormatterShape } from '@/utils/message-format';
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
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import type { PasswordFields, PhoneFields } from './types';

type Translate = TFunction;
type FieldRules<T> = Record<keyof T, any[]>;

const emptyValue = '--';
const displayValue = (value?: string) => (value ? value : emptyValue);
const formatPhone = (phone?: string) =>
  phone && phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '';

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

interface AccountOverviewViewProps {
  t: Translate;
  currentUser?: LoginUserInfo | null;
  displayName: string;
  accountName: string;
  terminalName?: string;
  canModifyLocal: boolean;
  onPassword: () => void;
  onPhone: () => void;
  onLogout: () => void;
}

export function AccountOverviewView({
  t,
  currentUser,
  displayName,
  accountName,
  terminalName,
  canModifyLocal,
  onPassword,
  onPhone,
  onLogout,
}: AccountOverviewViewProps) {
  return (
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
          onClick={onPassword}
        />
        <AccountAction
          disabled={!canModifyLocal}
          icon={<Smartphone />}
          title={t('account.workbench.change_phone')}
          description={t('account.workbench.change_phone_desc')}
          onClick={onPhone}
        />
      </div>

      <button className="account-workbench__danger" type="button" onClick={onLogout}>
        <LogOut aria-hidden="true" />
        {t('account.workbench.logout')}
      </button>
    </div>
  );
}

interface PasswordViewProps {
  t: Translate;
  intl: MessageFormatterShape;
  forcePasswordChange: boolean;
  form: FormInstance<PasswordFields>;
  rules: FieldRules<PasswordFields>;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function PasswordView({
  t,
  intl,
  forcePasswordChange,
  form,
  rules,
  submitting,
  onBack,
  onSubmit,
}: PasswordViewProps) {
  return (
    <div className="account-workbench__view">
      {!forcePasswordChange && (
        <button className="account-workbench__back" type="button" onClick={onBack}>
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
      <Form className="account-workbench__form" form={form} layout="vertical">
        <Form.Item
          liveValue={false}
          name="oldPassword"
          label={intl.formatMessage({ id: 'OLD_PASSWORD' })}
          rules={rules.oldPassword}
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
          rules={rules.newPassword}
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
          rules={rules.confirmPassword}
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
          <Button type="default" onClick={onBack}>
            {intl.formatMessage({ id: 'CANCEL' })}
          </Button>
        )}
        <Button type="primary" loading={submitting} onClick={onSubmit}>
          {t('account.workbench.save_password')}
        </Button>
      </div>
    </div>
  );
}

interface PhoneViewProps {
  t: Translate;
  intl: MessageFormatterShape;
  form: FormInstance<PhoneFields>;
  rules: FieldRules<PhoneFields>;
  phoneValue?: string;
  canSendCode: boolean;
  codeSending: boolean;
  phoneSubmitting: boolean;
  sent: boolean;
  countdown: number;
  onBack: () => void;
  onSendCode: () => void;
  onSubmit: () => void;
}

export function PhoneView({
  t,
  intl,
  form,
  rules,
  phoneValue,
  canSendCode,
  codeSending,
  phoneSubmitting,
  sent,
  countdown,
  onBack,
  onSendCode,
  onSubmit,
}: PhoneViewProps) {
  return (
    <div className="account-workbench__view">
      <button className="account-workbench__back" type="button" onClick={onBack}>
        <ArrowLeft aria-hidden="true" />
        {t('account.workbench.back')}
      </button>
      <div className="account-workbench__section-title">
        <h2>{t('account.workbench.phone_title')}</h2>
        <p>{t('account.workbench.sms_hint')}</p>
      </div>
      <Form className="account-workbench__form" form={form} layout="vertical">
        <Form.Item name="phone" label={intl.formatMessage({ id: 'UserPhone' })} rules={rules.phone}>
          <Input placeholder={intl.formatMessage({ id: 'ChangePhonePlaceHolder' })} />
        </Form.Item>
        <p className="account-workbench__hint">
          {intl.formatMessage(
            { id: 'SendPhoneLable' },
            {
              phone: formatPhone(phoneValue) || emptyValue,
            },
          )}
        </p>
        <div className="account-workbench__code-row">
          <Form.Item
            liveValue={false}
            name="verifyCode"
            className="account-workbench__code-item"
            rules={rules.verifyCode}
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
            onClick={onSendCode}
          >
            {sent
              ? `${countdown}s ${intl.formatMessage({ id: 'RetryGetCode' })}`
              : intl.formatMessage({ id: 'GetVerificationCode' })}
          </Button>
        </div>
      </Form>
      <div className="account-workbench__footer vdui-modal-footer">
        <Button type="default" onClick={onBack}>
          {intl.formatMessage({ id: 'CANCEL' })}
        </Button>
        <Button type="primary" loading={phoneSubmitting} onClick={onSubmit}>
          {t('account.workbench.save_phone')}
        </Button>
      </div>
    </div>
  );
}
