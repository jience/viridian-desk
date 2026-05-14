# Frontend Redesign Phase 3A+3B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the default logged-in three-column workspace shell and a redesigned desktop resource workspace while preserving existing desktop behavior and rollback paths.

**Architecture:** Add a Phase 3 app-shell feature flag and route `/app/*` through a new `RedesignAppLayout` by default. Keep the legacy `BasicLayout` and legacy desk pages reachable under `/legacy-app/*` until the final post-Phase-3 cleanup. Implement the desktop redesign as new page modules that reuse existing hooks and action handlers instead of changing service contracts.

**Tech Stack:** React 19, React Router 7, Redux selectors, AntD 6 for existing modals/forms/popovers, existing iconfont assets, SCSS, shared `src/styles/redesign.css` primitives, existing `react-intl` and `react-i18next` setup.

---

### Task 1: Add Phase 3 App Routing And Rollback

**Files:**
- Create: `src/features/redesign-app/enabled.ts`
- Modify: `src/router/index.tsx`

- [ ] **Step 1: Create the app-shell feature flag**

Create `src/features/redesign-app/enabled.ts`:

```ts
type RedesignAppEnv = ImportMetaEnv & {
  readonly VITE_ENABLE_REDESIGN_APP?: string;
};

const explicitOffValues = new Set(['false', '0', 'off', 'no']);
const flagValue = (import.meta.env as RedesignAppEnv).VITE_ENABLE_REDESIGN_APP;

export const isRedesignAppEnabled = !explicitOffValues.has(
  String(flagValue ?? '')
    .trim()
    .toLowerCase(),
);
```

- [ ] **Step 2: Add active app imports and legacy path rewriting**

In `src/router/index.tsx`, add imports:

```ts
import { isRedesignAppEnabled } from '@/features/redesign-app/enabled';
import { RedesignAppLayout } from '@/layouts/RedesignAppLayout';
import { Component as RedesignDesk } from '@/pages/desk/redesign';
import { Component as RedesignDeskDetail } from '@/pages/deskDetail/redesign';
```

Add constants near the existing auth route constants:

```ts
const ActiveAppLayout = isRedesignAppEnabled ? RedesignAppLayout : BasicLayout;
const ActiveDesk = isRedesignAppEnabled ? RedesignDesk : Desk;
const ActiveDeskDetail = isRedesignAppEnabled ? RedesignDeskDetail : DeskDetail;
const appPathPattern = /^\/app(?=\/|$)/;

const rewriteLegacyAppPath = (to: To): To => {
  if (typeof to === 'string') {
    return to.replace(appPathPattern, '/legacy-app');
  }

  if (to.pathname) {
    return {
      ...to,
      pathname: to.pathname.replace(appPathPattern, '/legacy-app'),
    };
  }

  return to;
};
```

- [ ] **Step 3: Add a legacy app route wrapper**

Add this component below `LegacyConfigPageRoute` in `src/router/index.tsx`:

```tsx
// eslint-disable-next-line react-refresh/only-export-components
function LegacyAppRoute() {
  const dataRouterContext = useContext(UNSAFE_DataRouterContext);
  const navigationContext = useContext(UNSAFE_NavigationContext);

  const legacyDataRouterContext = useMemo(() => {
    if (!dataRouterContext) return dataRouterContext;

    const { router } = dataRouterContext;
    const legacyRouter = Object.create(router) as typeof router;

    legacyRouter.navigate = (async (
      to: number | To | null,
      opts?: RouterNavigateOptions,
    ): Promise<void> => {
      if (typeof to === 'number') {
        await router.navigate(to);
        return;
      }

      await router.navigate(to === null ? to : rewriteLegacyAppPath(to), opts);
    }) as typeof router.navigate;

    return {
      ...dataRouterContext,
      router: legacyRouter,
    };
  }, [dataRouterContext]);

  const legacyNavigationContext = useMemo(() => {
    const { navigator } = navigationContext;
    const legacyNavigator: RouterNavigator = {
      ...navigator,
      push: (to: To, state?: unknown, opts?: NavigateOptions) => {
        navigator.push(rewriteLegacyAppPath(to), state, opts);
      },
      replace: (to: To, state?: unknown, opts?: NavigateOptions) => {
        navigator.replace(rewriteLegacyAppPath(to), state, opts);
      },
    };

    return {
      ...navigationContext,
      navigator: legacyNavigator,
    };
  }, [navigationContext]);

  return (
    <UNSAFE_DataRouterContext.Provider value={legacyDataRouterContext}>
      <UNSAFE_NavigationContext.Provider value={legacyNavigationContext}>
        <BasicLayout />
      </UNSAFE_NavigationContext.Provider>
    </UNSAFE_DataRouterContext.Provider>
  );
}
```

