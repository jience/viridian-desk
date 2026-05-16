# Frontend Redesign Phase 3F Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/configPage` as a coherent pre-login settings workbench while preserving all existing settings behavior.

**Architecture:** Keep existing routes, Redux selectors, native bridge calls, and modals. Add a small settings presentation layer under `src/pages/configPage/redesign/`, then refactor the existing settings subpages to render through that layer without changing payloads or side effects.

**Tech Stack:** React, TypeScript, SCSS/CSS modules, Ant Design primitives already in the app, `react-intl`, `react-i18next`, existing Vite/Tauri pipeline.

---

## File Map

- Create `src/pages/configPage/redesign/components/SettingsWorkbench.tsx`: reusable section, group, row, status, and metric presentation components.
- Create `src/pages/configPage/redesign/components/index.ts`: barrel exports for settings presentation components.
- Modify `src/pages/configPage/redesign/index.tsx`: route-derived metadata, header subtitle/status, and shell composition.
- Modify `src/pages/configPage/redesign/index.scss`: shell, navigation, shared workbench, AntD overrides, light/dark variables, and responsive behavior.
- Modify `src/pages/configPage/subPages/serverSetting/index.tsx`: gateway workbench presentation using existing gateway Redux behavior.
- Modify `src/pages/configPage/subPages/serverSetting/index.scss`: server page layout and gateway list styles.
- Modify `src/pages/configPage/subPages/commonSetting/index.tsx` and child setting components: grouped common preferences using shared rows while preserving dispatches.
- Modify common setting module styles under `src/pages/configPage/subPages/commonSetting/**/index.module.scss`: compact controls, theme swatches, and responsive layout.
- Modify `src/pages/configPage/subPages/advancedSetting/index.tsx` and child components: grouped diagnosis, network, developer, and log rows.
- Modify advanced setting styles under `src/pages/configPage/subPages/advancedSetting/**/index.scss`: shared workbench fit, table readability, and action layout.
- Modify `src/pages/configPage/subPages/about/index.tsx`, `VersionInfo/index.tsx`, `LicenseContent/index.tsx`, and related styles: calmer about/version workbench.
- Modify `src/locales/zh-CN.js`, `src/locales/en-US.js`, `src/locales/zh-TW.js`: add new `react-intl` shell subtitles.
- Modify `src/assets/locales/zh-CN.json`, `src/assets/locales/en-US.json`, `src/assets/locales/zh-TW.json`: add new `react-i18next` subpage labels and descriptions.

## Execution Order

Run tasks in order. Task 1 creates shared components that later tasks import. Task 2 styles shell and shared classes before subpages rely on them. Tasks 3-6 redesign one settings area at a time. Task 7 adds missing locale copy and final verification.

## Task 1: Add Shared Settings Presentation Components

**Files:**
- Create: `src/pages/configPage/redesign/components/SettingsWorkbench.tsx`
- Create: `src/pages/configPage/redesign/components/index.ts`

- [ ] **Step 1: Create the shared component file**

Create `src/pages/configPage/redesign/components/SettingsWorkbench.tsx` with:

```tsx
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
        {props.description && <div className="vd-settings-row__description">{props.description}</div>}
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
```

- [ ] **Step 2: Create the barrel export**

Create `src/pages/configPage/redesign/components/index.ts` with:

```ts
export {
  SettingsGroup,
  SettingsMetric,
  SettingsRow,
  SettingsSection,
  SettingsStatus,
} from './SettingsWorkbench';
export type {
  SettingsGroupProps,
  SettingsMetricProps,
  SettingsRowProps,
  SettingsSectionProps,
  SettingsStatusProps,
} from './SettingsWorkbench';
```

- [ ] **Step 3: Run verification**

Run: `pnpm run lint`

Expected: command exits with code 0.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/pages/configPage/redesign/components/SettingsWorkbench.tsx src/pages/configPage/redesign/components/index.ts
git commit -m "Add settings workbench presentation components"
```

## Task 2: Redesign The Settings Shell And Shared Styles

**Files:**
- Modify: `src/pages/configPage/redesign/index.tsx`
- Modify: `src/pages/configPage/redesign/index.scss`

- [ ] **Step 1: Update shell metadata in `index.tsx`**

In `src/pages/configPage/redesign/index.tsx`, replace `tabButtons` items with route metadata that includes subtitle IDs:

```tsx
const tabButtons = useMemo(
  () => [
    {
      name: intl.formatMessage({ id: 'Server' }),
      subtitle: intl.formatMessage({ id: 'SettingsServerSubtitle' }),
      icon: 'icon-net',
      path: `${SETTINGS_ROOT}/serverSetting`,
    },
    {
      name: intl.formatMessage({ id: 'COMMONSETUP' }),
      subtitle: intl.formatMessage({ id: 'SettingsCommonSubtitle' }),
      icon: 'icon-stencil',
      path: `${SETTINGS_ROOT}/commonSetting`,
    },
    {
      name: intl.formatMessage({ id: 'Senior' }),
      subtitle: intl.formatMessage({ id: 'SettingsAdvancedSubtitle' }),
      icon: 'icon-log',
      path: `${SETTINGS_ROOT}/advancedSetting`,
    },
    {
      name: intl.formatMessage({ id: 'ABOUT' }),
      subtitle: intl.formatMessage({ id: 'SettingsAboutSubtitle' }),
      icon: 'icon-info-s',
      path: `${SETTINGS_ROOT}/about`,
    },
  ],
  [intl],
);
```

After `activeTabName`, add:

```tsx
const activeTabSubtitle = tabButtons.find((button) => button.path === activeTabPath)?.subtitle;
```

Replace the header title block with:

```tsx
<div className="redesign-settings-page__heading">
  <span className="redesign-settings-page__eyebrow">
    {intl.formatMessage({ id: 'SettingsWorkbenchEyebrow' })}
  </span>
  <h1 className="redesign-settings-page__title">
    {activeTabName ?? intl.formatMessage({ id: 'COMMONSETUP' })}
  </h1>
  {activeTabSubtitle && <p className="redesign-settings-page__subtitle">{activeTabSubtitle}</p>}
</div>
```

Replace the sidebar brand text with:

```tsx
<div className="redesign-settings-page__brand">
  <span className="redesign-settings-page__brand-mark">VD</span>
  <span>{intl.formatMessage({ id: 'SettingsWorkbenchTitle' })}</span>
