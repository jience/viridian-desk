# Frontend Redesign Phase 3C Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/app/application` with the approved application workbench card flow while preserving the existing virtual application behavior.

**Architecture:** Keep `src/pages/application/index.tsx` as the data and modal controller. Add a focused redesigned presentation module under `src/pages/application/redesign/` for the workbench, cards, filters, and empty state. Reuse existing API handlers, permission checks, `AppIcon`, `AppDetailModal`, `AddFromSysModal`, and `AddFromSelfModal`.

**Tech Stack:** React, TypeScript, SCSS, Ant Design primitives already in the app, i18next locale JSON files, existing Tauri/Vite build pipeline.

---

## File Map

- Create `src/pages/application/redesign/index.tsx`: redesigned application page, category segmented filter, app card grid, launch/details/remove-delete actions.
- Create `src/pages/application/redesign/index.scss`: scoped workbench styling for dark/light themes, responsive card grid, modal polish hooks.
- Modify `src/pages/application/index.tsx`: keep data handlers and modals, render `RedesignApplicationPage`.
- Modify `src/assets/locales/zh-CN.json`, `src/assets/locales/en-US.json`, `src/assets/locales/zh-TW.json`: add new application page strings.

## Task 1: Add Redesigned Application Workbench Component

**Files:**
- Create: `src/pages/application/redesign/index.tsx`

- [ ] **Step 1: Create the component module**

Create `src/pages/application/redesign/index.tsx` with these exported props and helpers:

```tsx
import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { Button, Dropdown, Empty, Modal, Spin, Tooltip } from 'antd';
import type { ItemType } from 'antd/es/menu/interface';
import type { ModalFunc } from 'antd/es/modal/confirm';
import { Trans, useTranslation } from 'react-i18next';
import { AppDetailModal } from '../component/AppDetailModal';
import { AppIcon } from '../component/AppIcon';
import { useLoading } from '@/hooks/useLoading';
import { VappApi } from '@/services/api/vapp';
import Actions from '@/utils/actions';
import { hasPermission } from '@/utils/permission';
import type {
  DeleteVappReq,
  ListVappItem,
  RemoveVappReq,
  VappCategory,
} from '@/services/api/vapp/types';
import type { ConnectVappReq } from '@/services/invoke/vapp/types';
import type { DefaultOptionType } from 'antd/es/select';
import './index.scss';

export interface RedesignApplicationPageProps {
  category: VappCategory | 'all';
  categories: DefaultOptionType[];
  dataSource: ListVappItem[];
  loading: boolean;
  onCategoryChange: (value: VappCategory | 'all') => Promise<void>;
  onRefresh: () => Promise<void>;
  onFavoriteApp: () => void;
  onCustomPublish: () => void;
  onRemoveApp: (params: RemoveVappReq) => Promise<void>;
  onDeleteApp: (params: DeleteVappReq) => Promise<void>;
  onVappItemClick: (params: ConnectVappReq) => Promise<void>;
}

const getResourceName = (app: ListVappItem) =>
  app.desktop?.name || app.desktop?.desktopPool?.name || '-';

const getPublishTypeKey = (app: ListVappItem) =>
  app.vapp.publishType === 'System'
    ? 'application_page.favorite_app'
    : 'application_page.custom_publish';
```

- [ ] **Step 2: Add page state and action handlers**

Inside `RedesignApplicationPage`, keep detail modal state local, and use a single `launchingId` so launch feedback is card-scoped:

```tsx
export const RedesignApplicationPage: FC<RedesignApplicationPageProps> = (props) => {
  const { t } = useTranslation();
  const [modal, contextHolder] = Modal.useModal();
  const deleteConfirmRef = useRef<ReturnType<ModalFunc>>(null);
  const [detailApp, setDetailApp] = useState<ListVappItem | null>(null);
  const [launchingId, setLaunchingId] = useState<number | null>(null);
  const operateAppLoading = useLoading([VappApi.DELETE_VAPP, VappApi.REMOVE_VAPP]);

  const selectedCategory = useMemo(
    () => props.categories.find((item) => item.value === props.category),
    [props.categories, props.category],
  );

  const getCategoryLabel = (app: ListVappItem) =>
    props.categories.find((item) => item.value === app.vapp.category)?.label || app.vapp.category;

  const launchApp = async (app: ListVappItem) => {
    setLaunchingId(app.id);
    await props
      .onVappItemClick({
        vappId: app.vapp.id,
        mId: app.id,
      })
      .finally(() => setLaunchingId(null));
  };

  useEffect(() => {
    if (deleteConfirmRef.current) {
      deleteConfirmRef.current.update({
        okButtonProps: {
          loading: operateAppLoading,
        },
      });
    }
  }, [operateAppLoading]);
```