- [ ] **Step 4: Extract app child routes**

Add this helper in `src/router/index.tsx` after `LegacyAppRoute` and before the `rootRoutes` declaration:

```tsx
const createAppRoutes = ({
  desk,
  deskDetail,
}: {
  desk: RouteObject['element'];
  deskDetail: RouteObject['element'];
}): RouteObject[] => [
  {
    path: 'desk',
    element: desk,
  },
  {
    path: 'application',
    element: <Application />,
  },
  {
    path: 'deskDetail',
    element: deskDetail,
  },
  {
    path: 'peripheral',
    element: <PeripheralSetting />,
  },
  {
    path: 'malfunction',
    element: <Malfunction />,
  },
  {
    path: 'approval',
    element: <Approval />,
  },
];
```

- [ ] **Step 5: Wire active and legacy app routes**

Replace the current `path: 'app'` route with:

```tsx
{
  path: 'app',
  element: <ActiveAppLayout />,
  children: createAppRoutes({
    desk: <ActiveDesk />,
    deskDetail: <ActiveDeskDetail />,
  }),
},
{
  path: 'legacy-app',
  element: <LegacyAppRoute />,
  children: createAppRoutes({
    desk: <Desk />,
    deskDetail: <DeskDetail />,
  }),
},
```

- [ ] **Step 6: Verify route compile**

Run:

```bash
pnpm run lint
```

Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/features/redesign-app/enabled.ts src/router/index.tsx
git commit -m "Wire redesigned app routes"
```

---

### Task 2: Build The Redesigned Logged-In App Shell

**Files:**
- Create: `src/layouts/RedesignAppLayout/index.tsx`
- Create: `src/layouts/RedesignAppLayout/index.scss`
- Modify: `src/styles/redesign.css`

- [ ] **Step 1: Create the shell layout component**

Create `src/layouts/RedesignAppLayout/index.tsx`:

```tsx
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';
import Sidebar from '@/components/Sidebar';
import { GatewaySelect } from '@/components/GatewaySelect';
import { AssistantPanel } from '@/ui/assistant/assistant-panel';
import { Button } from '@/ui/components/button';
import { AppShell, type AssistantState } from '@/ui/shell/app-shell';
import '@/styles/redesign.css';
import './index.scss';

const routeTitleIds: Array<{ match: string; titleId: string; fallback: string }> = [
  { match: '/app/deskDetail', titleId: 'DETAIL', fallback: 'Detail' },
  { match: '/app/desk', titleId: 'DESK', fallback: 'Desktop' },
  { match: '/app/application', titleId: 'application_page.favorite_app', fallback: 'Applications' },
  { match: '/app/peripheral', titleId: 'PERIPHERAL', fallback: 'Peripheral' },
  { match: '/app/approval', titleId: 'APPROVAL', fallback: 'Approval' },
  { match: '/app/malfunction', titleId: 'DesktopIssues', fallback: 'Faults' },
];

export function RedesignAppLayout() {
  const intl = useIntl();
  const { t: assistantT } = useTranslation('assistant');
  const { t: commonT } = useTranslation('common');
  const location = useLocation();
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);

  const routeMeta = useMemo(() => {
    return (
      routeTitleIds.find((item) => location.pathname.startsWith(item.match)) ?? routeTitleIds[1]
    );
  }, [location.pathname]);

  const assistantState: AssistantState = assistantCollapsed ? 'collapsed' : 'expanded';

  return (
    <div className="redesign-app-layout">
      <AppShell
        assistant={
          <AssistantPanel
            collapsed={assistantCollapsed}
            onToggle={() => setAssistantCollapsed((current) => !current)}
          />
        }
        assistantState={assistantState}
        nav={<Sidebar />}
        userMenu={null}
      >
        <section className="redesign-app-layout__workspace">
          <header className="redesign-app-layout__header">
            <div>
              <p className="redesign-app-layout__eyebrow">Viridian Desk</p>
              <h1 className="redesign-app-layout__title">
                {intl.formatMessage({ id: routeMeta.titleId, defaultMessage: routeMeta.fallback })}
              </h1>
            </div>
            <Button
              aria-pressed={!assistantCollapsed}
              onClick={() => setAssistantCollapsed((current) => !current)}
              size="sm"
              variant="secondary"
            >
              {assistantCollapsed ? assistantT('title') : commonT('actions.close')}
            </Button>
          </header>

          <main className="redesign-app-layout__content">
            <Outlet />
          </main>

          <footer className="redesign-app-layout__footer">
            <GatewaySelect readonly />
          </footer>
        </section>
      </AppShell>
    </div>
  );
}
```

- [ ] **Step 2: Add the shell SCSS**

Create `src/layouts/RedesignAppLayout/index.scss`:

```scss
.redesign-app-layout {
  --vd-color-bg: #101513;
  --vd-color-panel: #151b19;
  --vd-color-panel-subtle: #202925;
  --vd-color-rail: #0a0e0d;
  --vd-color-text: #eef5ef;
  --vd-color-muted: #8f9c94;
  --vd-color-border: rgba(209, 255, 229, 0.12);
  --vd-color-accent: #8ef2bd;
  --vd-shadow-window: 0 30px 90px rgba(0, 0, 0, 0.42);

  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 18% 12%, rgba(142, 242, 189, 0.1), transparent 30%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0 1px, transparent 1px),
    var(--vd-color-bg);
  background-size: auto, 28px 28px, auto;
  color: var(--vd-color-text);

  .vd-app-shell {
    background: transparent;
  }

  .vd-app-shell__rail {
    padding: 0;
  }

  .sidebar {
    width: 100%;
    background: var(--vd-color-rail);
  }

  .sidebar .menus,
  .sidebar .user-info {
    width: 100%;
    padding: 10px 0;
  }

  .sidebar .menus .menu-item,
  .sidebar .user-info li {
    border: 1px solid transparent;
    background: transparent;
    color: var(--vd-color-muted);
    transition:
      transform 160ms ease,
      border-color 160ms ease,
      background-color 160ms ease,
      color 160ms ease;
  }

  .sidebar .menus .menu-item:hover,
  .sidebar .user-info li:hover {
    border-color: rgba(142, 242, 189, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: var(--vd-color-text);
  }

  .sidebar .menus .menu-item.active {
    border-color: rgba(142, 242, 189, 0.42);
    background: rgba(142, 242, 189, 0.16);
    box-shadow: none;
  }

  .sidebar .menus .menu-item.active i {
    color: var(--vd-color-accent);
  }
}