</div>
```

- [ ] **Step 2: Replace page-level shell styles**

In `src/pages/configPage/redesign/index.scss`, replace the top `.redesign-settings-page` variable/background block with:

```scss
.redesign-settings-page {
  --settings-page-bg: #f4f8f6;
  --settings-page-surface: rgba(255, 255, 255, 0.92);
  --settings-page-surface-subtle: rgba(244, 249, 247, 0.86);
  --settings-page-rail: #ffffff;
  --settings-page-text: #14221c;
  --settings-page-muted: #64766d;
  --settings-page-border: rgba(56, 86, 73, 0.16);
  --settings-page-accent: #127454;
  --settings-page-accent-strong: #0b5f43;
  --settings-page-accent-soft: rgba(18, 116, 84, 0.1);
  --settings-page-danger: #c84d4d;
  --settings-page-warning: #a56b18;
  --settings-page-info: #2374b7;
  --settings-page-shadow: 0 20px 48px rgba(27, 55, 44, 0.12);
  --settings-page-focus: rgba(18, 116, 84, 0.46);

  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--settings-page-bg);
  color: var(--settings-page-text);

  .vd-prelogin-settings-shell {
    min-height: 0;
    background: transparent;
  }

  .vd-prelogin-settings-shell__sidebar {
    position: relative;
    overflow: hidden;
    border-right-color: var(--settings-page-border);
    background: var(--settings-page-rail);
  }

  .vd-prelogin-settings-shell__main {
    padding: 18px 20px 20px;
  }

  .vd-prelogin-settings-shell__header {
    min-height: 58px;
    border-bottom: 1px solid var(--settings-page-border);
    padding-bottom: 14px;
  }

  .vd-prelogin-settings-shell__content {
    overflow: hidden;
  }

  :where(.ant-btn, .ant-select-selector, .ant-input, .ant-input-affix-wrapper) {
    box-shadow: none;
  }
}

:root.dark .redesign-settings-page,
:root[data-ui-theme='dark'] .redesign-settings-page {
  --settings-page-bg: #0d1110;
  --settings-page-surface: rgba(18, 24, 22, 0.82);
  --settings-page-surface-subtle: rgba(255, 255, 255, 0.045);
  --settings-page-rail: rgba(10, 14, 13, 0.92);
  --settings-page-text: #edf8f3;
  --settings-page-muted: #9fb3aa;
  --settings-page-border: rgba(185, 245, 225, 0.14);
  --settings-page-accent: #70e3c2;
  --settings-page-accent-strong: #9af4d5;
  --settings-page-accent-soft: rgba(112, 227, 194, 0.12);
  --settings-page-danger: #ff8f8a;
  --settings-page-warning: #ffd58a;
  --settings-page-info: #8ccfff;
  --settings-page-shadow: 0 22px 54px rgba(0, 0, 0, 0.28);
  --settings-page-focus: rgba(112, 227, 194, 0.68);
}
```

- [ ] **Step 3: Add shared workbench styles**

Append these shared styles to `src/pages/configPage/redesign/index.scss`:

```scss
.redesign-settings-page__subtitle {
  margin: 0;
  color: var(--settings-page-muted);
  font-size: 13px;
  line-height: 1.45;
}

.redesign-settings-page__content {
  height: 100%;
  min-height: 0;
  align-items: stretch;
  justify-content: stretch;
  overflow: hidden;
  border: 1px solid var(--settings-page-border);
  border-radius: 12px;
  padding: 0;
  background: var(--settings-page-surface);
  box-shadow: var(--settings-page-shadow);
}

.vd-settings-section {
  width: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
  padding: 18px;
  color: var(--settings-page-text);
}

.vd-settings-section__header,
.vd-settings-group__header,
.vd-settings-row,
.vd-settings-row__title-line,
.vd-settings-section__actions,
.vd-settings-group__actions,
.vd-settings-row__action {
  display: flex;
  align-items: center;
}

.vd-settings-section__header {
  justify-content: space-between;
  gap: 16px;
}

.vd-settings-section__heading {
  min-width: 0;
}

.vd-settings-section__eyebrow {
  color: var(--settings-page-accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
}

.vd-settings-section__heading h2 {
  margin: 3px 0 4px;
  color: var(--settings-page-text);
  font-size: 22px;
  font-weight: 650;
  line-height: 1.2;
}

.vd-settings-section__heading p,
.vd-settings-group__header p,
.vd-settings-row__description,
.vd-settings-metric__helper {
  margin: 0;
  color: var(--settings-page-muted);
  font-size: 13px;
  line-height: 1.45;
}

.vd-settings-section__body {
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 14px;
  overflow: auto;
  padding-right: 4px;
}

.vd-settings-group {
  border: 1px solid var(--settings-page-border);
  border-radius: 10px;
  background: var(--settings-page-surface-subtle);
  overflow: hidden;
}

.vd-settings-group__header {
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--settings-page-border);
}

.vd-settings-group__header h3 {
  margin: 0 0 3px;
  color: var(--settings-page-text);
  font-size: 15px;
  font-weight: 650;
}

.vd-settings-group__content {
  display: grid;
}

.vd-settings-row {
  min-height: 58px;
  gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--settings-page-border);
}

.vd-settings-row:last-child {
  border-bottom: 0;
}

.vd-settings-row__icon {
  flex: 0 0 auto;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 9px;
  color: var(--settings-page-accent);
  background: var(--settings-page-accent-soft);
}

.vd-settings-row__content {
  min-width: 0;
  flex: 1 1 auto;
}

.vd-settings-row__title-line {
  gap: 8px;
  min-width: 0;
}

