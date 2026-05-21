import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

test('keeps low-frequency modal components lazy-loaded', () => {
  expect(source('src/pages/approval/index.tsx')).not.toContain(
    "import Create from './component/create'",
  );
  expect(source('src/pages/application/index.tsx')).not.toContain(
    "import { AddFromSysModal } from './component/AddFromSysModal'",
  );
  expect(source('src/pages/application/index.tsx')).not.toContain(
    "import { AddFromSelfModal } from './component/AddFromSelfModal'",
  );
  expect(source('src/pages/malfunction/index.tsx')).not.toContain(
    "import CreatedModal from './create'",
  );
  expect(source('src/pages/desk/DeskPage.tsx')).not.toContain(
    "import DeskPoolModal from './components/deskPoolDetail'",
  );
});

test('loads the desk connection overlay only while connecting', () => {
  const deskPageSource = source('src/pages/desk/DeskPage.tsx');

  expect(deskPageSource).not.toContain("import DeskLoading from '@/components/DeskLoading'");
  expect(deskPageSource).toContain("import('@/components/DeskLoading')");
});

test('loads desk detail modals only when opened', () => {
  const deskDetailSource = source('src/pages/deskDetail/DeskDetailPage.tsx');

  expect(deskDetailSource).not.toContain("import AllDiskListModal from './allDiskListModal'");
  expect(deskDetailSource).not.toContain("import CreateModal from './createSnap'");
  expect(deskDetailSource).toContain("import('./allDiskListModal')");
  expect(deskDetailSource).toContain("import('./createSnap')");
});

test('loads application detail modal only when opened', () => {
  const applicationPageSource = source('src/pages/application/ApplicationPage.tsx');

  expect(applicationPageSource).not.toContain(
    "import { AppDetailModal } from './component/AppDetailModal'",
  );
  expect(applicationPageSource).toContain("import('./component/AppDetailModal')");
});

test('keeps the login page local-account only', () => {
  const loginPageSource = source('src/pages/login/LoginPage.tsx');
  const loginHandlerSource = source('src/pages/login/hooks/useLoginHandler.ts');
  const removedLoginPaths = [
    'src/pages/login/LoginFormItems',
    'src/pages/login/OneTimePasswordModal',
    'src/pages/login/OrgScanLoginModal',
    'src/pages/login/SendMsgModal',
    'src/pages/login/SliderVerifyModal',
    'src/pages/login/component/FindPasswordModal',
    'src/pages/login/component/LoginWayChange',
    'src/components/SliderVerify',
    'src/assets/images/verify',
    'src/assets/js/wwLogin-1.2.7.js',
  ];

  expect(loginPageSource).not.toContain('LoginWayChange');
  expect(loginPageSource).not.toContain('QrcodeOutlined');
  expect(loginPageSource).not.toContain('selectLoginTypes');
  expect(loginPageSource).not.toContain('selectSmsResetPasswordSwitch');
  expect(loginPageSource).not.toContain('selectCurrentLoginType');
  expect(loginPageSource).not.toContain('isLocalPhoneLogin');
  expect(loginPageSource).toContain('UsernamePwd');

  expect(loginHandlerSource).toContain('authType: LoginAuthType.LOCAL');
  expect(loginHandlerSource).not.toContain('selectCurrentLoginType');
  expect(loginHandlerSource).not.toContain('selectTerminalGraphAuthenticationSwitch');
  expect(loginHandlerSource).not.toContain('selectTerminalMultiFactorAuthenticationSwitch');
  expect(loginHandlerSource).not.toContain('selectOneTimePasswordSwitch');
  expect(loginHandlerSource).not.toContain('terminalPhoneLogin');
  expect(loginHandlerSource).not.toContain('checkTerminalUser');
  expect(loginHandlerSource).not.toContain('waitFor');
  expect(loginHandlerSource).not.toContain('ModalRef');

  for (const removedLoginPath of removedLoginPaths) {
    expect(existsSync(join(process.cwd(), removedLoginPath)), removedLoginPath).toBe(false);
  }
});