- [ ] **Step 3: Add confirm and card menu behavior**

Still inside the component, add `confirmRemoveOrDelete` and `getMenuItems` so details and remove/delete keep the old confirmation behavior:

```tsx
  const confirmRemoveOrDelete = (app: ListVappItem) => {
    const isSystem = app.vapp.publishType === 'System';
    deleteConfirmRef.current = modal.confirm({
      centered: true,
      className: 'confirm-modal',
      title: isSystem
        ? t('application_page.cancel_favorite_app')
        : t('application_page.delete_app'),
      content: (
        <span>
          {isSystem
            ? t('application_page.confirm_cancel_favorite_app')
            : t('application_page.confirm_delete_app')}
          <span className="confirm-tag">{app.vapp.name}</span> ?
        </span>
      ),
      okText: isSystem ? t('application_page.cancel_favorite') : t('application_page.delete'),
      okButtonProps: {
        loading: operateAppLoading,
      },
      cancelText: t('application_page.close'),
      onOk: async () => {
        const params = { mIds: [String(app.id)], desktopIds: app.desktop?.id ? [app.desktop.id] : [] };
        if (isSystem) {
          await props.onRemoveApp(params);
          return;
        }
        await props.onDeleteApp(params);
      },
    });
  };

  const getMenuItems = (app: ListVappItem): ItemType[] => [
    {
      label: t('application_page.details'),
      key: 'details',
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        setDetailApp(app);
      },
    },
    {
      label:
        app.vapp.publishType === 'System'
          ? t('application_page.remove')
          : t('application_page.delete'),
      key: 'remove-or-delete',
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        confirmRemoveOrDelete(app);
      },
      danger: app.vapp.publishType !== 'System',
    },
  ];
```

- [ ] **Step 4: Add the JSX structure**

Return the approved workbench layout. Use permission checks around add actions and keep the tip text available:

```tsx
  return (
    <main className="redesign-application-page">
      <header className="redesign-application-page__toolbar">
        <div className="redesign-application-page__heading">
          <span>{t('application_page.workbench_eyebrow')}</span>
          <h1>{t('application_page.workbench_title')}</h1>
          <p>
            {t('application_page.workbench_summary', {
              count: props.dataSource.length,
              category: selectedCategory?.label || t('application_page.category_all'),
            })}
          </p>
        </div>
        <div className="redesign-application-page__actions">
          <Tooltip title={<Trans t={t} i18nKey="application_page.virtual_app_minimize_tip" />}>
            <Button icon={<i className="iconfont icon-c_question-s" />} aria-label={t('application_page.usage_tip')} />
          </Tooltip>
          <Button loading={props.loading} icon={<i className="iconfont icon-refresh" />} onClick={props.onRefresh}>
            {t('application_page.refresh')}
          </Button>
          {hasPermission([Actions.TerminalRWAppAddPrepare], (
            <Button onClick={props.onFavoriteApp}>{t('application_page.favorite_app')}</Button>
          ))}
          {hasPermission([Actions.TerminalRWAppAddCustom], (
            <Button type="primary" onClick={props.onCustomPublish}>{t('application_page.custom_publish')}</Button>
          ))}
        </div>
      </header>

      <nav className="redesign-application-page__filters" aria-label={t('application_page.category')}>
        {props.categories.map((item) => (
          <button
            key={String(item.value)}
            className={item.value === props.category ? 'is-active' : ''}
            type="button"
            onClick={() => props.onCategoryChange(item.value as VappCategory | 'all')}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <Spin spinning={props.loading}>
        {props.dataSource.length === 0 ? (
          <section className="redesign-application-page__empty">
            <Empty description={t('application_page.empty_title')} />
            <p>{t('application_page.empty_description')}</p>
          </section>
        ) : (
          <section className="redesign-application-page__grid">
            {props.dataSource.map((app) => (
              <article className="redesign-application-card" key={app.id}>
                <button className="redesign-application-card__main" type="button" onClick={() => launchApp(app)}>
                  <AppIcon appIconUrl={app.vapp.appIconUrl} appId={app.id} />
                  <span className="redesign-application-card__name" title={app.vapp.name}>{app.vapp.name}</span>
                  <span className="redesign-application-card__resource" title={getResourceName(app)}>
                    {getResourceName(app)}
                  </span>
                </button>
                <div className="redesign-application-card__meta">
                  <span>{getCategoryLabel(app)}</span>
                  <span>{t(app.vapp.mode === 'Exclusive' ? 'application_page.mode_exclusive' : 'application_page.mode_shared')}</span>
                  <span>{t(getPublishTypeKey(app))}</span>
                </div>
                <div className="redesign-application-card__footer">
                  <Button type="primary" loading={launchingId === app.id} onClick={() => launchApp(app)}>
                    {t('application_page.launch')}
                  </Button>
                  <Dropdown menu={{ items: getMenuItems(app) }} trigger={['click']}>
                    <Button aria-label={t('application_page.more_actions')} icon={<i className="iconfont icon-more" />} />
                  </Dropdown>
                </div>
              </article>
            ))}
          </section>
        )}
      </Spin>

      {detailApp && (
        <AppDetailModal visible={!!detailApp} app={detailApp} setVisible={() => setDetailApp(null)} />
      )}
      {contextHolder}
    </main>
  );
};
```