.redesign-app-layout__workspace {
  display: grid;
  min-width: 0;
  height: 100%;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 14px;
}

.redesign-app-layout__header {
  display: flex;
  min-height: 58px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid rgba(209, 255, 229, 0.1);
  padding-bottom: 14px;
}

.redesign-app-layout__eyebrow {
  margin: 0 0 4px;
  color: var(--vd-color-accent);
  font-size: 11px;
  font-weight: 700;
}

.redesign-app-layout__title {
  margin: 0;
  color: var(--vd-color-text);
  font-size: 22px;
  line-height: 1.2;
}

.redesign-app-layout__content {
  min-height: 0;
  overflow: hidden;
}

.redesign-app-layout__footer {
  display: flex;
  min-height: 24px;
  align-items: center;
  justify-content: flex-end;
  color: var(--vd-color-muted);
}
```

- [ ] **Step 3: Harden shared app shell CSS**

In `src/styles/redesign.css`, update the app-shell section:

```css
.vd-app-shell {
  display: grid;
  height: 100%;
  min-height: 0;
  background: var(--vd-color-bg);
  color: var(--vd-color-text);
  transition: grid-template-columns 180ms ease;
}

.vd-app-shell--assistant-expanded {
  grid-template-columns: 68px minmax(0, 1fr) 304px;
}

.vd-app-shell--assistant-collapsed {
  grid-template-columns: 68px minmax(0, 1fr) 58px;
}

.vd-app-shell__main {
  min-width: 0;
  overflow: hidden;
  padding: 18px 20px 14px;
}

.vd-app-shell__assistant {
  min-width: 0;
  border-left: 1px solid var(--vd-color-border);
  background: rgba(17, 22, 21, 0.86);
}

@media (max-width: 1080px) {
  .vd-app-shell--assistant-expanded {
    grid-template-columns: 68px minmax(0, 1fr) 58px;
  }
}
```

- [ ] **Step 4: Verify shell compile**

Run:

```bash
pnpm run lint
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/RedesignAppLayout/index.tsx src/layouts/RedesignAppLayout/index.scss src/styles/redesign.css
git commit -m "Add redesigned logged-in app shell"
```

---

### Task 3: Upgrade The Assistant MVP Panel

**Files:**
- Modify: `src/ui/assistant/assistant-panel.tsx`
- Modify: `src/styles/redesign.css`

- [ ] **Step 1: Replace the assistant panel content with workflow actions**

Update `src/ui/assistant/assistant-panel.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/components/button';

interface AssistantPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const workflowItems = [
  { key: 'quick.connectionHelp', icon: 'icon-net' },
  { key: 'quick.openLogs', icon: 'icon-log' },
  { key: 'quick.reportFault', icon: 'icon-fault' },
] as const;

