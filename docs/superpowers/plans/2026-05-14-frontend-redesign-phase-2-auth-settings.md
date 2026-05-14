# Frontend Redesign Phase 2 Auth Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the login and pre-login settings entry screens with the new desktop UI foundation while preserving the existing authentication and configuration behavior.

**Architecture:** Keep business logic in the current login hooks, form item components, verification modals, Redux actions, and config subpages. Add redesigned page containers that compose those existing units inside `LoginShell` and `PreLoginSettingsShell`, then switch routes only after the redesigned screens pass lint/build and smoke checks. Retain legacy page files for quick rollback during this phase.

**Tech Stack:** React 19, TypeScript, React Router, Redux Toolkit, AntD Form/Modal internals for existing auth flows, Radix-backed `src/ui` primitives, semantic `vd-*` CSS, i18next/react-intl compatibility.

---

## Scope

This phase migrates:

- `/login` visual layout and login workflow.
- `/configPage` pre-login settings shell and navigation.
- Theme and language controls in the settings flow.
- Existing verification modals, QR login modal, password recovery modal, SMS flow, remembered accounts, auto-login, and login-type switching.

This phase does not migrate the post-login app pages (`/app/desk`, `/app/application`, `/app/approval`, `/app/malfunction`). Those move in Phase 3.

## File Structure

Create:

- `src/pages/login/redesign/index.tsx`: redesigned login page that reuses existing login behavior.
- `src/pages/login/redesign/index.scss`: login-specific semantic styles.
- `src/pages/configPage/redesign/index.tsx`: redesigned pre-login settings container with the existing config subpage outlet.
- `src/pages/configPage/redesign/index.scss`: settings container styles.
- `src/features/redesign-auth/enabled.ts`: route switch constants for auth/settings migration.

Modify:

- `src/router/index.tsx`: wire `/login` and `/configPage` through the redesigned containers, keep legacy fallback routes.
- `src/styles/redesign.css`: add shared field, checkbox, card, sidebar, and auth layout classes.
- `src/ui/shell/login-shell.tsx`: allow optional `aside` content without breaking the preview route.
- `src/ui/shell/pre-login-settings-shell.tsx`: allow active sidebar layout and compact headers.
- `src/ui/components/button.tsx`: keep API stable; only add class variants if the redesigned login needs them.
- `src/features/redesign-preview/index.tsx`: update preview imports if shell props change.

Do not modify:

- `src/pages/login/hooks/useLoginHandler.ts`
- `src/pages/login/hooks/useLoginSuccessHandler.ts`
- `src/pages/login/LoginFormItems/*`
- Login verification modal internals
- Config subpage internals under `src/pages/configPage/subPages/*`

Those files are integration dependencies in this phase; change them only if lint/type errors prove an interface gap.

## Task 1: Prepare Auth Redesign Worktree and Baseline

**Files:**
- No source files changed.

- [ ] **Step 1: Create a dedicated worktree**

Run from repo root:

```bash
git worktree add .worktrees/frontend-redesign-phase-2-auth-settings -b frontend-redesign-phase-2-auth-settings
cd .worktrees/frontend-redesign-phase-2-auth-settings
```

Expected:

```text
HEAD is now at <current-main-sha> <latest main commit>
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
pnpm install
```

Expected: lockfile is current and `node_modules` contains `@radix-ui/react-dropdown-menu`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `class-variance-authority`, and `clsx`.

- [ ] **Step 3: Run baseline verification**

Run:

```bash
pnpm run lint
pnpm run build
git status --short
```

Expected:

```text
pnpm run lint exits 0
pnpm run build exits 0
git status --short prints nothing
```

The Vite dynamic import and chunk-size warnings may appear; they are existing warnings and do not fail the build.

## Task 2: Extend Shells and Shared Auth Styles

**Files:**
- Modify: `src/ui/shell/login-shell.tsx`
- Modify: `src/ui/shell/pre-login-settings-shell.tsx`
- Modify: `src/styles/redesign.css`
- Modify: `src/features/redesign-preview/index.tsx`