test('keeps login route outside the authenticated client layout', () => {
  const routerSource = source('src/router/index.tsx');
  const clientLayoutBlockStart = routerSource.indexOf('element: <ClientLayout />');
  const clientLayoutBlock = routerSource.slice(clientLayoutBlockStart);

  expect(routerSource).toContain("path: 'login'");
  expect(routerSource).toContain('element: routeElement(<LoginPage />)');
  expect(clientLayoutBlock).not.toContain("path: 'login'");
  expect(clientLayoutBlock).not.toContain('<LoginPage />');
});

test('loads saved config before rendering the lightweight login route', () => {
  const routerSource = source('src/router/index.tsx');
  const preAuthLoaderStart = routerSource.indexOf('const preAuthConfigLoader');
  const preAuthLoaderEnd = routerSource.indexOf('const clientLayoutLoader', preAuthLoaderStart);
  const preAuthLoaderBlock = routerSource.slice(preAuthLoaderStart, preAuthLoaderEnd);

  expect(preAuthLoaderStart).toBeGreaterThanOrEqual(0);
  expect(preAuthLoaderEnd).toBeGreaterThan(preAuthLoaderStart);
  expect(preAuthLoaderBlock).toContain('fetchConfigInfo');
  expect(preAuthLoaderBlock).not.toContain('fetchTerminalInfo');
  expect(routerSource).toContain('loader: preAuthConfigLoader');
});

test('keeps login window controls local to the lightweight login route', () => {
  const loginPageSource = source('src/pages/login/LoginPage.tsx');
  const loginPageStyles = source('src/pages/login/LoginPage.scss');

  expect(loginPageSource).toContain("import ControlWindow from '@/components/ControlWindow'");
  expect(loginPageSource).toContain('auth-page__drag-region');
  expect(loginPageSource).toContain('<ControlWindow />');
  expect(loginPageStyles).toContain('.auth-page__controls');
});

test('keeps viewport rem scaling available before authenticated layout loads', () => {
  const viewportScalePath = 'src/utils/setupViewportScale.ts';
  const appSource = source('src/App.tsx');
  const clientLayoutSource = source('src/layouts/clientLayout/index.tsx');

  expect(existsSync(join(process.cwd(), viewportScalePath)), viewportScalePath).toBe(true);
  expect(appSource).toContain('setupViewportScale');
  expect(clientLayoutSource).not.toContain('docEl.clientWidth / 12');
  expect(clientLayoutSource).not.toContain('setBodyFontSize');
});

test('keeps the login typing path free of expensive live filters', () => {
  const loginCriticalStyles = [
    source('src/pages/login/LoginPage.scss'),
    source('src/components/LoginGatewayDock/index.scss'),
  ].join('\n');

  expect(loginCriticalStyles).not.toContain('backdrop-filter');
  expect(loginCriticalStyles).not.toContain('mask-image');
  expect(loginCriticalStyles).not.toContain('filter:');
});

test('keeps the login page hero and footer controls minimal', () => {
  const loginPageSource = source('src/pages/login/LoginPage.tsx');
  const loginPageStyles = source('src/pages/login/LoginPage.scss');
  const footerSource = source('src/components/Footer/index.tsx');
  const footerStyles = source('src/components/Footer/index.scss');

  expect(loginPageSource).not.toContain("formatMessage({ id: 'Ready'");
  expect(loginPageSource).not.toContain('auth-page__eyebrow');
  expect(loginPageStyles).not.toContain('auth-page__eyebrow');
  expect(loginPageSource).not.toContain('hiddenActionKeys');
  expect(footerSource).not.toContain("key: 'msg'");
  expect(footerSource).not.toContain("key: 'question'");
  expect(footerSource).not.toContain('setMsgDot');
  expect(footerSource).not.toContain('setMsgModalShow');
  expect(footerSource).not.toContain('selectMsgDot');
  expect(footerSource).not.toContain('openDocs');
  expect(footerStyles).not.toContain('login-footer__action--unread');
});