export function AssistantPanel({ collapsed = false, onToggle }: AssistantPanelProps) {
  const { t } = useTranslation('assistant');
  const { t: commonT } = useTranslation('common');

  if (collapsed) {
    return (
      <div className="vd-assistant-panel vd-assistant-panel--collapsed">
        <Button aria-label={t('title')} onClick={onToggle} size="sm" variant="secondary">
          <i className="iconfont icon-c_question-s" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <div className="vd-assistant-panel">
      <div className="vd-assistant-panel__header">
        <span className="vd-assistant-panel__label">{t('title')}</span>
        <h2 className="vd-assistant-panel__title">{t('title')}</h2>
        <p className="vd-assistant-panel__subtitle">{t('subtitle')}</p>
      </div>

      <div className="vd-assistant-panel__quick-list">
        {workflowItems.map((item) => (
          <button className="vd-assistant-panel__quick-item" key={item.key} type="button">
            <i className={`iconfont ${item.icon}`} aria-hidden="true" />
            <span>{t(item.key)}</span>
          </button>
        ))}
      </div>

      <div className="vd-assistant-panel__note">
        <span className="vd-assistant-panel__status-dot" />
        <span>{commonT('status.online')}</span>
      </div>

      <div className="vd-assistant-panel__spacer" />
      <Button onClick={onToggle} size="sm" variant="secondary">
        {commonT('actions.close')}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Update assistant styles**

In `src/styles/redesign.css`, replace the assistant panel block with:

```css
.vd-assistant-panel {
  display: grid;
  height: 100%;
  grid-template-rows: auto auto auto 1fr auto;
  gap: 16px;
  padding: 16px;
}

.vd-assistant-panel--collapsed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
}

.vd-assistant-panel__label {
  color: var(--vd-color-accent);
  font-size: 11px;
  font-weight: 700;
}

.vd-assistant-panel__title {
  margin: 6px 0 0;
  color: var(--vd-color-text);
  font-size: 18px;
  font-weight: 700;
}

.vd-assistant-panel__subtitle {
  margin: 6px 0 0;
  color: var(--vd-color-muted);
  font-size: 12px;
  line-height: 20px;
}

.vd-assistant-panel__quick-list {
  display: grid;
  gap: 8px;
  font-size: 12px;
}

.vd-assistant-panel__quick-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--vd-color-border);
  border-radius: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--vd-color-text);
  cursor: pointer;
  text-align: left;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease;
}

.vd-assistant-panel__quick-item:hover {
  border-color: rgba(142, 242, 189, 0.26);
  background: rgba(142, 242, 189, 0.1);
}

.vd-assistant-panel__quick-item:active {
  transform: translateY(1px);
}

.vd-assistant-panel__note {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--vd-color-muted);
  font-size: 12px;
}

.vd-assistant-panel__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--vd-color-accent);
}
```

- [ ] **Step 3: Verify assistant compile**

Run:

```bash
pnpm run lint
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/ui/assistant/assistant-panel.tsx src/styles/redesign.css
git commit -m "Add workflow assistant panel"
```

---

### Task 4: Add The Redesigned Desktop Resource Page

**Files:**
- Create: `src/pages/desk/redesign/index.tsx`
- Create: `src/pages/desk/redesign/index.scss`

- [ ] **Step 1: Create the redesigned desktop page component**

Create `src/pages/desk/redesign/index.tsx`. It should keep imports from the legacy page where behavior is reused:

```tsx
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { Button, Dropdown, Empty, Modal, Popover, Spin, Tooltip, message } from 'antd';
import { listen } from '@tauri-apps/api/event';
import { get } from 'lodash-es';
import ActionAuth from '@/utils/actionAuth';
import Actions from '@/utils/actions';
import { DESK_STATUS } from '@/utils/constant';
import { transIcon } from '@/utils/utils';
import DeskLoading from '@/components/DeskLoading';
import Open from '@/components/Opensvg';
import Close from '@/components/Closesvg';
import Deskpool from '@/components/Deskpoolsvg';
import useRequest from '@/hooks/useRequest';
import { detachVolume } from '@/services/resource';
import { killAllHdpViewers } from '@/services/invoke/shell';
import { useAppSelector } from '@/store';
import { selectFullScreen } from '@/store/feature/config';
import useDeskHooks from '../useDeskHooks';
import InUseLoading from '../components/loading';
import DeskPoolModal from '../components/deskPoolDetail';
import './index.scss';

const AuthButton = ActionAuth(Button);
const AuthDropDown = ActionAuth(Dropdown);

export function Component() {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const isFullScreen = useAppSelector(selectFullScreen);
  const [poolDetailVisible, setPoolDetailVisible] = useState(false);
  const [_attachIds, setAttachIds] = useState({
    desktopId: '',
    iaasId: '',
    storageType: '',
    hostName: '',
    encrypt: false,
  });

  const {
    transStatus,
    deskData,
    deskPoolData,
    generateMenus,
    shutDownDesktop,
    restartDesk,
    isLoadingDesk,
    setIsLoadingDesk,
    enterDesk,
    createDeskFromDeskPool,
    checkDeskPoolItem,
    setCheckDeskPoolItem,
    getDeskPoolDetail,
    getDeskList,
    getDeskPoolList,
    deskLoading,
    deskPoolLoading,
    transType,
    listResourceUserRefresh,
    listDesktopPoolRefresh,
    loadingDeskText,
  } = useDeskHooks({ isFullScreen });

  useEffect(() => {
    let unListenConnect: (() => void) | null = null;
    let unListenDesktopList: (() => void) | null = null;
    let unListenDesktopIdleDisconnect: (() => void) | null = null;
    let unListenDesktopIdleClose: (() => void) | null = null;

    const setupListeners = async () => {
      unListenConnect = await listen('desktop-connect', () => {
        setIsLoadingDesk(false);
      });

      unListenDesktopList = await listen('desktop-list', () => {
        listResourceUserRefresh();
        listDesktopPoolRefresh();
      });

      unListenDesktopIdleDisconnect = await listen('desktop-idle-disconnect', async () => {
        await killAllHdpViewers();
        message.warning('用户闲置策略生效，断开桌面连接');
      });

      unListenDesktopIdleClose = await listen('desktop-idle-close', async () => {
        message.warning('用户闲置策略生效，关闭桌面');
      });
    };

    setupListeners();

    return () => {
      if (unListenConnect) unListenConnect();
      if (unListenDesktopList) unListenDesktopList();
      if (unListenDesktopIdleDisconnect) unListenDesktopIdleDisconnect();
      if (unListenDesktopIdleClose) unListenDesktopIdleClose();
    };
  }, [listDesktopPoolRefresh, listResourceUserRefresh, setIsLoadingDesk]);

  const { run: detachVolumeRun } = useRequest(detachVolume, {
    manual: true,
    onSuccess: () => {
      getDeskList();
      getDeskPoolList();
    },
  });

  const handleDetach = (desk: any) => {
    Modal.confirm({
      title: (
        <span>
          <i className="iconfont icon-malfunction1 modal-confirm-icon" />
          {formatMessage({ id: 'DETACH_VOLUME_GATEWAY' })}
        </span>
      ),
      centered: true,
      className: 'confirm-modal',
      content: formatMessage({ id: 'DETACH_VOLUME_MSG' }),
      okText: formatMessage({ id: 'DETACH' }),
      cancelText: formatMessage({ id: 'CANCEL' }),
      onOk: () => {
        detachVolumeRun({
          desktopId: desk.id,
          iaasId: desk.iaas.id,
          volumeId: desk?.disks?.find((disk: any) => disk?.attribute === 'personal')?.id,
        });
      },
    });
  };

  const loading = deskLoading || deskPoolLoading;
  const hasDesktopData = (deskData?.length ?? 0) > 0;
  const hasPoolData = (deskPoolData?.length ?? 0) > 0;

  return (
    <div className="redesign-desk-page">
      <header className="redesign-desk-page__toolbar">
        <div>
          <p className="redesign-desk-page__eyebrow">{formatMessage({ id: 'DESK' })}</p>
          <h2>{formatMessage({ id: 'Desktop' })}</h2>
        </div>
        <Button
          icon={<i className="iconfont icon-refresh" />}
          loading={loading}
          onClick={() => {
            listResourceUserRefresh();
            listDesktopPoolRefresh();
          }}
        >
          {formatMessage({ id: 'REFRESH', defaultMessage: 'Refresh' })}
        </Button>
      </header>

      <Spin spinning={loading}>
        <div className="redesign-desk-page__scroll">
          {!hasDesktopData && !hasPoolData && !loading && (
            <div className="redesign-desk-page__empty">
              <Empty description={formatMessage({ id: 'TheUserHasNotAssignedADesktop' })} />
            </div>
          )}

          {hasDesktopData && (
            <section className="redesign-desk-page__section">
              <div className="redesign-desk-page__section-header">
                <h3>{formatMessage({ id: 'DESK' })}</h3>
                <span>{deskData.length}</span>
              </div>
              <div className="redesign-desk-page__grid">
                {deskData.map((item: any, index: number) => {
                  const isStopped = ['stop', 'stopretain'].includes(item?.status?.toLowerCase());
                  return (
                    <article
                      className={`redesign-desk-card desk-item-${index} ${
                        isStopped ? 'redesign-desk-card--disabled' : ''
                      }`}
                      key={index + item?.id}
                    >
                      <button
                        className="redesign-desk-card__body"
                        onClick={() => enterDesk(item)}
                        type="button"
                      >
                        <div className="redesign-desk-card__status-row">
                          <div className="redesign-desk-card__status">
                            {transStatus(item.status, item.isLock)}
                            {item?.sessionStatus == '1' && <InUseLoading />}
                          </div>
                          {item.isDefault && (
                            <span className="redesign-desk-card__default">
                              {formatMessage({ id: 'DEFAULT' })}
                            </span>
                          )}
                        </div>
                        <div className="redesign-desk-card__os">
                          {item.status.toLowerCase() === 'stop' ? (
                            <span className="redesign-desk-card__os-backdrop">
                              <Close />
                            </span>
                          ) : (
                            <Open />
                          )}
                          {transIcon(item.image?.os || item.os)}
                        </div>
                        <Tooltip title={item.name}>
                          <div className="redesign-desk-card__name">
                            <span>{item.name}</span>
                            {transType(item.desktopPool)}
                          </div>
                        </Tooltip>
                      </button>

                      <div className="redesign-desk-card__actions">
                        <Popover content={formatMessage({ id: 'ConnectDesktop' })}>
                          <Button
                            icon={<i className="iconfont icon-boot" />}
                            onClick={() => enterDesk(item)}
                            type="text"
                          />
                        </Popover>
                        <Popover content={formatMessage({ id: 'RESTART' })}>
                          <AuthButton
                            actions={[Actions.TerminalRWDesktopForceReboot]}
                            disabled={item.status !== DESK_STATUS.START || item.isLock}
                            icon={<i className="iconfont icon-reboot" />}
                            onClick={() => restartDesk(item, false)}
                            type="text"
                          />
                        </Popover>
                        <Popover content={formatMessage({ id: 'SHUT_DOWN' })}>
                          <AuthButton
                            actions={[Actions.TerminalRWDesktopShutdown]}
                            disabled={item.status !== DESK_STATUS.START || item.isLock}
                            icon={<i className="iconfont icon-shutdown" />}
                            onClick={() => shutDownDesktop(item)}
                            type="text"
                          />
                        </Popover>
                        <Popover content={formatMessage({ id: 'DETAIL' })}>
                          <Button
                            disabled={item.status === DESK_STATUS.DELETING}
                            icon={<i className="iconfont icon-info-o" />}
                            onClick={() => navigate('/app/deskDetail', { state: { id: item.id } })}
                            type="text"
                          />
                        </Popover>
                        <AuthDropDown
                          actions={[
                            Actions.TerminalRWDesktopSetOrUnsetDefault,
                            Actions.TerminalRWDesktopAttachOrDetachPrivateDisk,
                          ]}
                          classNames={{ root: 'desk-more-menu' }}
                          getPopupContainer={() =>
                            document.querySelector(`.desk-item-${index}`) as HTMLElement
                          }
                          menu={generateMenus(item, [
                            {
                              actionId: 'PersonalDiskManagement',
                              action: (type: any, desktop: any) => {
                                if (type === 'mount') {
                                  const dataDisk = get(desktop, 'disks', []).filter(
                                    (disk: any) => disk.isSystem == false,
                                  ).length;
                                  if (
                                    dataDisk >= 2 &&
                                    desktop?.os?.includes('Windows Server 2000')
                                  ) {
                                    message.error({
                                      content:
                                        'Windows Server 2000 已挂满2个数据盘无法继续挂载个人盘',
                                    });
                                    return;
                                  }
                                  if (
                                    desktop?.os?.includes('Windows Server 2000') &&
                                    desktop.status !== DESK_STATUS.STOP
                                  ) {
                                    message.error({
                                      content:
                                        'Windows Server 2000 未关机，请先执行关机后再操作挂载个人盘',
                                    });
                                    return;
                                  }
                                  setAttachIds({
                                    desktopId: desktop.id,
                                    iaasId: desktop.iaas.id,
                                    storageType: desktop.storageType,
                                    hostName: desktop.hostName ? desktop.hostName : '',
                                    encrypt: desktop.encrypt,
                                  });
                                  return;
                                }
                                if (
                                  desktop?.os?.includes('Windows Server 2000') &&
                                  desktop.status !== DESK_STATUS.STOP
                                ) {
                                  message.error({
                                    content:
                                      'Windows Server 2000 未关机，请先执行关机后再操作卸载个人盘',
                                  });
                                  return;
                                }
                                handleDetach(desktop);
                              },
                            },
                          ])}
                          placement="bottomRight"
                          trigger={['click']}
                        >
                          <Button icon={<i className="iconfont icon-more" />} type="text" />
                        </AuthDropDown>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {hasPoolData && (
            <section className="redesign-desk-page__section">
              <div className="redesign-desk-page__section-header">
                <h3>{formatMessage({ id: 'CreateDeskFromDeskPool' })}</h3>
                <span>{deskPoolData.length}</span>
              </div>
              <div className="redesign-desk-page__pool-grid">
                {deskPoolData.map((item: any) => (
                  <article
                    className="redesign-desk-pool"
                    key={item.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      getDeskPoolDetail(item.id);
                      setPoolDetailVisible(true);
                    }}
                  >
                    <div className="redesign-desk-pool__os">
                      <Deskpool />
                      {transIcon(item?.os)}
                    </div>
                    <Tooltip title={item.name}>
                      <div className="redesign-desk-pool__name">
                        <span>{item.name}</span>
                        {transType(item)}
                      </div>
                    </Tooltip>
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        createDeskFromDeskPool(item);
                      }}
                    >
                      {formatMessage({ id: 'CreateDeskFromDeskPool' })}
                    </Button>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </Spin>

      {poolDetailVisible && checkDeskPoolItem && (
        <DeskPoolModal
          formatMessage={formatMessage}
          item={checkDeskPoolItem}
          setCheckDeskPoolItem={setCheckDeskPoolItem}
          setVisible={setPoolDetailVisible}
          transIcon={transIcon}
          visible={poolDetailVisible}
        />
      )}
      {isLoadingDesk ? <DeskLoading text={loadingDeskText} /> : null}
    </div>
  );
}
```

- [ ] **Step 2: Add the redesigned desktop SCSS**

Create `src/pages/desk/redesign/index.scss`:

```scss
.redesign-desk-page {
  display: grid;
  height: 100%;
  min-height: 0;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 14px;
}

.redesign-desk-page__toolbar,
.redesign-desk-page__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.redesign-desk-page__eyebrow {
  margin: 0 0 4px;
  color: var(--vd-color-accent);
  font-size: 11px;
  font-weight: 700;
}

.redesign-desk-page__toolbar h2,
.redesign-desk-page__section-header h3 {
  margin: 0;
  color: var(--vd-color-text);
}

.redesign-desk-page__scroll {
  height: 100%;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

.redesign-desk-page__section {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.redesign-desk-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.redesign-desk-page__pool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.redesign-desk-page__empty {
  display: grid;
  min-height: 280px;
  place-items: center;
  border: 1px solid var(--vd-color-border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
}

.redesign-desk-card,
.redesign-desk-pool {
  border: 1px solid var(--vd-color-border);
  border-radius: 14px;
  background: rgba(21, 27, 25, 0.82);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
}

.redesign-desk-card {
  overflow: hidden;
}

.redesign-desk-card__body {
  display: grid;
  width: 100%;
  gap: 10px;
  border: 0;
  padding: 14px;
  background: transparent;
  color: var(--vd-color-text);
  cursor: pointer;
  text-align: left;
}

.redesign-desk-card__status-row,
.redesign-desk-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.redesign-desk-card__status {
  display: inline-flex;
  min-height: 18px;
  align-items: center;
  gap: 6px;
}

.redesign-desk-card__default {
  border: 1px solid rgba(142, 242, 189, 0.28);
  border-radius: 8px;
  padding: 2px 6px;
  color: var(--vd-color-accent);
  font-size: 11px;
}

.redesign-desk-card__os,
.redesign-desk-pool__os {
  position: relative;
  display: grid;
  min-height: 62px;
  place-items: center;
  color: var(--vd-color-text);
}

.redesign-desk-card__os > svg,
.redesign-desk-pool__os > svg {
  width: 58px;
  height: 58px;
}

.redesign-desk-card__os i,
.redesign-desk-pool__os i {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  font-size: 26px;
}

.redesign-desk-card__os-backdrop {
  display: grid;
  place-items: center;
}

.redesign-desk-card__name,
.redesign-desk-pool__name {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--vd-color-text);
  font-size: 14px;
  font-weight: 700;
}

.redesign-desk-card__name span,
.redesign-desk-pool__name span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.redesign-desk-card__actions {
  border-top: 1px solid rgba(209, 255, 229, 0.08);
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
}

.redesign-desk-card__actions .ant-btn {
  color: var(--vd-color-muted);
}

.redesign-desk-card__actions .ant-btn:not(:disabled):hover {
  background: rgba(142, 242, 189, 0.12);
  color: var(--vd-color-accent);
}

.redesign-desk-card--disabled {
  opacity: 0.72;
}

.redesign-desk-pool {
  display: grid;
  gap: 10px;
  padding: 14px;
  cursor: pointer;
}

@media (max-width: 760px) {
  .redesign-desk-page__toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
```

- [ ] **Step 3: Verify desktop page compile**

Run:

```bash
pnpm run lint
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/pages/desk/redesign/index.tsx src/pages/desk/redesign/index.scss
git commit -m "Add redesigned desktop workspace"
```

---

### Task 5: Add The Redesigned Desktop Detail Bridge

**Files:**
- Create: `src/pages/deskDetail/redesign/index.tsx`
- Create: `src/pages/deskDetail/redesign/index.scss`

- [ ] **Step 1: Create the detail bridge component**

Create `src/pages/deskDetail/redesign/index.tsx`:

```tsx
import { Component as LegacyDeskDetail } from '..';
import './index.scss';

export function Component() {
  return (
    <div className="redesign-desk-detail-page">
      <LegacyDeskDetail />
    </div>
  );
}
```

- [ ] **Step 2: Add scoped detail bridge styles**

Create `src/pages/deskDetail/redesign/index.scss`:

```scss
.redesign-desk-detail-page {
  height: 100%;
  min-height: 0;
  overflow: hidden;

  .deskDetail {
    display: grid;
    height: 100%;
    min-height: 0;
    grid-template-rows: auto minmax(0, 1fr);
    padding-bottom: 0;
  }

  .deskDetail-content {
    min-height: 0;
  }

  .desk-detail-content,
  .SnapBox {
    border: 1px solid var(--vd-color-border);
    border-radius: 14px;
    background: rgba(21, 27, 25, 0.82);
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
  }

  .desk-detail-content .detail-title .name,
  .desk-detail-content .detail-title .deskType {
    color: var(--vd-color-text);
  }

  .SnapBox .title {
    color: var(--vd-color-text);
  }
}
```

- [ ] **Step 3: Verify detail bridge compile**

Run:

```bash
pnpm run lint
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/pages/deskDetail/redesign/index.tsx src/pages/deskDetail/redesign/index.scss
git commit -m "Add redesigned desktop detail bridge"
```

---

### Task 6: Browser Smoke Checks And Final Verification

**Files:**
- Modify only if smoke checks reveal concrete bugs.

- [ ] **Step 1: Run full static verification**

Run:

```bash
pnpm run lint
pnpm run build
git diff --check
```

Expected:
- `pnpm run lint`: exit 0.
- `pnpm run build`: exit 0 with only existing Vite dynamic import and chunk-size warnings.
- `git diff --check`: exit 0.

- [ ] **Step 2: Start Vite for smoke checks**

Run:

```bash
pnpm run dev -- --host 127.0.0.1
```

Expected: Vite reports a local URL on port `1420` or another available port.

- [ ] **Step 3: Smoke check new routes**

With `localStorage.noviceGuidance = 'true'`, verify:

```text
/app/desk
/app/application
/app/deskDetail
```

Expected:
- `/app/desk` renders `.redesign-app-layout` and `.redesign-desk-page`.
- `/app/application` renders `.redesign-app-layout` and the existing application page.
- `/app/deskDetail` renders `.redesign-app-layout` and `.redesign-desk-detail-page` when route state contains a desktop id; if direct entry has no state, document the existing route-state limitation and verify navigation from a desktop card.

- [ ] **Step 4: Smoke check rollback routes**

Verify:

```text
/legacy-app/desk
/legacy-app/application
```

Expected:
- Routes render `.basic-layout`.
- Navigation triggered inside legacy app pages stays under `/legacy-app/*` when it points to an `/app/*` path.

- [ ] **Step 5: Smoke check interactions**

Check:

```text
assistant expanded -> collapse -> expanded
left nav active state changes after route navigation
message icon opens existing message flow
user icon opens existing menu
logout still navigates to /login
gateway readonly footer is visible in new shell
desktop card connect/restart/shutdown/detail buttons are clickable and preserve disabled rules
```

Expected: no console errors from the redesign code paths. Native-only actions may show existing Tauri/browser limitations under Vite; record those as environment limitations, not UI failures.

- [ ] **Step 6: Stop dev server**

Stop the Vite process before finishing.

- [ ] **Step 7: Commit smoke fixes if needed**

If smoke checks required fixes:

```bash
git add <changed-files>
git commit -m "Polish redesigned workspace smoke issues"
```

If no fixes were needed, do not create an empty commit.

- [ ] **Step 8: Final status check**

Run:

```bash
git status --short --branch
git log --oneline --decorate -8
```

Expected:
- Worktree is clean.
- Recent commits include the Phase 3 route, shell, assistant, desktop workspace, and detail bridge commits.

---

## Self-Review

- Spec coverage: Tasks cover the default app-shell route, short-term rollback, persistent three-column layout, collapsible assistant MVP, desktop resource cards, desktop pool section, desktop detail shell integration, loading/empty/disabled states, and verification.
- Completeness scan: Every listed implementation step has concrete files, code, commands, and expected results. Phase 3C/3D pages are intentionally out of scope for this Phase 3A+3B plan.
- Type consistency: Route symbols use `RedesignAppLayout`, `RedesignDesk`, and `RedesignDeskDetail`; the feature flag is `isRedesignAppEnabled`; legacy route rewriting targets `/legacy-app`.