- [ ] **Step 1: Add optional shell slots**

Update `src/ui/shell/login-shell.tsx` to accept an optional `aside` slot:

```tsx
import type { ReactNode } from 'react';

interface LoginShellProps {
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  aside?: ReactNode;
}

export function LoginShell({ header, children, footer, aside }: LoginShellProps) {
  return (
    <div className="vd-login-shell">
      <section className="vd-login-shell__content">
        <header>{header}</header>
        <main className="vd-login-shell__main">{children}</main>
        <footer>{footer}</footer>
      </section>
      {aside && <aside className="vd-login-shell__aside">{aside}</aside>}
    </div>
  );
}
```

Update `src/ui/shell/pre-login-settings-shell.tsx` to support a header:

```tsx
import type { ReactNode } from 'react';

interface PreLoginSettingsShellProps {
  sidebar: ReactNode;
  children: ReactNode;
  header?: ReactNode;
}

export function PreLoginSettingsShell({ sidebar, children, header }: PreLoginSettingsShellProps) {
  return (
    <div className="vd-prelogin-settings-shell">
      <aside className="vd-prelogin-settings-shell__sidebar">{sidebar}</aside>
      <main className="vd-prelogin-settings-shell__main">
        {header && <header className="vd-prelogin-settings-shell__header">{header}</header>}
        <div className="vd-prelogin-settings-shell__content">{children}</div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Add shared CSS**

Append these classes to `src/styles/redesign.css`:

```css
.vd-login-shell {
  grid-template-columns: minmax(420px, 0.92fr) minmax(360px, 1fr);
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.vd-login-shell__content {
  display: grid;
  min-width: 0;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  padding: 28px;
}

.vd-login-shell__aside {
  min-width: 0;
  border-left: 1px solid var(--vd-color-border);
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--vd-color-accent) 18%, transparent), transparent 42%),
    var(--vd-color-panel);
}

.vd-auth-card {
  width: min(100%, 420px);
  border: 1px solid var(--vd-color-border);
  border-radius: 18px;
  padding: 20px;
  background: var(--vd-color-panel);
  box-shadow: var(--vd-shadow-window);
}

.vd-auth-stack {
  display: grid;
  gap: 14px;
}

.vd-auth-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.vd-auth-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--vd-color-muted);
  cursor: pointer;
  font-size: 13px;
}

.vd-auth-link:hover {
  color: var(--vd-color-text);
}

.vd-auth-login-way {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--vd-color-border);
  border-radius: 999px;
  padding: 6px 10px;
  background: var(--vd-color-panel-subtle);
  color: var(--vd-color-text);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.vd-auth-form :where(.ant-form-item) {
  margin-bottom: 14px;
}

.vd-auth-form :where(.ant-input, .ant-input-affix-wrapper, .ant-select-selector) {
  border-color: var(--vd-color-border);
  border-radius: 12px;
  background: var(--vd-color-panel);
}

.vd-auth-checkboxes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 28px;
}

.vd-auth-side-panel {
  display: grid;
  height: 100%;
  align-content: space-between;
  padding: 32px;
}

.vd-auth-side-panel__title {
  margin: 0;
  color: var(--vd-color-text);
  font-size: 28px;
  line-height: 1.15;
}

.vd-auth-side-panel__text {
  max-width: 420px;
  color: var(--vd-color-muted);
  font-size: 14px;
  line-height: 1.7;
}

.vd-prelogin-settings-shell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.vd-prelogin-settings-shell__content {
  min-height: 0;
  overflow: auto;
}

.vd-settings-nav {
  display: grid;
  gap: 10px;
}

.vd-settings-nav__button {
  justify-content: flex-start;
  width: 100%;
}
```

- [ ] **Step 3: Update preview shell usage**

In `src/features/redesign-preview/index.tsx`, `LoginShell` still works without an `aside` prop. For `PreLoginSettingsShell`, no call-site change is required because `header` is optional.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm run lint
pnpm run build
```