test('keeps the final server action menu from being clipped', () => {
  const serverSettingSource = source('src/pages/configPage/subPages/serverSetting/index.tsx');
  const serverSettingStyles = source('src/pages/configPage/subPages/serverSetting/index.scss');
  const uiSource = source('src/ui/index.tsx');
  const uiStyles = source('src/ui/styles.scss');

  expect(serverSettingSource).toContain('gatewayList.map((g, index)');
  expect(serverSettingSource).toContain(
    "placement={index === gatewayList.length - 1 ? 'topRight' : 'bottomRight'}",
  );
  expect(serverSettingStyles).toContain('.vd-settings-group__content');
  expect(serverSettingStyles).toContain('overflow: visible');
  expect(uiSource).toContain("`vdui-dropdown--${placement}`");
  expect(uiStyles).toContain('.vdui-dropdown--topRight');
  expect(uiStyles).toContain('bottom: calc(100% + 8px)');
});

test('shows restrained icons on login status labels', () => {
  const loginPageSource = source('src/pages/login/LoginPage.tsx');
  const loginPageStyles = source('src/pages/login/LoginPage.scss');

  expect(loginPageSource).toContain('auth-page__status-label');
  expect(loginPageSource).toContain('icon-hosts');
  expect(loginPageSource).toContain('icon-net');
  expect(loginPageSource).toContain('icon-key');
  expect(loginPageStyles).toContain('.auth-page__status-label');
  expect(loginPageStyles).toContain('gap: 6px');
  expect(loginPageStyles).toContain('font-size: 14px');
});

test('keeps the login shell cheap to repaint on low-power devices', () => {
  const loginStyles = source('src/pages/login/LoginPage.scss');

  expect(loginStyles).not.toContain('radial-gradient');
  expect(loginStyles).not.toContain('background-size: 34px 34px');
  expect(loginStyles).not.toContain('.auth-page__window::before');
});

test('keeps login input focus styles cheap to repaint while typing', () => {
  const loginStyles = source('src/pages/login/LoginPage.scss');

  expect(loginStyles).not.toContain('box-shadow 180ms ease');
  expect(loginStyles).not.toContain('box-shadow: 0 0 0 3px');
  expect(loginStyles).not.toContain(
    'outline: 2px solid color-mix(in srgb, var(--auth-accent) 28%, transparent)',
  );
  expect(loginStyles).not.toContain('outline-offset: 1px');
  expect(loginStyles).toContain(
    'border-color: color-mix(in srgb, var(--auth-accent) 42%, transparent) !important;',
  );
});

test('keeps modal and login input focus rings single-layered', () => {
  const loginStyles = source('src/pages/login/LoginPage.scss');
  const publishAppModalStyles = source(
    'src/pages/application/component/AddFromSelfModal/index.scss',
  );
  const uiStyles = source('src/ui/styles.scss');
  const inputAffixWrapperStart = uiStyles.indexOf('.vdui-input-affix-wrapper {');
  const inputAffixWrapperBlock = uiStyles.slice(
    inputAffixWrapperStart,
    uiStyles.indexOf('\n.vdui-input,', inputAffixWrapperStart),
  );

  expect(loginStyles).toContain('.vdui-input-affix-wrapper .vdui-input:focus');
  expect(loginStyles).toContain('outline: 0 !important');
  expect(publishAppModalStyles).not.toContain('.vdui-input');
  expect(publishAppModalStyles).not.toContain('.vdui-select');
  expect(publishAppModalStyles).not.toContain('--app-modal-accent');
  expect(publishAppModalStyles).not.toContain('--app-modal-surface-subtle');
  expect(inputAffixWrapperBlock).not.toContain('&:hover');
  expect(inputAffixWrapperBlock).toContain('&:focus-within');
});

test('keeps the main Tauri window opaque for low-power Linux compositors', () => {
  const tauriConfig = source('src-tauri/tauri.conf.json');

  expect(tauriConfig).not.toContain('"transparent": true');
  expect(tauriConfig).toContain('"transparent": false');
});

test('notifies only changed form fields while typing', () => {
  const uiSource = source('src/ui/index.tsx');

  expect(uiSource).toContain('fieldListeners');
  expect(uiSource).toContain('notifyField');
  expect(uiSource).toContain('_subscribeField');
  expect(uiSource).not.toContain('form._subscribe?.(() => force((value) => value + 1))');
});