- [ ] **Step 5: Add required stylesheet and locale keys**

Create `src/pages/application/redesign/index.scss` with the module root so the SCSS import resolves before Task 3 adds full styling:

```scss
.redesign-application-page {
  height: 100%;
  min-height: 0;
}
```

Add these keys to `src/assets/locales/zh-CN.json` near the existing `application_page.*` keys:

```json
"application_page.workbench_eyebrow": "虚拟应用",
"application_page.workbench_title": "应用工作台",
"application_page.workbench_summary": "当前分类：{{category}}，共 {{count}} 个应用",
"application_page.refresh": "刷新",
"application_page.usage_tip": "使用提示",
"application_page.launch": "连接",
"application_page.more_actions": "更多操作",
"application_page.empty_title": "暂无应用",
"application_page.empty_description": "当前分类下没有可用应用，可收藏系统应用或发布自定义应用。"
```

Add these keys to `src/assets/locales/en-US.json`:

```json
"application_page.workbench_eyebrow": "Virtual Apps",
"application_page.workbench_title": "Application Workbench",
"application_page.workbench_summary": "Current category: {{category}}, {{count}} apps",
"application_page.refresh": "Refresh",
"application_page.usage_tip": "Usage tip",
"application_page.launch": "Connect",
"application_page.more_actions": "More actions",
"application_page.empty_title": "No apps",
"application_page.empty_description": "No apps are available in the current category. Favorite a system app or publish a custom app."
```

Add these keys to `src/assets/locales/zh-TW.json`:

```json
"application_page.workbench_eyebrow": "虛擬應用",
"application_page.workbench_title": "應用工作台",
"application_page.workbench_summary": "當前分類：{{category}}，共 {{count}} 個應用",
"application_page.refresh": "刷新",
"application_page.usage_tip": "使用提示",
"application_page.launch": "連接",
"application_page.more_actions": "更多操作",
"application_page.empty_title": "暫無應用",
"application_page.empty_description": "當前分類下沒有可用應用，可收藏系統應用或發布自定義應用。"
```

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add src/pages/application/redesign/index.tsx src/pages/application/redesign/index.scss src/assets/locales/zh-CN.json src/assets/locales/en-US.json src/assets/locales/zh-TW.json
git commit -m "Add redesigned application workbench"
```

Expected: one commit containing the new component, baseline stylesheet, and required i18n strings.

## Task 2: Wire the Existing Application Container

**Files:**
- Modify: `src/pages/application/index.tsx`

- [ ] **Step 1: Replace legacy presentation imports**

Remove `Select`, `Spin`, `Tooltip`, `Trans`, and `VirtualApp` imports. Add:

```tsx
import { RedesignApplicationPage } from './redesign';
```

- [ ] **Step 2: Add a refresh handler with stable signature**

Keep `getListVapp` unchanged except for using strict equality. Add:

```tsx
  const handleRefresh = async () => {
    await getListVapp(category);
  };