Expected: both commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/ui/shell/login-shell.tsx src/ui/shell/pre-login-settings-shell.tsx src/styles/redesign.css src/features/redesign-preview/index.tsx
git commit -m "Extend redesign auth shells"
```

## Task 3: Build Redesigned Login Page

**Files:**
- Create: `src/pages/login/redesign/index.tsx`
- Create: `src/pages/login/redesign/index.scss`

- [ ] **Step 1: Create login page component**

Create `src/pages/login/redesign/index.tsx` with this component structure:

```tsx
import logoBlue from '@/assets/images/logoBlue1.png';
import Footer from '@/components/Footer';
import { Button } from '@/ui/components/button';
import { LoginShell } from '@/ui/shell/login-shell';
import { LoginAuthType } from '@/native/interfaces/login_history';
import { useAppSelector } from '@/store';
import { selectCurrentLoginType } from '@/store/feature/app';
import {
  selectLoginTypes,
  selectSmsResetPasswordSwitch,
  selectTerminalRememberPasswordSwitch,
} from '@/store/feature/client';
import { selectConnected, selectNetwork } from '@/store/feature/gateway';
import { QrcodeOutlined } from '@ant-design/icons';
import { Checkbox, Form } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useTranslation } from 'react-i18next';
import FindPasswordModal from '../component/FindPasswordModal';
import LoginWayChange from '../component/LoginWayChange';
import { useLoginHandler } from '../hooks/useLoginHandler';
import { useLoginWayData } from '../initData';
import { LoginFormItems } from '../LoginFormItems';
import { OneTimePwdModal } from '../OneTimePasswordModal';
import { OrgScanLoginModal, type OrgScanLoginModalRef } from '../OrgScanLoginModal';
import { SendMsgModal } from '../SendMsgModal';
import { SliderVerifyModal } from '../SliderVerifyModal';
import type { LoginFormType } from '../types';
import './index.scss';