test('allows login text fields to avoid controlled React value writes while typing', () => {
  const uiSource = source('src/ui/index.tsx');
  const usernamePasswordSource = source('src/pages/login/UsernamePwd/index.tsx');

  expect(uiSource).toContain('liveValue?: boolean');
  expect(uiSource).toContain('_setFieldValueSilently');
  expect(uiSource).toContain('defaultValue');
  expect(usernamePasswordSource).toContain('liveValue={false}');
});

test('keeps login key handling off the per-character DOM query path', () => {
  const loginPageSource = source('src/pages/login/LoginPage.tsx');

  expect(loginPageSource).toContain("if (event.key !== 'Enter') return;");
});

test('keeps login enter repeat guard out of React state updates', () => {
  const enterGuardSource = source('src/pages/login/UsernamePwd/usePreventEnterKeyLongPress.ts');

  expect(enterGuardSource).toContain('useRef');
  expect(enterGuardSource).not.toContain('useState');
  expect(enterGuardSource).not.toContain('setIsEnterPressed');
});

test('keeps the login form branch out of gateway status updates', () => {
  const loginPageSource = source('src/pages/login/LoginPage.tsx');

  expect(loginPageSource).toContain('<UsernamePwd formIns={form} />');
  expect(loginPageSource).not.toContain('LoginFormItems');
});

test('fetches terminal info after login before permission route selection', () => {
  const successHandlerSource = source('src/pages/login/hooks/useLoginSuccessHandler.ts');

  expect(successHandlerSource).toContain('fetchTerminalInfo');
  expect(successHandlerSource).toContain('.unwrap()');
  expect(successHandlerSource).not.toContain('selectIsThin');
});

test('avoids duplicate terminal bootstrap after login success', () => {
  const routerSource = source('src/router/index.tsx');

  expect(routerSource).toContain('const state = appStore.getState();');
  expect(routerSource).toContain('if (!state.terminal)');
  expect(routerSource).toContain('appStore.dispatch(fetchTerminalInfo())');
});

test('keeps the local username password form memoized away from parent shell renders', () => {
  expect(source('src/pages/login/UsernamePwd/index.tsx')).toContain('memo(');
});

test('loads the assistant panel only when the user opens it', () => {
  expect(source('src/layouts/AppLayout/index.tsx')).not.toContain(
    "import { AssistantPanel } from '@/ui/assistant/assistant-panel'",
  );
});

test('keeps authenticated shell slots stable across route content renders', () => {
  const appLayoutSource = source('src/layouts/AppLayout/index.tsx');

  expect(appLayoutSource).not.toContain('import { LoginGatewayDock }');
  expect(appLayoutSource).toContain("import('@/components/LoginGatewayDock')");
  expect(appLayoutSource).toContain('useCallback');
  expect(appLayoutSource).toContain('const assistantSlot = useMemo');
  expect(appLayoutSource).toContain('const navSlot = useMemo');
  expect(appLayoutSource).toContain('const footerSlot = useMemo');
});

test('keeps desk resource cards memoized away from page-level refresh state', () => {
  const deskPageSource = source('src/pages/desk/DeskPage.tsx');

  expect(deskPageSource).toContain('memo(');
  expect(deskPageSource).toContain('function DesktopCard');
  expect(deskPageSource).toContain('function DeskPoolCard');
  expect(deskPageSource).toContain('useCallback');
  expect(deskPageSource).toContain('useMemo');
});

test('keeps desk hook actions stable for memoized desk cards', () => {
  const deskHookSource = source('src/pages/desk/useDeskHooks.tsx');

  expect(deskHookSource).toContain('useCallback');
  expect(deskHookSource).toContain('useMemo');
  expect(deskHookSource).toContain('const generateMenus = useCallback');
  expect(deskHookSource).toContain('const enterDesk = useCallback');
  expect(deskHookSource).toContain('const createDeskFromDeskPool = useCallback');
  expect(deskHookSource).toContain('const hookResult = useMemo');
});

test('loads the message center only when the user opens it', () => {
  const clientLayoutSource = source('src/layouts/clientLayout/index.tsx');

  expect(clientLayoutSource).not.toContain(
    "import MessageListModal from '@/components/MessageCenter'",
  );
  expect(clientLayoutSource).toContain("import('@/components/MessageCenter')");
});