```

- [ ] **Step 3: Render the redesigned page**

Replace the old `.application-wrapper` body with:

```tsx
  return (
    <>
      <RedesignApplicationPage
        category={category}
        categories={appCategoryList}
        dataSource={vappList}
        loading={listVappLoading}
        onCategoryChange={handleChangeCategory}
        onRefresh={handleRefresh}
        onCustomPublish={handleCustomPublish}
        onFavoriteApp={handleFavoriteApp}
        onDeleteApp={handleDeleteApp}
        onRemoveApp={handleRemoveApp}
        onVappItemClick={handleVappItemClick}
      />
      <AddFromSysModal
        visible={addFormSysVisible}
        setVisible={setAddFromSysVisible}
        OnRefresh={getListVapp}
      />
      <AddFromSelfModal
        visible={addFormSelfVisible}
        setVisible={setAddFromSelfVisible}
        OnRefresh={getListVapp}
      />
    </>
  );
```

- [ ] **Step 4: Run TypeScript and lint**

Run:

```bash
pnpm run lint
```

Expected: command exits with code 0. Fix TypeScript errors in `src/pages/application/index.tsx` or `src/pages/application/redesign/index.tsx` before continuing.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add src/pages/application/index.tsx src/pages/application/redesign/index.tsx
git commit -m "Wire redesigned application page"
```

Expected: one commit wiring the new component without changing modal internals.

## Task 3: Add Scoped Styling, Themes, and Responsive Layout

**Files:**
- Modify: `src/pages/application/redesign/index.scss`

- [ ] **Step 1: Add the workbench surface styles**

Create `src/pages/application/redesign/index.scss` with scoped classes under `.redesign-application-page`. Start with:

```scss
.redesign-application-page {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 14px;
  color: var(--vd-color-text, #eef5ef);
}

.redesign-application-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--vd-color-border, rgba(209, 255, 229, 0.12));
  border-radius: 10px;
  background: rgba(10, 14, 13, 0.58);
}

.redesign-application-page__heading {
  min-width: 0;

  span {
    color: var(--vd-color-accent, #8ef2bd);
    font-size: 11px;
    font-weight: 700;
  }

  h1 {
    margin: 4px 0;
    color: var(--vd-color-text, #eef5ef);
    font-size: 22px;
    font-weight: 650;
    line-height: 1.2;
  }

  p {
    margin: 0;
    color: var(--vd-color-muted, #8f9c94);
    font-size: 13px;
  }
}
```

- [ ] **Step 2: Add filters and grid styles**

Append:

```scss
.redesign-application-page__filters {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;

  button {
    min-height: 34px;
    flex: 0 0 auto;
    border: 1px solid rgba(209, 255, 229, 0.1);
    border-radius: 8px;
    padding: 0 12px;
    color: var(--vd-color-muted, #8f9c94);
    background: rgba(255, 255, 255, 0.04);
    cursor: pointer;
  }

  button.is-active {
    border-color: rgba(142, 242, 189, 0.45);
    color: var(--vd-color-accent, #8ef2bd);
    background: rgba(142, 242, 189, 0.12);
  }
}

.redesign-application-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
  min-height: 0;
  overflow: auto;
  padding: 2px 2px 16px;
}
```

- [ ] **Step 3: Add card and responsive styles**

Append card styles with stable heights and no nested cards:

```scss
.redesign-application-card {
  min-height: 196px;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto auto;
  gap: 12px;
  border: 1px solid rgba(149, 178, 194, 0.16);
  border-radius: 8px;
  padding: 14px;
  background:
    linear-gradient(180deg, rgba(20, 35, 45, 0.94), rgba(11, 22, 30, 0.95)),
    radial-gradient(circle at 18% 12%, rgba(69, 133, 147, 0.24), transparent 36%);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.26);
}

.redesign-application-card__main {
  min-width: 0;
  border: 0;
  padding: 0;
  color: inherit;
  text-align: left;
  background: transparent;
  cursor: pointer;
}

.redesign-application-card__name,
.redesign-application-card__resource {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.redesign-application-card__name {
  margin-top: 12px;
  color: #f6fbff;
  font-size: 15px;
  font-weight: 700;
}

.redesign-application-card__resource {
  margin-top: 4px;
  color: var(--vd-color-muted, #8f9c94);
  font-size: 12px;
}

.redesign-application-card__meta,
.redesign-application-card__footer,
.redesign-application-page__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.redesign-application-card__meta {
  flex-wrap: wrap;

  span {
    max-width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.16);
    border-radius: 6px;
    padding: 3px 7px;
    color: #a9bacb;
    font-size: 11px;
  }
}

.redesign-application-card__footer {
  justify-content: space-between;
}

.redesign-application-page__empty {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(148, 163, 184, 0.24);
  border-radius: 8px;
  background: rgba(9, 19, 26, 0.68);
  color: var(--vd-color-muted, #8f9c94);
}

@media (max-width: 920px) {
  .redesign-application-page__toolbar {
    flex-direction: column;
  }

  .redesign-application-page__actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
```

- [ ] **Step 4: Run visual syntax verification**

Run:

```bash
pnpm run lint
```

Expected: command exits with code 0.

- [ ] **Step 5: Commit Task 3**

Run:

```bash
git add src/pages/application/redesign/index.scss src/pages/application/redesign/index.tsx
git commit -m "Style redesigned application workbench"
```

Expected: one commit containing scoped styles and the SCSS import already present from Task 1.

## Task 4: Final Behavior Polish

**Files:**
- Modify: `src/pages/application/redesign/index.tsx`

- [ ] **Step 1: Confirm category labels come from options**

In `src/pages/application/redesign/index.tsx`, confirm the card meta uses category option labels rather than computed translation keys:

```tsx
  const getCategoryLabel = (app: ListVappItem) =>
    props.categories.find((item) => item.value === app.vapp.category)?.label || app.vapp.category;
```

Use it in card meta:

```tsx
<span>{getCategoryLabel(app)}</span>
```

- [ ] **Step 2: Confirm destructive app actions use the confirm modal**

Confirm remove/delete menu items call `confirmRemoveOrDelete(app)` and do not call `props.onRemoveApp` or `props.onDeleteApp` directly from menu item handlers:

```tsx
onClick: ({ domEvent }) => {
  domEvent.stopPropagation();
  confirmRemoveOrDelete(app);
}
```

- [ ] **Step 3: Run i18n generation through lint**

Run:

```bash
pnpm run lint
```

Expected: command exits with code 0 and generated i18n types remain consistent.

- [ ] **Step 4: Commit Task 4 fixes**

Run:

```bash
git add src/pages/application/redesign/index.tsx
git commit -m "Polish application workbench behavior"
```

Expected: no commit is created when Task 1 already introduced the correct category and confirm behavior.

## Task 5: End-to-End Verification

**Files:**
- Verify: `src/pages/application/index.tsx`
- Verify: `src/pages/application/redesign/index.tsx`
- Verify: `src/pages/application/redesign/index.scss`
- Verify: `src/assets/locales/zh-CN.json`
- Verify: `src/assets/locales/en-US.json`
- Verify: `src/assets/locales/zh-TW.json`

- [ ] **Step 1: Run lint**

Run:

```bash
pnpm run lint
```

Expected: exit code 0.

- [ ] **Step 2: Run production build**

Run:

```bash
pnpm run build
```

Expected: exit code 0. Existing Vite chunk-size warnings are acceptable; TypeScript, ESLint, and build errors are not acceptable.

- [ ] **Step 3: Run whitespace check**

Run:

```bash
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 4: Browser smoke the application route**

Run the dev server:

```bash
pnpm run dev -- --host 127.0.0.1
```

Open `/app/application` and verify:

- The route renders `.redesign-application-page`.
- Category buttons do not clip in Chinese or English.
- The refresh button calls the existing list request.
- Add-from-system and custom-publish modals still open.
- Details modal still opens from the card menu.
- The assistant panel remains collapsible from the Phase 3 shell.

- [ ] **Step 5: Commit final fixes**

When verification produces fixes, commit them with:

```bash
git add src/pages/application src/assets/locales
git commit -m "Fix application workbench verification issues"
```

Expected: no commit is created when there are no fixes after Task 4.