export default function RedesignLogin() {
  const { formatMessage } = useIntl();
  const { t } = useTranslation('common');
  const { t: assistantT } = useTranslation('assistant');
  const [form] = Form.useForm<LoginFormType>();

  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);
  const terminalRememberPasswordSwitch = useAppSelector(selectTerminalRememberPasswordSwitch);
  const loginTypes = useAppSelector(selectLoginTypes);
  const smsResetPasswordSwitch = useAppSelector(selectSmsResetPasswordSwitch);
  const currentLoginWay = useAppSelector(selectCurrentLoginType);

  const orgScanLoginModalRef = useRef<OrgScanLoginModalRef>(null);
  const { loginWayKv } = useLoginWayData();
  const {
    userLogin,
    loginLoading,
    isLocalPhoneLogin,
    setIsLocalPhoneLogin,
    sliderVerifyModalRef,
    sendMsgModalRef,
    oneTimePwdModalRef,
    autoLoginChecked,
    setAutoLoginChecked,
    rememberMeChecked,
    setRememberMeChecked,
  } = useLoginHandler();

  const [canScan] = useState(false);
  const [threeChannel, setThreeChannel] = useState('');
  const [changeLoginWayVisible, setChangeLoginWayVisible] = useState(false);
  const [findPwdVisible, setFindPwdVisible] = useState(false);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await userLogin(values);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  const canSubmit = connected && network;
  const showLocalLinks = currentLoginWay === LoginAuthType.LOCAL;
  const showRememberControls =
    (!isLocalPhoneLogin || currentLoginWay !== LoginAuthType.LOCAL) &&
    terminalRememberPasswordSwitch;
  const showAutoLogin =
    (!isLocalPhoneLogin || currentLoginWay !== LoginAuthType.LOCAL) &&
    currentLoginWay !== LoginAuthType.IAM;

  return (
    <div className="redesign-auth-page">
      <LoginShell
        header={
          <div className="redesign-auth-page__header">
            <img
              src={logoBlue}
              className="redesign-auth-page__logo"
              alt="Viridian Desk"
              onDragStart={(event) => event.preventDefault()}
            />
            <button
              className="vd-auth-link"
              type="button"
              onClick={() => {
                window.location.hash = '';
              }}
            >
              {t('appName')}
            </button>
          </div>
        }
        footer={<Footer />}
        aside={
          <div className="vd-auth-side-panel">
            <div>
              <h1 className="vd-auth-side-panel__title">{t('appName')}</h1>
              <p className="vd-auth-side-panel__text">{assistantT('subtitle')}</p>
            </div>
            <p className="vd-auth-side-panel__text">
              {canSubmit ? t('status.online') : t('status.offline')}
            </p>
          </div>
        }
      >
        <div className="vd-auth-card">
          <div className="vd-auth-stack">
            {changeLoginWayVisible ? (
              <LoginWayChange onChange={() => setChangeLoginWayVisible(false)} />
            ) : (
              <>
                <div className="vd-auth-row">
                  <button
                    className="vd-auth-login-way"
                    type="button"
                    onClick={() => {
                      if (loginTypes && loginTypes.length > 1) {
                        setChangeLoginWayVisible(true);
                      }
                    }}
                  >
                    {loginWayKv[currentLoginWay]}
                  </button>
                  {currentLoginWay === LoginAuthType.CORP && (
                    <QrcodeOutlined
                      className="redesign-auth-page__qr"
                      onClick={() =>
                        canScan
                          ? orgScanLoginModalRef.current?.show({
                              corpId: form.getFieldValue('corpId'),
                              threeChannel,
                            })
                          : null
                      }
                    />
                  )}
                </div>

                <Form form={form} layout="vertical" className="vd-auth-form" requiredMark={false}>
                  <LoginFormItems
                    formIns={form}
                    isLocalPhoneLogin={isLocalPhoneLogin}
                    setThreeChannel={setThreeChannel}
                  />
                </Form>

                {showLocalLinks && (
                  <div className="vd-auth-row">
                    <button
                      className="vd-auth-link"
                      type="button"
                      onClick={() => setIsLocalPhoneLogin(!isLocalPhoneLogin)}
                    >
                      {formatMessage({ id: !isLocalPhoneLogin ? 'loginByphone' : 'loginByUser' })}
                    </button>
                    {smsResetPasswordSwitch === 'Enabled' && (
                      <button
                        className="vd-auth-link"
                        disabled={!canSubmit}
                        type="button"
                        onClick={() => setFindPwdVisible(true)}
                      >
                        {formatMessage({ id: 'ForgetPassword' })}
                      </button>
                    )}
                  </div>
                )}

                <Button
                  className="redesign-auth-page__submit"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  size="lg"
                >
                  {formatMessage({ id: loginLoading ? 'LOGING' : 'LOGIN' })}
                </Button>

                <div className="vd-auth-checkboxes">
                  {showRememberControls ? (
                    <Checkbox
                      checked={rememberMeChecked}
                      onChange={(event) => setRememberMeChecked(!!event.target.checked)}
                    >
                      {formatMessage({ id: 'REMEMBER_PASSWORD' })}
                    </Checkbox>
                  ) : (
                    <span />
                  )}
                  {showAutoLogin ? (
                    <Checkbox
                      checked={autoLoginChecked}
                      onChange={(event) => setAutoLoginChecked(!!event.target.checked)}
                    >
                      {formatMessage({ id: 'AUTOLOGIN' })}
                    </Checkbox>
                  ) : (
                    <span />
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <FindPasswordModal visible={findPwdVisible} setVisible={setFindPwdVisible} />
        <SliderVerifyModal ref={sliderVerifyModalRef} />
        <SendMsgModal ref={sendMsgModalRef} />
        <OneTimePwdModal ref={oneTimePwdModalRef} />
        <OrgScanLoginModal ref={orgScanLoginModalRef} />
      </LoginShell>
    </div>
  );
}
```

- [ ] **Step 2: Create login page styles**

Create `src/pages/login/redesign/index.scss`:

```scss
.redesign-auth-page {
  width: 100%;
  height: 100%;
  background: var(--vd-color-bg);
  color: var(--vd-color-text);
}

.redesign-auth-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.redesign-auth-page__logo {
  height: 34px;
  object-fit: contain;
}

.redesign-auth-page__qr {
  color: var(--vd-color-muted);
  cursor: pointer;
  font-size: 24px;
}

.redesign-auth-page__submit {
  width: 100%;
}

.redesign-auth-page .login-way-change {
  width: 100%;
}

.redesign-auth-page .username-option-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
```

- [ ] **Step 3: Run type and lint check**

Run:

```bash
pnpm run lint
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/pages/login/redesign/index.tsx src/pages/login/redesign/index.scss
git commit -m "Add redesigned login page"
```

## Task 4: Build Redesigned Pre-Login Settings Container

**Files:**
- Create: `src/pages/configPage/redesign/index.tsx`
- Create: `src/pages/configPage/redesign/index.scss`

- [ ] **Step 1: Create settings container**

Create `src/pages/configPage/redesign/index.tsx`:

```tsx
import { Button } from '@/ui/components/button';
import { PreLoginSettingsShell } from '@/ui/shell/pre-login-settings-shell';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Outlet, useNavigate } from 'react-router';
import FormModal from '../modalComp/FormModal';
import './index.scss';

export default function RedesignConfigPage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const [chooseTab, setChooseTab] = useState('/configPage/serverSetting');
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [_isPassedSecurity, _setIsPassedSecurity] = useState(false);

  const initialValues = { securityPassword: '' };
  const [defaultFormValues, setDefaultFormValues] = useState(initialValues);
  const [formFeatures, setFormFeatures] = useState([
    {
      key: 'securityPassword',
      name: 'securityPassword',
      label: intl.formatMessage({ id: 'SecurityPassword' }),
      rules: [
        {
          required: true,
          message: intl.formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: intl.formatMessage({ id: 'SecurityPassword' }) },
          ),
        },
      ],
      comType: 'input.password',
      comProps: {
        prefix: '',
        suffix: '',
        placeholder: `请输入${intl.formatMessage({ id: 'SecurityPassword' })}`,
      },
    },
  ]);

  const tabButtons = useMemo(
    () =>
      [
        {
          name: intl.formatMessage({ id: 'Server' }),
          path: '/configPage/serverSetting',
          icon: 'icon-net',
        },
        {
          name: intl.formatMessage({ id: 'COMMONSETUP' }),
          path: '/configPage/commonSetting',
          icon: 'icon-stencil',
        },
        {
          name: intl.formatMessage({ id: 'Senior' }),
          path: '/configPage/advancedSetting',
          icon: 'icon-log',
        },
        {
          name: intl.formatMessage({ id: 'ABOUT' }),
          path: '/configPage/about',
          icon: 'icon-info-s',
        },
      ],
    [intl],
  );

  const tabChoose = (path: string) => {
    setChooseTab(path);
    navigate(path);
  };

  const submitDistributor = (_params: any, cb: () => void) => {
    cb();
  };

  return (
    <div className="redesign-settings-page">
      <PreLoginSettingsShell
        header={
          <>
            <div>
              <h1 className="redesign-settings-page__title">
                {intl.formatMessage({ id: 'COMMONSETUP' })}
              </h1>
              <p className="redesign-settings-page__subtitle">
                {intl.formatMessage({ id: 'COMMONSETUP' })}
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/login')}>
              {intl.formatMessage({ id: 'ExitSetting' })}
            </Button>
          </>
        }
        sidebar={
          <nav className="vd-settings-nav">
            {tabButtons.map((button) => (
              <Button
                key={button.path}
                className="vd-settings-nav__button"
                variant={chooseTab === button.path ? 'primary' : 'ghost'}
                onClick={() => tabChoose(button.path)}
              >
                <i className={`iconfont ${button.icon}`} />
                <span>{button.name}</span>
              </Button>
            ))}
          </nav>
        }
      >
        <Outlet />
      </PreLoginSettingsShell>

      {formModalVisible && (
        <FormModal
          title={`${intl.formatMessage({ id: 'SecurityPassword' })}`}
          visiable={formModalVisible}
          setVisiable={setFormModalVisible}
          formFeatures={formFeatures}
          setFormFeatures={setFormFeatures}
          defaultFormValues={defaultFormValues}
          setDefaultFormValues={setDefaultFormValues}
          initialValues={initialValues}
          onOkRun={submitDistributor}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create settings styles**

Create `src/pages/configPage/redesign/index.scss`:

```scss
.redesign-settings-page {
  width: 100%;
  height: 100%;
  background: var(--vd-color-bg);
  color: var(--vd-color-text);
}

.redesign-settings-page__title {
  margin: 0;
  color: var(--vd-color-text);
  font-size: 22px;
  line-height: 1.2;
}

.redesign-settings-page__subtitle {
  margin: 6px 0 0;
  color: var(--vd-color-muted);
  font-size: 13px;
}

.redesign-settings-page .vd-settings-nav__button {
  gap: 10px;
}

.redesign-settings-page .commonSettingWrapper,
.redesign-settings-page .server-setting,
.redesign-settings-page .advancedSetting,
.redesign-settings-page .about-page {
  max-width: 980px;
}
```

- [ ] **Step 3: Verify**

Run:

```bash
pnpm run lint
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/pages/configPage/redesign/index.tsx src/pages/configPage/redesign/index.scss
git commit -m "Add redesigned pre-login settings page"
```

## Task 5: Wire Routes With Rollback Paths

**Files:**
- Create: `src/features/redesign-auth/enabled.ts`
- Modify: `src/router/index.tsx`

- [ ] **Step 1: Create route switch constant**

Create `src/features/redesign-auth/enabled.ts`:

```ts
export const enableRedesignAuth =
  import.meta.env.VITE_ENABLE_REDESIGN_AUTH === undefined ||
  import.meta.env.VITE_ENABLE_REDESIGN_AUTH === 'true';
```

This defaults the redesigned auth/settings UI on. Set `VITE_ENABLE_REDESIGN_AUTH=false` to fall back during local debugging.

- [ ] **Step 2: Wire route imports**

Update `src/router/index.tsx` imports:

```ts
import { enableRedesignAuth } from '@/features/redesign-auth/enabled';
import RedesignConfigPage from '@/pages/configPage/redesign';
import RedesignLogin from '@/pages/login/redesign';
```

Keep existing imports:

```ts
import ConfigPage from '@/pages/configPage';
import Login from '../pages/login';
```

- [ ] **Step 3: Switch route elements**

Replace the login route element:

```tsx
{
  path: 'login',
  element: enableRedesignAuth ? <RedesignLogin /> : <Login />,
},
{
  path: 'legacy-login',
  element: <Login />,
},
```

Replace the config page route element:

```tsx
{
  path: 'configPage',
  element: enableRedesignAuth ? <RedesignConfigPage /> : <ConfigPage />,
  children: [
    {
      path: 'serverSetting',
      element: <ServerSetting />,
    },
    {
      path: 'commonSetting',
      element: <CurrencySetting />,
    },
    {
      path: 'advancedSetting',
      element: <AdvancedSetting />,
    },
    {
      path: 'about',
      element: <About />,
    },
  ],
},
{
  path: 'legacy-configPage',
  element: <ConfigPage />,
  children: [
    {
      path: 'serverSetting',
      element: <ServerSetting />,
    },
    {
      path: 'commonSetting',
      element: <CurrencySetting />,
    },
    {
      path: 'advancedSetting',
      element: <AdvancedSetting />,
    },
    {
      path: 'about',
      element: <About />,
    },
  ],
},
```

- [ ] **Step 4: Verify fallback build mode**

Run:

```bash
VITE_ENABLE_REDESIGN_AUTH=false pnpm run build
```

Expected: build exits 0.

- [ ] **Step 5: Verify default build mode**

Run:

```bash
pnpm run build
```

Expected: build exits 0.

- [ ] **Step 6: Commit**

```bash
git add src/features/redesign-auth/enabled.ts src/router/index.tsx
git commit -m "Switch auth routes to redesigned UI"
```

## Task 6: Browser Smoke Check and Polish Pass

**Files:**
- Modify only files from Tasks 2-5 if smoke checks reveal issues.

- [ ] **Step 1: Start dev server**

Run:

```bash
pnpm run dev
```

Expected:

```text
Local:   http://localhost:1420/
```

- [ ] **Step 2: Smoke check redesigned login**

Open:

```text
http://localhost:1420/login
```

Verify:

- Login page renders without console errors.
- Current login type label matches `selectCurrentLoginType`.
- Login type switcher opens when multiple login types are available.
- Account/password fields render for local login.
- Phone login toggle switches to phone/SMS fields.
- Remember password and auto-login checkboxes preserve state.
- Submit button disables when gateway/network is disconnected.
- Find password opens the existing `FindPasswordModal`.
- Existing verification modals still mount.

- [ ] **Step 3: Smoke check pre-login settings**

Open:

```text
http://localhost:1420/configPage/serverSetting
http://localhost:1420/configPage/commonSetting
http://localhost:1420/configPage/advancedSetting
http://localhost:1420/configPage/about
```

Verify:

- Sidebar highlights the current settings section after clicking it.
- Exit button navigates to `/login`.
- Language selector still updates i18next language.
- Theme selector still updates the existing Redux/native theme source.
- Existing subpage controls remain usable.

- [ ] **Step 4: Smoke check fallback routes**

Open:

```text
http://localhost:1420/legacy-login
http://localhost:1420/legacy-configPage/serverSetting
```

Expected: legacy pages render and remain usable.

- [ ] **Step 5: Run final verification**

Run:

```bash
pnpm run lint
pnpm run build
git diff --check
git status --short
```

Expected:

```text
pnpm run lint exits 0
pnpm run build exits 0
git diff --check exits 0
git status --short only shows intentional changed files before commit, then prints nothing after commit
```

- [ ] **Step 6: Commit smoke polish**

If no polish changes were needed:

```bash
git status --short
```

Expected: clean working tree.

If polish changes were needed:

```bash
git add <changed-files>
git commit -m "Polish redesigned auth settings flow"
```

## Task 7: Final Review and Completion

**Files:**
- No planned source changes.

- [ ] **Step 1: Request code review**

Ask a reviewer to inspect the branch against this plan. Include:

```text
Base: main before frontend-redesign-phase-2-auth-settings
Head: current feature branch HEAD
Focus: login behavior preservation, settings behavior preservation, route fallback, i18n/theme integration, production CSS safety.
Verification: pnpm run lint, pnpm run build, git diff --check, browser smoke checks.
```

- [ ] **Step 2: Fix review findings**

For each Critical or Important finding:

```bash
git status --short
```

Then edit only the files related to that finding, run the narrow verification first, then:

```bash
pnpm run lint
pnpm run build
git diff --check
git add <changed-files>
git commit -m "Fix redesigned auth review findings"
```

- [ ] **Step 3: Merge only after final verification**

Run:

```bash
pnpm run lint
pnpm run build
git diff --check
```

Expected: all exit 0.

Then use the `superpowers:finishing-a-development-branch` skill to choose merge, PR, keep branch, or discard.

## Self-Review

Spec coverage:

- Existing login capabilities are preserved by reusing `useLoginHandler`, `LoginFormItems`, and all existing modal components.
- Login type switching is preserved by reusing `LoginWayChange` and Redux `setCurrentLoginType`.
- Pre-login settings preserve existing behavior by reusing the existing settings subpage routes and components.
- Theme and language remain on existing Redux/native config actions.
- Rollback is covered by `legacy-login`, `legacy-configPage`, and `VITE_ENABLE_REDESIGN_AUTH=false`.

Placeholder scan:

- No forbidden placeholder tokens or unspecified implementation steps are required to execute the plan.

Type consistency:

- `LoginFormType`, `LoginAuthType`, `RedesignLogin`, `RedesignConfigPage`, and `enableRedesignAuth` are named consistently across tasks.