test('does not statically bundle every locale at startup', () => {
  const i18nSource = source('src/utils/i18n.ts');

  expect(i18nSource).not.toContain("from '@/assets/locales/zh-CN.json'");
  expect(i18nSource).not.toContain("from '@/assets/locales/zh-TW.json'");
  expect(i18nSource).not.toContain("from '@/assets/locales/en-US.json'");
  expect(i18nSource).not.toContain("from '@/ui/i18n/locales/zh-CN/common.json'");
  expect(i18nSource).not.toContain("from '@/ui/i18n/locales/zh-CN/assistant.json'");
});

test('keeps async route styles split from the startup stylesheet', () => {
  expect(source('vite.config.ts')).not.toContain('cssCodeSplit: false');
});

test('splits vendor chunks by exact package name to avoid production init cycles', () => {
  const viteConfig = source('vite.config.ts');

  expect(viteConfig).toContain('function getNodePackageName');
  expect(viteConfig).toContain("packageName === 'react-i18next'");
  expect(viteConfig).toContain("return 'vendor-icons'");
  expect(viteConfig).toContain("return 'vendor-scrollbars'");
  expect(viteConfig).toContain("return 'vendor-state'");
  expect(viteConfig).not.toContain("return 'vendor-react'");
  expect(viteConfig).not.toContain("id.includes('/react')");
  expect(viteConfig).not.toContain("id.includes('/react-i18next')");
});

test('keeps route design-system styles out of the global stylesheet', () => {
  expect(source('src/styles/index.scss')).not.toContain("@use '@/styles/design-system.css'");
});

test('keeps component library styles out of the global stylesheet', () => {
  expect(source('src/styles/index.scss')).not.toContain("@use '@/ui/styles.scss'");
});

test('keeps route-only color icon fonts out of the global stylesheet', () => {
  expect(source('src/styles/index.scss')).not.toContain('iconfontColor');
  expect(source('src/pages/desk/useDeskHooks.tsx')).toContain(
    "import '@/assets/iconfontColor/iconfont-color.css'",
  );
  expect(source('src/pages/deskDetail/useSnap.tsx')).toContain(
    "import '@/assets/iconfontColor/iconfont-color.css'",
  );
});

test('lazy-loads the authenticated app layout with its route styles', () => {
  const routerSource = source('src/router/index.tsx');

  expect(routerSource).not.toContain("import { AppLayout } from '@/layouts/AppLayout'");
  expect(routerSource).toContain("import('@/layouts/AppLayout')");
});

test('keeps the full UI component bundle out of the app bootstrap', () => {
  const appSource = source('src/App.tsx');

  expect(appSource).not.toContain("from '@/ui'");
  expect(appSource).not.toContain('ConfigProvider');
  expect(appSource).not.toContain('ClientApp');
});

test('keeps startup notifications out of the full UI component bundle', () => {
  const startupSources = [
    source('src/layouts/clientLayout/index.tsx'),
    source('src/services/requestErrorHandler.ts'),
    source('src/utils/invoke/index.ts'),
  ];

  for (const startupSource of startupSources) {
    expect(startupSource).not.toContain("from '@/ui'");
  }

  expect(source('src/ui/message.ts')).toContain("import './message.scss'");
  expect(source('src/ui/styles.scss')).not.toContain('.vd-toast');
});

test('removes slider verification assets from the login client', () => {
  expect(existsSync(join(process.cwd(), 'src/components/SliderVerify'))).toBe(false);
  expect(existsSync(join(process.cwd(), 'src/assets/images/verify'))).toBe(false);
});

test('keeps the app shell background CSS-only', () => {
  expect(source('src/styles/theme.scss')).not.toContain('app_layout_bg.png');
});

test('does not load cached native background images in the renderer', () => {
  const clientLayoutSource = source('src/layouts/clientLayout/index.tsx');
  const deskLoadingSource = source('src/components/DeskLoading/index.tsx');

  expect(clientLayoutSource).not.toContain('selectBackgroundImage');
  expect(clientLayoutSource).not.toContain('backgroundImage:');
  expect(deskLoadingSource).not.toContain('selectBackgroundImage');
  expect(deskLoadingSource).not.toContain('backgroundImage:');
});