.vd-settings-row__title {
  min-width: 0;
  overflow: hidden;
  color: var(--settings-page-text);
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vd-settings-row__meta {
  flex: 0 0 auto;
}

.vd-settings-row__children {
  margin-top: 10px;
}

.vd-settings-row__action {
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 8px;
}

.vd-settings-status {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border-radius: 999px;
  padding: 0 9px;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
}

.vd-settings-status--default {
  color: var(--settings-page-muted);
  background: var(--settings-page-surface-subtle);
}

.vd-settings-status--success {
  color: var(--settings-page-accent-strong);
  background: var(--settings-page-accent-soft);
}

.vd-settings-status--warning {
  color: var(--settings-page-warning);
  background: rgba(225, 170, 70, 0.16);
}

.vd-settings-status--danger {
  color: var(--settings-page-danger);
  background: rgba(216, 82, 82, 0.14);
}

.vd-settings-status--info {
  color: var(--settings-page-info);
  background: rgba(72, 147, 215, 0.14);
}

.vd-settings-metric {
  min-width: 0;
  border: 1px solid var(--settings-page-border);
  border-radius: 9px;
  padding: 12px;
  background: var(--settings-page-surface);
}

.vd-settings-metric__label,
.vd-settings-metric__helper {
  display: block;
}

.vd-settings-metric__label {
  color: var(--settings-page-muted);
  font-size: 12px;
}

.vd-settings-metric strong {
  display: block;
  margin: 4px 0;
  overflow: hidden;
  color: var(--settings-page-text);
  font-size: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.redesign-settings-page :where(.ant-btn, .ant-select-selector, .ant-switch) {
  border-radius: 8px;
}

.redesign-settings-page :where(.ant-btn:focus-visible, .ant-select-focused .ant-select-selector) {
  outline: 2px solid var(--settings-page-focus);
  outline-offset: 2px;
}

@container (max-width: 760px) {
  .vd-settings-section {
    padding: 14px;
  }

  .vd-settings-section__header,
  .vd-settings-group__header,
  .vd-settings-row {
    align-items: flex-start;
  }

  .vd-settings-section__header,
  .vd-settings-group__header {
    flex-direction: column;
  }

  .vd-settings-row {
    flex-wrap: wrap;
  }

  .vd-settings-row__action {
    width: 100%;
    justify-content: flex-start;
  }
}
```

- [ ] **Step 4: Remove decorative background patterns**

In the same stylesheet, remove any previous `.redesign-settings-page` radial/grid background declarations and sidebar `::before` grid mask declarations that remain after Step 2. The stylesheet must not contain `radial-gradient` or `mask-image` after this task.

Run:

```bash
rg -n "radial-gradient|mask-image" src/pages/configPage/redesign/index.scss
```

Expected: command exits with code 1 and no matches.

- [ ] **Step 5: Run verification and commit**

Run: `pnpm run lint`

Expected: command exits with code 0.

Then run:

```bash
git add src/pages/configPage/redesign/index.tsx src/pages/configPage/redesign/index.scss
git commit -m "Redesign settings shell workbench"
```

## Task 3: Redesign Server Settings Workbench

**Files:**
- Modify: `src/pages/configPage/subPages/serverSetting/index.tsx`
- Modify: `src/pages/configPage/subPages/serverSetting/index.scss`

- [ ] **Step 1: Update imports**

In `src/pages/configPage/subPages/serverSetting/index.tsx`, remove `SettingItem` and add shared presentation imports:

```tsx
import {
  SettingsGroup,
  SettingsMetric,
  SettingsRow,
  SettingsSection,
  SettingsStatus,
} from '../../redesign/components';
```

Keep existing Redux, AntD, modal, dropdown, and service imports.

- [ ] **Step 2: Add derived gateway summary values**

Inside `ServerSetting`, after selectors, add:

```tsx
const currentGateway = gatewayList.find((gateway) => gateway.auto);
const gatewayCount = gatewayList.length;
const connectionTone = connected && network ? 'success' : 'warning';
const connectionLabel =
  connected && network
    ? t('config_page.server_setting.gateway_connected')
    : t('config_page.server_setting.gateway_disconnected');
```

- [ ] **Step 3: Replace JSX with workbench layout**

Replace the existing return body with:

```tsx
return (
  <SettingsSection
    eyebrow={t('config_page.server_setting.server_access')}
    title={t('config_page.server_setting.gateway_management')}
    description={t('config_page.server_setting.gateway_management_description')}
    actions={
      <Button type="primary" icon={<i className="iconfont icon-add" />} onClick={addServer}>
        {t('config_page.server_setting.add_server')}
      </Button>
    }
  >
    <div className="server-setting-summary">
      <SettingsMetric
        label={t('config_page.server_setting.current_gateway')}
        value={currentGateway?.name || '-'}
        helper={currentGateway ? `${currentGateway.address}:${currentGateway.port}` : '-'}
      />
      <SettingsMetric
        label={t('config_page.server_setting.gateway_count')}
        value={gatewayCount}
        helper={t('config_page.server_setting.gateway_count_helper')}
      />
      <SettingsMetric
        label={t('config_page.server_setting.connection_status')}
        value={<SettingsStatus tone={connectionTone}>{connectionLabel}</SettingsStatus>}
        helper={network ? t('config_page.server_setting.network_available') : t('config_page.server_setting.network_unavailable')}
      />
    </div>

    <SettingsGroup
      title={t('config_page.server_setting.gateway_list')}
      description={t('config_page.server_setting.gateway_list_description')}
    >
      {gatewayList.length === 0 ? (
        <div className="server-setting-empty">
          <i className="iconfont icon-net" />
          <strong>{t('config_page.server_setting.empty_gateway_title')}</strong>
          <span>{t('config_page.server_setting.empty_gateway_description')}</span>
          <Button type="primary" icon={<i className="iconfont icon-add" />} onClick={addServer}>
            {t('config_page.server_setting.add_server')}
          </Button>
        </div>
      ) : (
        gatewayList.map((g) => {
          const subTitle =
            gatewayAddrShowSwitch === 'Enabled'
              ? `${g.address}:${g.port}`
              : desensitizeText(g.address, 0, 3) + desensitizeText(`:${g.port}`, 1, 0);

          return (
            <SettingsRow
              key={g.uuid}
              icon={<i className="iconfont icon-net" />}
              title={g.name}
              description={subTitle}
              meta={g.auto ? <SettingsStatus tone="success">{t('config_page.current')}</SettingsStatus> : undefined}
              action={<DropdownBtn options={generateMenus(g)} />}
            />
          );
        })
      )}
    </SettingsGroup>

    <ServerEditModal ref={serverEditModalRef} />
  </SettingsSection>
);
```

- [ ] **Step 4: Update server styles**

Replace `src/pages/configPage/subPages/serverSetting/index.scss` with:

```scss
.server-setting-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.server-setting-empty {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 36px 16px;
  color: var(--settings-page-muted);
  text-align: center;

  .iconfont {
    display: grid;
    width: 42px;
    height: 42px;
    place-items: center;
    border-radius: 12px;
    color: var(--settings-page-accent);
    background: var(--settings-page-accent-soft);
    font-size: 20px;
  }

  strong {
    color: var(--settings-page-text);
    font-size: 15px;
  }

  span {
    max-width: 360px;
    font-size: 13px;
    line-height: 1.45;
  }
}

@container (max-width: 820px) {
  .server-setting-summary {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

- [ ] **Step 5: Run verification and commit**

Run: `pnpm run lint`

Expected: command exits with code 0.

Then run:

```bash
git add src/pages/configPage/subPages/serverSetting/index.tsx src/pages/configPage/subPages/serverSetting/index.scss
git commit -m "Redesign server settings workbench"
```

## Task 4: Redesign Common Settings Workbench

**Files:**
- Modify: `src/pages/configPage/subPages/commonSetting/index.tsx`
- Modify: `src/pages/configPage/subPages/commonSetting/index.module.scss`
- Modify: `src/pages/configPage/subPages/commonSetting/AutoStart/index.tsx`
- Modify: `src/pages/configPage/subPages/commonSetting/AutoUpdate/index.tsx`
- Modify: `src/pages/configPage/subPages/commonSetting/FullScreen/index.tsx`
- Modify: `src/pages/configPage/subPages/commonSetting/LanguageSelect/index.tsx`
- Modify: `src/pages/configPage/subPages/commonSetting/ThemeSelect/index.tsx`
- Modify: child `index.module.scss` files under the same folders.

- [ ] **Step 1: Wrap common settings in a section and groups**

Replace the return in `src/pages/configPage/subPages/commonSetting/index.tsx` with:

```tsx
return (
  <SettingsSection
    eyebrow={t('config_page.common_setting.preferences')}
    title={t('COMMONSETUP')}
    description={t('config_page.common_setting.preferences_description')}
  >
    <div className={style.commonSettingWrapper}>
      <SettingsGroup
        title={t('config_page.common_setting.startup_display')}
        description={t('config_page.common_setting.startup_display_description')}
      >
        <AutoStart />
        {showFullScreen && <FullScreen />}
        <AutoUpdate />
      </SettingsGroup>
      <SettingsGroup
        title={t('config_page.common_setting.appearance_language')}
        description={t('config_page.common_setting.appearance_language_description')}
      >
        <LanguageSelect />
        <ThemeSelect />
      </SettingsGroup>
    </div>
  </SettingsSection>
);
```

Add imports:

```tsx
import { useTranslation } from 'react-i18next';
import { SettingsGroup, SettingsSection } from '../../redesign/components';
```

Inside `CommonSetting`, add:

```tsx
const { t } = useTranslation();
```

- [ ] **Step 2: Convert switch rows**

For `AutoStart`, `FullScreen`, and `AutoUpdate`, replace `SettingItem` usage with `SettingsRow`. Example for `AutoStart`:

```tsx
return (
  <SettingsRow
    icon={<i className="iconfont icon-stencil" />}
    title={t('config_page.common_setting.auto_start')}
    description={t('config_page.common_setting.auto_start_description')}
    action={<Switch size="small" checked={autoStart} onChange={switchAutoStart} />}
  />
);
```

Use these equivalent titles/descriptions:

- `FullScreen`: title `config_page.common_setting.full_screen_mode`, description `config_page.common_setting.full_screen_description`
- `AutoUpdate`: title `config_page.common_setting.auto_update`, description `config_page.common_setting.auto_update_description`

Add `SettingsRow` import to each file:

```tsx
import { SettingsRow } from '../../../redesign/components';
```

Remove `SettingItem` imports from these three files.

- [ ] **Step 3: Convert language row**

In `LanguageSelect/index.tsx`, replace the return with:

```tsx
return (
  <SettingsRow
    icon={<i className="iconfont icon-language" />}
    title={t('config_page.common_setting.language')}
    description={t('config_page.common_setting.language_description')}
    action={
      <Select
        className={style.languageSelect}
        size="small"
        options={languageOptions}
        onChange={(e) => changeLanguage(e)}
        value={language || 'zh-CN'}
        defaultValue={language || 'zh-CN'}
      />
    }
  />
);
```

Add `SettingsRow` import and remove `SettingItem`.

- [ ] **Step 4: Convert theme row**

In `ThemeSelect/index.tsx`, replace `SettingItem` with:

```tsx
return (
  <SettingsRow
    icon={<i className="iconfont icon-stencil" />}
    title={t('config_page.common_setting.theme')}
    description={t('config_page.common_setting.theme_description')}
  >
    <div className={style.themeSelectContent}>
      {themeList.map((i) => {
        const isActive = i.key === currentTheme;
        const itemClass = `${style.themeItem} ${isActive ? style.active : ''}`;
        const topContentClass = `${style.topContent} ${i.classNames.join(' ')}`;
        return (
          <button type="button" onClick={() => switchTheme(i.key)} key={i.key} className={itemClass}>
            <div className={topContentClass} />
            <div className={style.bottomContent}>
              <span>{i.label}</span>
              <div>{isActive && <CheckOutlined className={style.rightIcon} />}</div>
            </div>
          </button>
        );
      })}
    </div>
  </SettingsRow>
);
```

Add `SettingsRow` import and remove `SettingItem`.

- [ ] **Step 5: Replace common module style**

Replace `src/pages/configPage/subPages/commonSetting/index.module.scss` with:

```scss
.commonSettingWrapper {
  display: grid;
  align-content: start;
  gap: 14px;
}
```

For `AutoStart`, `AutoUpdate`, and `FullScreen` module styles, replace contents with:

```scss
.autoStartWrapper,
.autoUpdateWrapper,
.fullScreenWrapper {
  display: contents;
}
```

Use only the class that exists in each file. For `LanguageSelect/index.module.scss`, use:

```scss
.languageSelectWrapper {
  display: contents;
}

.languageSelect {
  min-width: 160px;
}
```

For `ThemeSelect/index.module.scss`, keep existing theme background classes and replace layout classes with:

```scss
.themeSelectWrapper {
  display: contents;
}

.themeSelectContent {
  display: grid;
  grid-template-columns: repeat(3, minmax(96px, 1fr));
  gap: 10px;
}

.themeItem {
  min-width: 0;
  border: 1px solid var(--settings-page-border);
  border-radius: 9px;
  padding: 0;
  overflow: hidden;
  background: var(--settings-page-surface);
  color: var(--settings-page-text);
  cursor: pointer;
  text-align: left;
}

.themeItem.active {
  border-color: var(--settings-page-accent);
  box-shadow: 0 0 0 2px var(--settings-page-accent-soft);
}

.topContent {
  height: 58px;
  background-size: cover;
  background-position: center;
}

.bottomContent {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
  font-size: 12px;
  font-weight: 600;
}

.rightIcon {
  color: var(--settings-page-accent);
}
```

Keep `.themeLight`, `.themeDark`, and `.themeSystem` definitions in the same file.

- [ ] **Step 6: Run verification and commit**

Run: `pnpm run lint`

Expected: command exits with code 0.

Then run:

```bash
git add src/pages/configPage/subPages/commonSetting
git commit -m "Redesign common settings workbench"
```

## Task 5: Redesign Advanced Settings Workbench

**Files:**
- Modify: `src/pages/configPage/subPages/advancedSetting/index.tsx`
- Modify: `src/pages/configPage/subPages/advancedSetting/index.scss`
- Modify: `src/pages/configPage/subPages/advancedSetting/Diagnosis/index.tsx`
- Modify: `src/pages/configPage/subPages/advancedSetting/DeveloperMode/index.tsx`
- Modify: `src/pages/configPage/subPages/advancedSetting/NetworkInfo/index.tsx`
- Modify: `src/pages/configPage/subPages/advancedSetting/LogInfo/index.tsx`
- Modify: related advanced subpage styles.

- [ ] **Step 1: Wrap advanced settings in a section**

Replace the return in `advancedSetting/index.tsx` with:

```tsx
return (
  <SettingsSection
    eyebrow={t('config_page.advanced_setting.operations')}
    title={t('Senior')}
    description={t('config_page.advanced_setting.operations_description')}
  >
    <div className="advanced-setting">
      <SettingsGroup
        title={t('config_page.advanced_setting.support_tools')}
        description={t('config_page.advanced_setting.support_tools_description')}
      >
        <Diagnosis />
        <NetworkInfo />
      </SettingsGroup>
      <SettingsGroup
        title={t('config_page.advanced_setting.developer_tools')}
        description={t('config_page.advanced_setting.developer_tools_description')}
      >
        <DeveloperMode />
        {developerMode && <LogInfo />}
      </SettingsGroup>
    </div>
  </SettingsSection>
);
```

Add imports:

```tsx
import { useTranslation } from 'react-i18next';
import { SettingsGroup, SettingsSection } from '../../redesign/components';
```

Inside `AdvancedSetting`, add:

```tsx
const { t } = useTranslation();
```

- [ ] **Step 2: Convert diagnosis and developer rows**

In `Diagnosis/index.tsx`, replace `SettingItem` with:

```tsx
<SettingsRow
  icon={<i className="iconfont icon-log" />}
  title={t('config_page.advanced_setting.diagnosis')}
  description={t('config_page.advanced_setting.diagnosis_description')}
  action={
    <Button className="right-btn" size="small" onClick={handleOpenDiagnosis}>
      {t('config_page.advanced_setting.diagnosis')}
    </Button>
  }
/>
```

In `DeveloperMode/index.tsx`, replace `SettingItem` with:

```tsx
<SettingsRow
  icon={<i className="iconfont icon-log" />}
  title={t('config_page.advanced_setting.developer_mode')}
  description={t('config_page.advanced_setting.developer_mode_description')}
  action={<Switch size="small" checked={developerMode} onChange={(e: boolean) => switchHandle(e)} />}
/>
```

Remove `SettingItem` imports and add:

```tsx
import { SettingsRow } from '../../../redesign/components';
```

- [ ] **Step 3: Convert network row**

In `NetworkInfo/index.tsx`, replace the `SettingItem` wrapper with:

```tsx
<SettingsRow
  icon={<i className="iconfont icon-net" />}
  title={t('config_page.advanced_setting.network_info')}
  description={networkInfo?.name || t('config_page.advanced_setting.network_info_description')}
  action={
    <CopyToClipboard text={copyIpMacInfo} onCopy={handleOnCopy}>
      <Button
        size="small"
        icon={netCopied ? <CheckCircleOutlined /> : <CopyOutlined />}
        onClick={(e: any) => e.stopPropagation()}
      >
        {t('config_page.advanced_setting.copy_content')}
      </Button>
    </CopyToClipboard>
  }
>
  <InfoTable
    rows={networkInfoRows}
    showEdit={!!isThin}
    editOperate={
      <Button
        type="text"
        icon={<EditOutlined />}
        onClick={(e: any) => {
          e.stopPropagation();
          handleEditNetworkInfo();
        }}
      >
        {t('config_page.edit')}
      </Button>
    }
  />
</SettingsRow>
```

Add `SettingsRow` import and remove `SettingItem`.

- [ ] **Step 4: Convert log row**

In `LogInfo/index.tsx`, replace `SettingItem` with:

```tsx
<SettingsRow
  icon={<i className="iconfont icon-log" />}
  title={
    <div className="log-title">
      <span>{logSizeNumber}</span> {logSizeUnit}
    </div>
  }
  description={t('config_page.advanced_setting.log_size')}
  action={
    <Space size={4} wrap>
      <Button icon={<DeleteOutlined />} size="small" onClick={() => handleClearLog()}>
        {t('config_page.advanced_setting.clear')}
      </Button>
      {!isIntegratedMode && (
        <Button icon={<FolderOpenOutlined />} size="small" onClick={() => lookLog()}>
          {t('config_page.advanced_setting.look')}
        </Button>
      )}
    </Space>
  }
>
  <InfoTable
    rows={logInfoRows}
    showEdit={!isIntegratedMode}
    editOperate={
      <Button
        type="text"
        icon={<EditOutlined />}
        onClick={(e: any) => {
          e.stopPropagation();
          handleInfoTableEdit();
        }}
      >
        {t('config_page.edit')}
      </Button>
    }
  />
</SettingsRow>
```

Add `SettingsRow` import and remove `SettingItem`.

- [ ] **Step 5: Replace advanced layout styles**

Replace `advancedSetting/index.scss` with:

```scss
.advanced-setting {
  display: grid;
  align-content: start;
  gap: 14px;

  .log-title {
    font-weight: 600;

    span {
      color: var(--settings-page-accent-strong);
      font-size: 18px;
      font-weight: 750;
    }
  }
}
```

For `Diagnosis/index.scss`, `DeveloperMode/index.scss`, `NetworkInfo/index.scss`, and `LogInfo/index.scss`, keep modal/table-specific nested styles and replace wrapper layout with:

```scss
.diagnosis-wrapper,
.develop-mode-wrapper,
.network-info-wrapper,
.log-info-wrapper {
  display: contents;
}
```

Use only the wrapper class that exists in each file. Keep existing modal styles under subfolders unchanged.

- [ ] **Step 6: Run verification and commit**

Run: `pnpm run lint`

Expected: command exits with code 0.

Then run:

```bash
git add src/pages/configPage/subPages/advancedSetting
git commit -m "Redesign advanced settings workbench"
```

## Task 6: Redesign About Settings Workbench

**Files:**
- Modify: `src/pages/configPage/subPages/about/index.tsx`
- Modify: `src/pages/configPage/subPages/about/index.scss`
- Modify: `src/pages/configPage/subPages/about/VersionInfo/index.tsx`
- Modify: `src/pages/configPage/subPages/about/VersionInfo/index.module.scss`
- Modify: `src/pages/configPage/subPages/about/LicenseContent/index.tsx`
- Modify: `src/pages/configPage/subPages/about/LicenseContent/index.module.scss`

- [ ] **Step 1: Wrap about page in a settings section**

Replace the loaded content branch in `about/index.tsx` with:

```tsx
<SettingsSection
  eyebrow={t('config_page.about.product')}
  title={t('ABOUT')}
  description={t('config_page.about.product_description')}
>
  <div className="about">
    <VersionInfo aboutInfo={aboutInfo} />
    <div className="bottom-wrapper">
      <LicenseContent aboutInfo={aboutInfo} />
    </div>
    <div className="copyright">{aboutInfo?.copyright}</div>
  </div>
</SettingsSection>
```

Add imports:

```tsx
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '../../redesign/components';
```

Inside `About`, add:

```tsx
const { t } = useTranslation();
```

Keep the `Skeleton` loading branch.

- [ ] **Step 2: Convert version info to shared row and metrics**

In `VersionInfo/index.tsx`, add:

```tsx
import { SettingsGroup, SettingsMetric, SettingsRow } from '../../../redesign/components';
```

Replace the `SettingItem` return with:

```tsx
<SettingsGroup
  title={t('config_page.about.version_info')}
  description={t('config_page.about.version_info_description')}
>
  <SettingsRow
    icon={<i className="iconfont icon-info-s" />}
    title={mainTitle}
    description={subTitle}
    action={
      <Button
        size="small"
        icon={<RocketOutlined />}
        loading={checkUpgradeLoading}
        onClick={handleCheckUpgrade}
      >
        {t('config_page.about.version_update')}
      </Button>
    }
  />
  <div className={style.versionMetrics}>
    <SettingsMetric label={t('config_page.about.client_type')} value={aboutInfo?.clientType || '-'} />
    <SettingsMetric label={t('config_page.about.client_version')} value={aboutInfo?.clientVersion || '-'} />
    {isThin && <SettingsMetric label={t('config_page.about.sku')} value={aboutInfo?.sku || '-'} />}
  </div>
</SettingsGroup>
```

Remove `SettingItem` import.

- [ ] **Step 3: Convert license content**

In `LicenseContent/index.tsx`, replace `SettingItem` with:

```tsx
<SettingsGroup
  title={t('config_page.about.license_agreement')}
  description={t('config_page.about.license_description')}
  className={style.licenseGroup}
>
  <pre>{aboutInfo?.license || ''}</pre>
</SettingsGroup>
```

Add:

```tsx
import { SettingsGroup } from '../../../redesign/components';
```

Remove `SettingItem` import.

- [ ] **Step 4: Replace about styles**

Replace `about/index.scss` with:

```scss
.about {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 14px;

  .bottom-wrapper {
    min-height: 0;
    overflow: auto;
  }

  .copyright {
    color: var(--settings-page-muted);
    font-size: 12px;
    line-height: 1.45;
    text-align: right;
  }
}
```

In `VersionInfo/index.module.scss`, keep `.mainTitle`, `.tagWrapper`, `.subTitleWrapper`, and `.subTitleItem`, then add:

```scss
.versionInfoWrapper {
  display: contents;
}

.versionMetrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 0 16px 16px;
}
```

In `LicenseContent/index.module.scss`, use:

```scss
.licenseContentWrapper {
  display: contents;
}

.licenseGroup {
  min-height: 0;

  pre {
    max-height: 320px;
    margin: 0;
    overflow: auto;
    padding: 16px;
    color: var(--settings-page-muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}
```

- [ ] **Step 5: Run verification and commit**

Run: `pnpm run lint`

Expected: command exits with code 0.

Then run:

```bash
git add src/pages/configPage/subPages/about
git commit -m "Redesign about settings workbench"
```

## Task 7: Add Settings Locale Copy And Final Verification

**Files:**
- Modify: `src/locales/zh-CN.js`
- Modify: `src/locales/en-US.js`
- Modify: `src/locales/zh-TW.js`
- Modify: `src/assets/locales/zh-CN.json`
- Modify: `src/assets/locales/en-US.json`
- Modify: `src/assets/locales/zh-TW.json`
- Verify: all changed settings files.

- [ ] **Step 1: Add Simplified Chinese copy**

Add these keys to `src/locales/zh-CN.js` near existing settings keys:

```js
  SettingsWorkbenchEyebrow: '偏好设置',
  SettingsWorkbenchTitle: '设置中心',
  SettingsServerSubtitle: '配置登录前可用的接入网关与默认连接。',
  SettingsCommonSubtitle: '管理启动、显示、更新、语言和主题偏好。',
  SettingsAdvancedSubtitle: '查看诊断、网络、开发者模式与日志工具。',
  SettingsAboutSubtitle: '查看客户端版本、更新、许可协议和版权信息。',
```

Add these `react-i18next` keys to `src/assets/locales/zh-CN.json` near the existing `config_page.*` settings keys:

```js
  "config_page.server_setting.gateway_connected": "已连接",
  "config_page.server_setting.gateway_disconnected": "未连接",
  "config_page.server_setting.gateway_management": "网关管理",
  "config_page.server_setting.gateway_management_description": "管理登录前用于连接桌面环境的服务器网关。",
  "config_page.server_setting.server_access": "服务器接入",
  "config_page.server_setting.current_gateway": "当前网关",
  "config_page.server_setting.gateway_count": "网关数量",
  "config_page.server_setting.gateway_count_helper": "可用接入点",
  "config_page.server_setting.connection_status": "连接状态",
  "config_page.server_setting.network_available": "网络可用",
  "config_page.server_setting.network_unavailable": "网络不可用",
  "config_page.server_setting.gateway_list": "网关列表",
  "config_page.server_setting.gateway_list_description": "默认网关会优先用于登录连接。",
  "config_page.server_setting.empty_gateway_title": "暂无网关",
  "config_page.server_setting.empty_gateway_description": "添加一个服务器网关后即可开始连接。",
  "config_page.common_setting.preferences": "通用偏好",
  "config_page.common_setting.preferences_description": "调整客户端启动、显示、更新、语言和主题。",
  "config_page.common_setting.startup_display": "启动与显示",
  "config_page.common_setting.startup_display_description": "控制客户端启动行为和窗口显示方式。",
  "config_page.common_setting.appearance_language": "外观与语言",
  "config_page.common_setting.appearance_language_description": "切换界面语言和主题模式。",
  "config_page.common_setting.auto_start_description": "系统启动后自动运行客户端。",
  "config_page.common_setting.full_screen_description": "登录后优先使用全屏显示。",
  "config_page.common_setting.auto_update_description": "自动检查并获取可用客户端更新。",
  "config_page.common_setting.language_description": "切换语言后会沿用现有重置逻辑。",
  "config_page.common_setting.theme_description": "选择浅色、深色或跟随系统主题。",
  "config_page.advanced_setting.operations": "高级工具",
  "config_page.advanced_setting.operations_description": "用于排障、网络查看、开发者模式和日志管理。",
  "config_page.advanced_setting.support_tools": "支持工具",
  "config_page.advanced_setting.support_tools_description": "快速收集诊断信息和网络信息。",
  "config_page.advanced_setting.developer_tools": "开发者工具",
  "config_page.advanced_setting.developer_tools_description": "开启后可查看和配置客户端日志。",
  "config_page.advanced_setting.diagnosis_description": "打开诊断工具并收集排障信息。",
  "config_page.advanced_setting.developer_mode_description": "启用日志和开发者相关工具。",
  "config_page.advanced_setting.network_info_description": "查看本机网络配置。",
  "config_page.about.product": "产品信息",
  "config_page.about.product_description": "查看客户端版本、更新状态和许可信息。",
  "config_page.about.version_info": "版本信息",
  "config_page.about.version_info_description": "客户端标识、构建信息和可用更新。",
  "config_page.about.client_type": "客户端类型",
  "config_page.about.client_version": "客户端版本",
  "config_page.about.sku": "产品规格",
  "config_page.about.license_description": "当前客户端包含的许可协议内容。"
```

- [ ] **Step 2: Add English copy**

Add top-level keys to `src/locales/en-US.js`:

```js
  SettingsWorkbenchEyebrow: 'Preferences',
  SettingsWorkbenchTitle: 'Settings center',
  SettingsServerSubtitle: 'Configure pre-login gateways and default access.',
  SettingsCommonSubtitle: 'Manage startup, display, updates, language, and theme.',
  SettingsAdvancedSubtitle: 'Review diagnostics, network, developer mode, and logs.',
  SettingsAboutSubtitle: 'Review client version, updates, license, and copyright.',
```

Add these `react-i18next` keys to `src/assets/locales/en-US.json`:

```js
  "config_page.server_setting.gateway_connected": "Connected",
  "config_page.server_setting.gateway_disconnected": "Disconnected",
  "config_page.server_setting.gateway_management": "Gateway management",
  "config_page.server_setting.gateway_management_description": "Manage server gateways used before login.",
  "config_page.server_setting.server_access": "Server access",
  "config_page.server_setting.current_gateway": "Current gateway",
  "config_page.server_setting.gateway_count": "Gateway count",
  "config_page.server_setting.gateway_count_helper": "Available access points",
  "config_page.server_setting.connection_status": "Connection status",
  "config_page.server_setting.network_available": "Network available",
  "config_page.server_setting.network_unavailable": "Network unavailable",
  "config_page.server_setting.gateway_list": "Gateway list",
  "config_page.server_setting.gateway_list_description": "The default gateway is used first during login.",
  "config_page.server_setting.empty_gateway_title": "No gateways",
  "config_page.server_setting.empty_gateway_description": "Add a server gateway to start connecting.",
  "config_page.common_setting.preferences": "General preferences",
  "config_page.common_setting.preferences_description": "Adjust startup, display, update, language, and theme behavior.",
  "config_page.common_setting.startup_display": "Startup and display",
  "config_page.common_setting.startup_display_description": "Control launch behavior and window display.",
  "config_page.common_setting.appearance_language": "Appearance and language",
  "config_page.common_setting.appearance_language_description": "Switch interface language and theme mode.",
  "config_page.common_setting.auto_start_description": "Run the client automatically after system startup.",
  "config_page.common_setting.full_screen_description": "Prefer full-screen display after login.",
  "config_page.common_setting.auto_update_description": "Automatically check for available client updates.",
  "config_page.common_setting.language_description": "Language changes keep the existing reset behavior.",
  "config_page.common_setting.theme_description": "Choose light, dark, or system theme.",
  "config_page.advanced_setting.operations": "Advanced tools",
  "config_page.advanced_setting.operations_description": "Tools for troubleshooting, network review, developer mode, and logs.",
  "config_page.advanced_setting.support_tools": "Support tools",
  "config_page.advanced_setting.support_tools_description": "Collect diagnostics and review network information.",
  "config_page.advanced_setting.developer_tools": "Developer tools",
  "config_page.advanced_setting.developer_tools_description": "Enable log viewing and developer-oriented tools.",
  "config_page.advanced_setting.diagnosis_description": "Open diagnostics and collect troubleshooting details.",
  "config_page.advanced_setting.developer_mode_description": "Enable logging and developer-related tools.",
  "config_page.advanced_setting.network_info_description": "Review local network configuration.",
  "config_page.about.product": "Product information",
  "config_page.about.product_description": "Review client version, update status, and license information.",
  "config_page.about.version_info": "Version information",
  "config_page.about.version_info_description": "Client identity, build details, and available updates.",
  "config_page.about.client_type": "Client type",
  "config_page.about.client_version": "Client version",
  "config_page.about.sku": "SKU",
  "config_page.about.license_description": "License agreement content included with this client."
```

- [ ] **Step 3: Add Traditional Chinese copy**

Add top-level keys to `src/locales/zh-TW.js`:

```js
  SettingsWorkbenchEyebrow: '偏好設置',
  SettingsWorkbenchTitle: '設置中心',
  SettingsServerSubtitle: '配置登入前可用的接入閘道與預設連線。',
  SettingsCommonSubtitle: '管理啟動、顯示、更新、語言和主題偏好。',
  SettingsAdvancedSubtitle: '查看診斷、網路、開發者模式與日誌工具。',
  SettingsAboutSubtitle: '查看客戶端版本、更新、許可協議和版權資訊。',
```

Add these `react-i18next` keys to `src/assets/locales/zh-TW.json`:

```js
  "config_page.server_setting.gateway_connected": "已連線",
  "config_page.server_setting.gateway_disconnected": "未連線",
  "config_page.server_setting.gateway_management": "閘道管理",
  "config_page.server_setting.gateway_management_description": "管理登入前用於連接桌面環境的伺服器閘道。",
  "config_page.server_setting.server_access": "伺服器接入",
  "config_page.server_setting.current_gateway": "當前閘道",
  "config_page.server_setting.gateway_count": "閘道數量",
  "config_page.server_setting.gateway_count_helper": "可用接入點",
  "config_page.server_setting.connection_status": "連線狀態",
  "config_page.server_setting.network_available": "網路可用",
  "config_page.server_setting.network_unavailable": "網路不可用",
  "config_page.server_setting.gateway_list": "閘道列表",
  "config_page.server_setting.gateway_list_description": "預設閘道會優先用於登入連線。",
  "config_page.server_setting.empty_gateway_title": "暫無閘道",
  "config_page.server_setting.empty_gateway_description": "新增一個伺服器閘道後即可開始連線。",
  "config_page.common_setting.preferences": "通用偏好",
  "config_page.common_setting.preferences_description": "調整客戶端啟動、顯示、更新、語言和主題。",
  "config_page.common_setting.startup_display": "啟動與顯示",
  "config_page.common_setting.startup_display_description": "控制客戶端啟動行為和視窗顯示方式。",
  "config_page.common_setting.appearance_language": "外觀與語言",
  "config_page.common_setting.appearance_language_description": "切換介面語言和主題模式。",
  "config_page.common_setting.auto_start_description": "系統啟動後自動執行客戶端。",
  "config_page.common_setting.full_screen_description": "登入後優先使用全螢幕顯示。",
  "config_page.common_setting.auto_update_description": "自動檢查並取得可用客戶端更新。",
  "config_page.common_setting.language_description": "切換語言後會沿用現有重置邏輯。",
  "config_page.common_setting.theme_description": "選擇淺色、深色或跟隨系統主題。",
  "config_page.advanced_setting.operations": "進階工具",
  "config_page.advanced_setting.operations_description": "用於排障、網路查看、開發者模式和日誌管理。",
  "config_page.advanced_setting.support_tools": "支援工具",
  "config_page.advanced_setting.support_tools_description": "快速收集診斷資訊和網路資訊。",
  "config_page.advanced_setting.developer_tools": "開發者工具",
  "config_page.advanced_setting.developer_tools_description": "開啟後可查看和配置客戶端日誌。",
  "config_page.advanced_setting.diagnosis_description": "開啟診斷工具並收集排障資訊。",
  "config_page.advanced_setting.developer_mode_description": "啟用日誌和開發者相關工具。",
  "config_page.advanced_setting.network_info_description": "查看本機網路配置。",
  "config_page.about.product": "產品資訊",
  "config_page.about.product_description": "查看客戶端版本、更新狀態和許可資訊。",
  "config_page.about.version_info": "版本資訊",
  "config_page.about.version_info_description": "客戶端識別、構建資訊和可用更新。",
  "config_page.about.client_type": "客戶端類型",
  "config_page.about.client_version": "客戶端版本",
  "config_page.about.sku": "產品規格",
  "config_page.about.license_description": "當前客戶端包含的許可協議內容。"
```

- [ ] **Step 4: Run final checks**

Run:

```bash
pnpm run lint
pnpm run build
git diff --check
git status --short
```

Expected:

- `pnpm run lint` exits with code 0.
- `pnpm run build` exits with code 0. Existing Vite dynamic import and chunk-size warnings may remain.
- `git diff --check` exits with code 0.
- `git status --short` shows only intended files before commit.

- [ ] **Step 5: Manual smoke checklist**

Run `pnpm run dev` or `pnpm run tauri dev`, then verify:

- `/configPage/serverSetting` renders the redesigned shell and gateway workbench.
- Add gateway opens `ServerEditModal`.
- Existing edit, default, and delete actions remain available on gateway rows.
- `/configPage/commonSetting` renders startup/display and appearance/language groups.
- Language and theme controls still dispatch existing behavior.
- `/configPage/advancedSetting` renders diagnosis, network, developer mode, and log rows when developer mode is enabled.
- `/configPage/about` renders version, update, license, and copyright sections.
- Exit action navigates to `/login`.
- Light and dark themes keep text, actions, and status badges readable.
- Narrow desktop widths do not clip sidebar labels, section headers, or row actions.

- [ ] **Step 6: Commit final locale and verification fixes**

Run:

```bash
git add src/locales/zh-CN.js src/locales/en-US.js src/locales/zh-TW.js
git add src/assets/locales/zh-CN.json src/assets/locales/en-US.json src/assets/locales/zh-TW.json
git commit -m "Add settings workbench locale strings"
```

If Task 7 required non-locale fixes during verification, commit them separately with:

```bash
git add src/pages/configPage
git commit -m "Fix settings workbench verification issues"
```
