import type { ReactNode } from 'react';

export interface SettingsSectionProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export interface SettingsGroupProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export interface SettingsRowProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export interface SettingsStatusProps {
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
}

export interface SettingsMetricProps {
  label: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
}

const joinClassNames = (...values: Array<string | false | undefined>) =>
  values.filter(Boolean).join(' ');

export function SettingsSection(props: SettingsSectionProps) {
  return (
    <section className={joinClassNames('vd-settings-section', props.className)}>
      <header className="vd-settings-section__header">
        <div className="vd-settings-section__heading">
          {props.eyebrow && <span className="vd-settings-section__eyebrow">{props.eyebrow}</span>}
          <h2>{props.title}</h2>
          {props.description && <p>{props.description}</p>}
        </div>
        {props.actions && <div className="vd-settings-section__actions">{props.actions}</div>}
      </header>
      <div className="vd-settings-section__body">{props.children}</div>
    </section>
  );
}

export function SettingsGroup(props: SettingsGroupProps) {
  return (
    <section className={joinClassNames('vd-settings-group', props.className)}>
      {(props.title || props.description || props.actions) && (
        <header className="vd-settings-group__header">
          <div>
            {props.title && <h3>{props.title}</h3>}
            {props.description && <p>{props.description}</p>}
          </div>
          {props.actions && <div className="vd-settings-group__actions">{props.actions}</div>}
        </header>
      )}
      <div className="vd-settings-group__content">{props.children}</div>
    </section>
  );
}

export function SettingsRow(props: SettingsRowProps) {
  return (
    <div className={joinClassNames('vd-settings-row', props.className)}>
      {props.icon && <div className="vd-settings-row__icon">{props.icon}</div>}
      <div className="vd-settings-row__content">
        <div className="vd-settings-row__title-line">
          <span className="vd-settings-row__title">{props.title}</span>
          {props.meta && <span className="vd-settings-row__meta">{props.meta}</span>}
        </div>
        {props.description && (
          <div className="vd-settings-row__description">{props.description}</div>
        )}
        {props.children && <div className="vd-settings-row__children">{props.children}</div>}
      </div>
      {props.action && <div className="vd-settings-row__action">{props.action}</div>}
    </div>
  );
}

export function SettingsStatus({ tone = 'default', children }: SettingsStatusProps) {
  return <span className={`vd-settings-status vd-settings-status--${tone}`}>{children}</span>;
}

export function SettingsMetric(props: SettingsMetricProps) {
  return (
    <div className="vd-settings-metric">
      <span className="vd-settings-metric__label">{props.label}</span>
      <strong>{props.value}</strong>
      {props.helper && <span className="vd-settings-metric__helper">{props.helper}</span>}
    </div>
  );
}