test('keeps desk detail fact values free of nested paragraph markup', () => {
  expect(source('src/pages/deskDetail/useDeskDetail.tsx')).not.toContain('<p');
});

test('removes login history and operation record features from the client', () => {
  const removedFiles = [
    'src/native/interfaces/login_history/index.ts',
    'src/native/interfaces/login_history/types.ts',
    'src/native/adapters/tauri/login_history/index.ts',
    'src/native/adapters/web/login_history.ts',
    'src/native/adapters/electron/login_history.ts',
  ];

  for (const removedFile of removedFiles) {
    expect(existsSync(join(process.cwd(), removedFile)), removedFile).toBe(false);
  }

  const sourceFiles = [
    source('src/native/interfaces/index.ts'),
    source('src/store/feature/app/appSlice.ts'),
    source('src/pages/login/UsernamePwd/index.tsx'),
    source('src/components/Sidebar/index.tsx'),
  ].join('\n');

  expect(sourceFiles).not.toContain('login_history');
  expect(sourceFiles).not.toContain('loginHistory');
  expect(sourceFiles).not.toContain('clearLoginHistory');
  expect(sourceFiles).not.toContain('showEasyLog');
  expect(source('src/assets/locales/zh-CN.json')).not.toContain('"EasyLog"');
  expect(source('src/assets/locales/zh-CN.json')).not.toContain('login_page.clear_account');
});

test('build script always enables the Tauri production frontend protocol', () => {
  const packageJson = source('package.json');
  const cargoToml = source('src-tauri/Cargo.toml');

  expect(cargoToml).toContain('custom-protocol = [ "tauri/custom-protocol" ]');
  expect(packageJson).toContain('"tauri": "tauri"');
});

test('keeps the update modal background CSS-only', () => {
  const themeSource = source('src/styles/theme.scss');

  expect(themeSource).not.toContain('upgrade-bgc.png');
  expect(themeSource).not.toContain('upgrade-bgc-dark.png');
});

test('uses only woff2 icon font sources in the bundled CSS', () => {
  const iconfontSource = source('src/assets/iconfont/iconfont.css');
  const colorIconfontSource = source('src/assets/iconfontColor/iconfont-color.css');

  for (const cssSource of [iconfontSource, colorIconfontSource]) {
    expect(cssSource).toContain("format('woff2')");
    expect(cssSource).not.toContain("format('woff')");
    expect(cssSource).not.toContain("format('truetype')");
  }
});

test('keeps removed legacy static assets out of the source tree', () => {
  const removedAssets = [
    'src/assets/images/app_layout_bg.png',
    'src/assets/images/upgrade-bgc.png',
    'src/assets/images/upgrade-bgc-dark.png',
    'src/assets/iconfont/iconfont.woff',
    'src/assets/iconfont/iconfont.ttf',
    'src/assets/iconfontColor/iconfont.woff',
    'src/assets/iconfontColor/iconfont.ttf',
  ];

  for (const assetPath of removedAssets) {
    expect(existsSync(join(process.cwd(), assetPath)), assetPath).toBe(false);
  }
});

test('defers non-critical hardware acceleration probing until after first render', () => {
  const mainSource = source('src/main.tsx');
  const setupViewIndex = mainSource.indexOf('setupView();');
  const setupEnvLogIndex = mainSource.indexOf('scheduleHardwareAccelerationLog();');

  expect(setupViewIndex).toBeGreaterThan(-1);
  expect(setupEnvLogIndex).toBeGreaterThan(setupViewIndex);
  expect(mainSource).not.toContain('  setupEnvLog();\n\n  setupServices();');
});

test('fails the production budget when legacy font formats are emitted', () => {
  const budgetSource = source('scripts/check-build-budget.js');

  expect(budgetSource).toContain('legacyFontExtensions');
  expect(budgetSource).toContain("'.woff'");
  expect(budgetSource).toContain("'.ttf'");
  expect(budgetSource).toContain('Use woff2 instead');
});

