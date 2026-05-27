import type { HTMLAttributes, ReactNode } from 'react';

export interface SettingsSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export interface SettingsGroupProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export interface SettingsRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

export interface SettingsStatusProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
}

export interface SettingsMetricProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
}

const joinClassNames = (...values: Array<string | false | undefined>) =>
  values.filter(Boolean).join(' ');

const hasContent = (value: ReactNode) => value !== null && value !== undefined && value !== false;

export function SettingsSection({
  actions,
  children,
  className,
  description,
  eyebrow,
  title,
  ...rest
}: SettingsSectionProps) {
  const hasActions = hasContent(actions);

  return (
    <section
      aria-label={typeof title === 'string' ? title : undefined}
      className={joinClassNames(
        'vd-settings-section',
        hasActions && 'vd-settings-section--with-toolbar',
        className,
      )}
      {...rest}
    >
      <div className="vd-settings-section__sr-context">
        {hasContent(eyebrow) && <span>{eyebrow}</span>}
        <h2>{title}</h2>
        {hasContent(description) && <p>{description}</p>}
      </div>
      {hasActions && (
        <header className="vd-settings-section__header vd-settings-section__header--toolbar">
          <div className="vd-settings-section__actions">{actions}</div>
        </header>
      )}
      <div className="vd-settings-section__body">{children}</div>
    </section>
  );
}

export function SettingsGroup({
  actions,
  children,
  className,
  description,
  title,
  ...rest
}: SettingsGroupProps) {
  const hasHeader = hasContent(title) || hasContent(description) || hasContent(actions);

  return (
    <section className={joinClassNames('vd-settings-group', className)} {...rest}>
      {hasHeader && (
        <header className="vd-settings-group__header">
          <div>
            {hasContent(title) && <h3>{title}</h3>}
            {hasContent(description) && <p>{description}</p>}
          </div>
          {hasContent(actions) && <div className="vd-settings-group__actions">{actions}</div>}
        </header>
      )}
      <div className="vd-settings-group__content">{children}</div>
    </section>
  );
}

export function SettingsRow({
  action,
  children,
  className,
  description,
  icon,
  meta,
  title,
  ...rest
}: SettingsRowProps) {
  return (
    <div className={joinClassNames('vd-settings-row', className)} {...rest}>
      {hasContent(icon) && <div className="vd-settings-row__icon">{icon}</div>}
      <div className="vd-settings-row__content">
        <div className="vd-settings-row__title-line">
          <div className="vd-settings-row__title">{title}</div>
          {hasContent(meta) && <span className="vd-settings-row__meta">{meta}</span>}
        </div>
        {hasContent(description) && (
          <div className="vd-settings-row__description">{description}</div>
        )}
        {hasContent(children) && <div className="vd-settings-row__children">{children}</div>}
      </div>
      {hasContent(action) && <div className="vd-settings-row__action">{action}</div>}
    </div>
  );
}

export function SettingsStatus({
  children,
  className,
  tone = 'default',
  ...rest
}: SettingsStatusProps) {
  return (
    <span
      className={joinClassNames('vd-settings-status', `vd-settings-status--${tone}`, className)}
      {...rest}
    >
      {children}
    </span>
  );
}

export function SettingsMetric({ className, helper, label, value, ...rest }: SettingsMetricProps) {
  return (
    <div className={joinClassNames('vd-settings-metric', className)} {...rest}>
      <span className="vd-settings-metric__label">{label}</span>
      <strong>{value}</strong>
      {hasContent(helper) && <span className="vd-settings-metric__helper">{helper}</span>}
    </div>
  );
}