test('loads the Tauri HTTP plugin only when a request is executed', () => {
  const requestSources = [
    source('src/utils/request/index.ts'),
    source('src/native/tauri/api/request.ts'),
    source('src/utils/base64.ts'),
  ];

  for (const requestSource of requestSources) {
    expect(requestSource).not.toContain('import { fetch');
    expect(requestSource).toContain("import('@tauri-apps/plugin-http')");
  }
});

test('loads low-frequency Tauri shell APIs only when their methods are used', () => {
  const tauriAdapterSource = source('src/native/tauri/index.ts');

  expect(tauriAdapterSource).not.toContain("from '@tauri-apps/api/window'");
  expect(tauriAdapterSource).not.toContain("from '@tauri-apps/api/event'");
  expect(tauriAdapterSource).not.toContain("from '@tauri-apps/plugin-dialog'");
  expect(tauriAdapterSource).toContain("import('@tauri-apps/api/window')");
  expect(tauriAdapterSource).toContain("import('@tauri-apps/api/event')");
  expect(tauriAdapterSource).toContain("import('@tauri-apps/plugin-dialog')");
});

test('keeps Tauri core and filesystem modules out of adapter top-level imports', () => {
  const deferredSources = [
    source('src/native/tauri/utils.ts'),
    source('src/native/tauri/cmd/index.ts'),
    source('src/native/tauri/app_updates/index.ts'),
    source('src/utils/base64.ts'),
  ];

  for (const deferredSource of deferredSources) {
    expect(deferredSource).not.toContain('import { Channel');
    expect(deferredSource).not.toContain('import { invoke');
    expect(deferredSource).not.toContain('import { readFile');
    expect(deferredSource).not.toContain('import { BaseDirectory');
  }

  expect(deferredSources.join('\n')).toContain("import('@tauri-apps/api/core')");
  expect(deferredSources.join('\n')).toContain("import('@tauri-apps/plugin-fs')");
});

test('keeps Tauri core out of startup utility imports', () => {
  const startupUtilitySources = [
    source('src/native/file-src.ts'),
    source('src/utils/invoke/index.ts'),
    source('src/services/invokeServices.ts'),
  ];

  for (const startupUtilitySource of startupUtilitySources) {
    expect(startupUtilitySource).not.toContain('import { invoke');
    expect(startupUtilitySource).not.toContain('import { convertFileSrc');
  }

  expect(startupUtilitySources.join('\n')).toContain("import('@tauri-apps/api/core')");
});

test('uses a Tauri-only native facade at runtime', () => {
  const nativeIndexSource = source('src/native/index.ts');
  const nativeBridgeInterface = source('src/native/interfaces/index.ts');

  expect(existsSync(join(process.cwd(), 'src/native/adapters')), 'native adapters').toBe(false);
  expect(existsSync(join(process.cwd(), 'src/native/adapters/web')), 'web adapter').toBe(false);
  expect(existsSync(join(process.cwd(), 'src/native/adapters/electron')), 'electron adapter').toBe(
    false,
  );
  expect(nativeBridgeInterface).toContain("platform: 'tauri'");
  expect(nativeBridgeInterface).not.toContain("'electron'");
  expect(nativeBridgeInterface).not.toContain("'web'");
  expect(nativeIndexSource).not.toContain('import { TauriAdapter }');
  expect(nativeIndexSource).not.toContain('import { ElectronAdapter }');
  expect(nativeIndexSource).not.toContain('import { WebAdapter }');
  expect(nativeIndexSource).toContain("from './tauri'");
  expect(nativeIndexSource).not.toContain("import('./adapters/electron')");
  expect(nativeIndexSource).not.toContain("import('./adapters/web')");
  expect(nativeIndexSource).not.toContain('./adapters');
  expect(nativeIndexSource).not.toContain('isElectron');
  expect(nativeIndexSource).not.toContain('Environment: Web');
  expect(nativeIndexSource).not.toContain('bridgePromise');
  expect(nativeIndexSource).not.toContain('createLazyBridgeProxy');
  expect(nativeIndexSource).not.toContain('new Proxy');
  expect(source('src/native/interceptor.ts')).not.toContain('createBridgeProxy');
});
