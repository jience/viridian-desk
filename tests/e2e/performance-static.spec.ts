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
  const loginAuthPanelSource = source('src/pages/login/LoginAuthPanel.tsx');
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
  expect(loginAuthPanelSource).toContain('UsernamePwd');

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

test('keeps the login auth panel aligned with the console reference', () => {
  const loginAuthPanelSource = source('src/pages/login/LoginAuthPanel.tsx');
  const usernamePwdSource = source('src/pages/login/UsernamePwd/index.tsx');
  const loginStyles = source('src/pages/login/LoginPage.scss');

  expect(loginAuthPanelSource).toContain('LoginPanelTitle');
  expect(loginAuthPanelSource).toContain('LoginPanelSubtitle');
  expect(loginAuthPanelSource).toContain('auth-page__mode-divider');
  expect(usernamePwdSource).toContain("label={t('login_page.username_label')}");
  expect(usernamePwdSource).toContain("label={t('login_page.password_label')}");
  expect(loginStyles).toContain('grid-template-columns: minmax(0, 0.56fr) minmax(390px, 0.44fr);');
  expect(loginStyles).toContain('width: min(100%, 410px);');
  expect(loginStyles).toContain('min-height: 54px;');
  expect(loginStyles).toContain('height: 54px;');
  expect(loginStyles).toContain('font-size: 26px;');
  expect(loginStyles).toContain('.auth-page__mode-divider');
  expect(loginStyles).not.toContain('min-height: min(760px, calc(100vh - 164px));');
  expect(loginStyles).not.toContain('.auth-page__card::before');
});

test('uses theme-specific brand artwork on the login brand panel', () => {
  const loginBrandPanelSource = source('src/pages/login/LoginBrandPanel.tsx');
  const loginStyles = source('src/pages/login/LoginPage.scss');

  expect(loginBrandPanelSource).toContain('viridian_logo_with_text_dark.svg');
  expect(loginBrandPanelSource).toContain('viridian_logo_with_text_light.svg');
  expect(loginBrandPanelSource).toContain("@/assets/images/viridian_logo_with_text_dark.svg");
  expect(loginBrandPanelSource).toContain("@/assets/images/viridian_logo_with_text_light.svg");
  expect(loginBrandPanelSource).not.toContain('../../../docs/images');
  expect(loginBrandPanelSource).toContain('useUiTheme');
  expect(loginBrandPanelSource).toContain("resolvedTheme === 'dark'");
  expect(loginBrandPanelSource).toContain('auth-page__brand-logo');
  expect(loginBrandPanelSource).not.toContain("import loginLogo from '@/assets/images/logo.svg'");
  expect(loginBrandPanelSource).not.toContain('auth-page__brand-mark');
  expect(loginStyles).toContain('.auth-page__brand-logo');
  expect(loginStyles).toContain('padding: 86px 18px 28px 54px;');
  expect(loginStyles).toContain('width: clamp(420px, 42vw, 620px);');
  expect(loginStyles).not.toContain('.auth-page__brand-mark');
  expect(loginStyles).not.toContain('.auth-page__brand-name');
  expect(loginStyles).not.toContain('.auth-page__logo');
});

test('keeps login hero copy aligned with the visual reference', () => {
  const loginBrandPanelSource = source('src/pages/login/LoginBrandPanel.tsx');
  const loginStyles = source('src/pages/login/LoginPage.scss');
  const zhCNLocale = JSON.parse(source('src/assets/locales/zh-CN.json'));
  const zhTWLocale = JSON.parse(source('src/assets/locales/zh-TW.json'));
  const enUSLocale = JSON.parse(source('src/assets/locales/en-US.json'));

  expect(loginBrandPanelSource).toContain('auth-page__hero-title-accent');
  expect(loginBrandPanelSource).toContain('auth-page__hero-rule');
  expect(loginBrandPanelSource).not.toContain('统一访问桌面');
  expect(loginStyles).toContain('.auth-page__hero-title-accent');
  expect(loginStyles).toContain('.auth-page__hero-rule');
  expect(loginStyles).toContain('padding-top: clamp(20px, 2.8vh, 34px);');
  expect(zhCNLocale.LoginHeroTitle).toBe('安全连接，');
  expect(zhCNLocale.LoginSubTitle).toBe('高效访问工作空间');
  expect(zhTWLocale.LoginHeroTitle).toBe('安全連接，');
  expect(zhTWLocale.LoginSubTitle).toBe('高效訪問工作空間');
  expect(enUSLocale.LoginHeroTitle).toBe('Secure access,');
  expect(enUSLocale.LoginSubTitle).toBe('workspaces without friction');
});

test('uses static product capability cards on the login brand panel', () => {
  const loginBrandPanelSource = source('src/pages/login/LoginBrandPanel.tsx');
  const loginStyles = source('src/pages/login/LoginPage.scss');
  const zhCNLocale = JSON.parse(source('src/assets/locales/zh-CN.json'));
  const zhTWLocale = JSON.parse(source('src/assets/locales/zh-TW.json'));
  const enUSLocale = JSON.parse(source('src/assets/locales/en-US.json'));

  expect(loginBrandPanelSource).toContain('LOGIN_FEATURE_CARDS');
  expect(loginBrandPanelSource).toContain('LoginFeatureSecureTitle');
  expect(loginBrandPanelSource).toContain('LoginFeatureWorkspaceTitle');
  expect(loginBrandPanelSource).toContain('LoginFeatureAssistantTitle');
  expect(loginBrandPanelSource).toContain('icon-lock-o');
  expect(loginBrandPanelSource).toContain('icon-desktop');
  expect(loginBrandPanelSource).toContain("import { Bot } from 'lucide-react';");
  expect(loginBrandPanelSource).toContain("iconType: 'lucide'");
  expect(loginBrandPanelSource).toContain('Icon: Bot');
  expect(loginBrandPanelSource).not.toContain("icon: 'robot'");
  expect(loginBrandPanelSource).not.toContain('icon-c_question-s');
  expect(loginBrandPanelSource).not.toContain('useAppSelector');
  expect(loginBrandPanelSource).not.toContain('selectAutoGateway');
  expect(loginBrandPanelSource).not.toContain('selectConnected');
  expect(loginBrandPanelSource).not.toContain('selectNetwork');
  expect(loginStyles).toContain('grid-template-rows: auto auto minmax(0, 1fr);');
  expect(loginStyles).toContain('align-self: end;');
  expect(loginStyles).toContain('margin-top: clamp(50px, 7vh, 84px);');
  expect(loginStyles).toContain('.auth-page__feature-icon');
  expect(loginStyles).toContain('.auth-page__feature-lucide');
  expect(loginStyles).not.toContain('.auth-page__robot-icon');
  expect(loginStyles).toContain('.auth-page__feature-tag');

  expect(zhCNLocale.LoginFeatureSecureTitle).toBe('安全接入');
  expect(zhCNLocale.LoginFeatureSecureDescription).toBe('可信网关加密访问');
  expect(zhCNLocale.LoginFeatureWorkspaceTitle).toBe('统一工作空间');
  expect(zhCNLocale.LoginFeatureWorkspaceDescription).toBe('桌面、应用统一入口');
  expect(zhCNLocale.LoginFeatureAssistantTitle).toBe('智能辅助');
  expect(zhCNLocale.LoginFeatureAssistantDescription).toBe('助手诊断连接问题');
  expect(zhTWLocale.LoginFeatureSecureTitle).toBe('安全接入');
  expect(zhTWLocale.LoginFeatureSecureDescription).toBe('可信網關加密訪問');
  expect(zhTWLocale.LoginFeatureWorkspaceTitle).toBe('統一工作空間');
  expect(zhTWLocale.LoginFeatureWorkspaceDescription).toBe('桌面、應用統一入口');
  expect(zhTWLocale.LoginFeatureAssistantTitle).toBe('智能輔助');
  expect(zhTWLocale.LoginFeatureAssistantDescription).toBe('助手診斷連接問題');
  expect(enUSLocale.LoginFeatureSecureTitle).toBe('Secure Access');
  expect(enUSLocale.LoginFeatureSecureDescription).toBe('Trusted encrypted access');
  expect(enUSLocale.LoginFeatureWorkspaceTitle).toBe('Unified Workspace');
  expect(enUSLocale.LoginFeatureWorkspaceDescription).toBe('Desktops and apps in one place');
  expect(enUSLocale.LoginFeatureAssistantTitle).toBe('Smart Assistance');
  expect(enUSLocale.LoginFeatureAssistantDescription).toBe('Diagnose connection issues');
});

test('removes deprecated non-local login copy and auth types from the client', () => {
  const removedLocaleKeys = [
    'OtherLoginTip',
    'loginByphone',
    'ForgetPassword',
    'ResetPasswordForPhone',
    'UserPhoneNotExist',
    'ResetPwdSuccessInfo',
    'NisAuthLogin',
    'UserNotFoundByWWQrcode',
    'login_page.domain_required',
    'login_page.domain_placeholder',
    'login_page.org_required',
    'login_page.org_placeholder',
    'login_page.nis_required',
    'login_page.nis_placeholder',
    'login_page.corp_required',
    'login_page.corp_placeholder',
    'login_page.phone_required',
    'login_page.phone_pattern_error',
    'login_page.phone_placeholder',
    'login_page.sms_captcha_required',
    'login_page.sms_captcha_pattern_error',
    'login_page.sms_captcha_placeholder',
    'login_page.sms_resend',
    'login_page.get_sms_captcha',
    'login_page.otp.title',
    'login_page.otp.back',
    'login_page.otp.fill_tip',
    'login_page.otp.open_app_prefix',
    'login_page.otp.scan_btn',
    'login_page.otp.open_app_suffix',
    'login_page.otp.placeholder',
    'login_page.otp.cancel',
    'login_page.otp.confirm',
    'login_page.sms_modal.ok',
    'login_page.sms_modal.placeholder',
    'login_page.sms_modal.get_code',
    'login_page.sms_modal.resend',
    'login_page.sms_modal.error_required',
    'login_page.sms_modal.error_pattern',
    'login_page.slider_verify.text',
    'login_page.scan_login_modal.title',
    'login_page.scan_login_modal.tip',
    'login_page.login_way.domain_user',
    'login_page.login_way.other_user',
    'login_page.login_way.iam',
    'login_page.login_way.nis',
    'error_code.UserNotFoundByWWQrcode',
    'error_code.ListNisServerError',
    'error_code.NisNotFound',
    'error_code.NisServerError',
    'error_code.NisServerRoleError',
    'error_code.NisSetPasswordError',
    'error_code.NisUpdateDatabaseError',
    'error_code.NisUserLoginPermissionError',
  ];
  const localePaths = [
    'src/assets/locales/zh-CN.json',
    'src/assets/locales/zh-TW.json',
    'src/assets/locales/en-US.json',
  ];

  for (const localePath of localePaths) {
    const locale = JSON.parse(source(localePath));
    for (const removedLocaleKey of removedLocaleKeys) {
      expect(locale, `${localePath}:${removedLocaleKey}`).not.toHaveProperty(removedLocaleKey);
    }
  }

  const appSliceSource = source('src/store/feature/app/appSlice.ts');
  const clientSliceSource = source('src/store/feature/client/clientSlice.ts');
  const clientTypesSource = source('src/store/feature/client/types.ts');
  const terminalTypesSource = source('src/native/interfaces/terminal/types.ts');
  const loginHandlerSource = source('src/pages/login/hooks/useLoginHandler.ts');
  const apiTypesSource = source('src/native/interfaces/api/types.ts');
  const loginAuthTypeStart = apiTypesSource.indexOf('export const LoginAuthType');
  const loginAuthTypeBlock = apiTypesSource.slice(
    loginAuthTypeStart,
    apiTypesSource.indexOf('export type UserPolicy', loginAuthTypeStart),
  );
  const loginAuthPath = 'src/native/interfaces/login_auth.ts';
  const removedClientConfigFields = [
    'loginTypes',
    'terminalRememberPasswordSwitch',
    'firstLoginResetPasswordSwitch',
    'oneTimePasswordSwitch',
    'smsResetPasswordSwitch',
    'terminalGraphAuthenticationSwitch',
    'terminalLoginErrorTimes',
    'terminalLoginMeteringMinute',
    'terminalMultiFactorAuthenticationSwitch',
    'terminalPasswordRemainingValidity',
    'terminalPasswordValidDays',
    'terminalStrongPasswordSwitch',
    'warnLoginFromDifferentLocationSwitch',
  ];

  expect(existsSync(join(process.cwd(), loginAuthPath)), loginAuthPath).toBe(false);
  expect(loginAuthTypeBlock).toContain('LoginAuthType');
  expect(loginAuthTypeBlock).toContain('LOCAL');
  expect(loginAuthTypeBlock).not.toContain('DOMAIN');
  expect(loginAuthTypeBlock).not.toContain('CORP');
  expect(loginAuthTypeBlock).not.toContain('IAM');
  expect(loginAuthTypeBlock).not.toContain('NIS');
  expect(loginHandlerSource).toContain('LoginAuthType.LOCAL');
  expect(appSliceSource).not.toContain('currentLoginType');
  expect(appSliceSource).not.toContain('smsResetPasswordSwitch');
  expect(clientSliceSource).not.toContain('selectLoginTypes');
  expect(clientTypesSource).not.toContain('LoginType');
  for (const removedClientConfigField of removedClientConfigFields) {
    expect(clientSliceSource).not.toContain(removedClientConfigField);
    expect(terminalTypesSource).not.toContain(removedClientConfigField);
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

test('starts saved config loading without blocking the lightweight login route', () => {
  const routerSource = source('src/router/index.tsx');
  const configInitSource = source('src/store/feature/config/initState.ts');
  const configSliceSource = source('src/store/feature/config/configSlice.ts');
  const i18nSource = source('src/utils/i18n.ts');
  const preAuthLoaderStart = routerSource.indexOf('const preAuthConfigLoader');
  const preAuthLoaderEnd = routerSource.indexOf('const clientLayoutLoader', preAuthLoaderStart);
  const preAuthLoaderBlock = routerSource.slice(preAuthLoaderStart, preAuthLoaderEnd);

  expect(preAuthLoaderStart).toBeGreaterThanOrEqual(0);
  expect(preAuthLoaderEnd).toBeGreaterThan(preAuthLoaderStart);
  expect(preAuthLoaderBlock).toContain('fetchConfigInfo');
  expect(preAuthLoaderBlock).not.toContain('fetchTerminalInfo');
  expect(preAuthLoaderBlock).not.toContain('await ');
  expect(preAuthLoaderBlock).not.toContain('Promise.all');
  expect(preAuthLoaderBlock).toContain('window.setTimeout');
  expect(preAuthLoaderBlock).toContain('return null');
  expect(configInitSource).toContain('readCachedConfig');
  expect(configSliceSource).toContain('writeCachedConfig');
  expect(i18nSource).toContain('readCachedConfig');
  expect(i18nSource).toContain('lng: cachedLanguage');
  expect(routerSource).toContain('loader: preAuthConfigLoader');
});

test('starts saved gateway selection loading without blocking the lightweight login route', () => {
  const routerSource = source('src/router/index.tsx');
  const preAuthLoaderStart = routerSource.indexOf('const preAuthConfigLoader');
  const preAuthLoaderEnd = routerSource.indexOf('const clientLayoutLoader', preAuthLoaderStart);
  const preAuthLoaderBlock = routerSource.slice(preAuthLoaderStart, preAuthLoaderEnd);

  expect(routerSource).toContain('fetchGatewayList');
  expect(preAuthLoaderBlock).toContain('fetchGatewayList');
  expect(preAuthLoaderBlock).not.toContain('fetchTerminalInfo');
  expect(preAuthLoaderBlock).not.toContain('await ');
  expect(preAuthLoaderBlock).not.toContain('Promise.all');
  expect(preAuthLoaderBlock).toContain('window.setTimeout');
});

test('starts gateway online status loading without blocking the lightweight login route', () => {
  const routerSource = source('src/router/index.tsx');
  const gatewaySource = source('src/store/feature/gateway/gatewaySlice.ts');
  const clientLayoutSource = source('src/layouts/clientLayout/index.tsx');
  const preAuthLoaderStart = routerSource.indexOf('const preAuthConfigLoader');
  const preAuthLoaderEnd = routerSource.indexOf('const clientLayoutLoader', preAuthLoaderStart);
  const preAuthLoaderBlock = routerSource.slice(preAuthLoaderStart, preAuthLoaderEnd);

  expect(gatewaySource).toContain('fetchClientOnlineStatus');
  expect(gatewaySource).toContain('bridge.cmd.getClientOnlineStatus()');
  expect(gatewaySource).toContain('state.connected = action.payload');
  expect(preAuthLoaderBlock).toContain('fetchClientOnlineStatus');
  expect(preAuthLoaderBlock).not.toContain('fetchTerminalInfo');
  expect(preAuthLoaderBlock).not.toContain('await ');
  expect(preAuthLoaderBlock).not.toContain('Promise.all');
  expect(preAuthLoaderBlock).toContain('window.setTimeout');
  expect(clientLayoutSource).toContain('dispatch(fetchClientOnlineStatus())');
});

test('keeps network status synced before authenticated layout loads', () => {
  const appSource = source('src/App.tsx');
  const clientLayoutSource = source('src/layouts/clientLayout/index.tsx');
  const clientLayoutNetworkHookPath = 'src/layouts/clientLayout/useInitState.ts';

  expect(appSource).toContain('setNetwork(navigator.onLine)');
  expect(appSource).toContain("window.addEventListener('online', handleNetworkChange)");
  expect(appSource).toContain("window.addEventListener('offline', handleNetworkChange)");
  expect(clientLayoutSource).not.toContain('useInitState');
  expect(existsSync(join(process.cwd(), clientLayoutNetworkHookPath)), clientLayoutNetworkHookPath)
    .toBe(false);
});

test('keeps thin-client footer actions correct before terminal info loads', () => {
  const footerSource = source('src/components/Footer/index.tsx');
  const viteEnvSource = source('src/@types/vite-env.d.ts');

  expect(footerSource).toContain('TAURI_IS_THIN_CLIENT');
  expect(footerSource).toContain('?? isThinFromEnv');
  expect(viteEnvSource).toContain('TAURI_IS_THIN_CLIENT');
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

test('shows restrained icons on login feature cards', () => {
  const loginBrandPanelSource = source('src/pages/login/LoginBrandPanel.tsx');
  const loginPageStyles = source('src/pages/login/LoginPage.scss');

  expect(loginBrandPanelSource).toContain('auth-page__feature-icon');
  expect(loginBrandPanelSource).toContain('icon-lock-o');
  expect(loginBrandPanelSource).toContain('icon-desktop');
  expect(loginBrandPanelSource).toContain("import { Bot } from 'lucide-react';");
  expect(loginBrandPanelSource).toContain('Icon: Bot');
  expect(loginBrandPanelSource).not.toContain("icon: 'robot'");
  expect(loginBrandPanelSource).not.toContain('icon-c_question-s');
  expect(loginPageStyles).toContain('.auth-page__feature-icon');
  expect(loginPageStyles).toContain('.auth-page__feature-lucide');
  expect(loginPageStyles).not.toContain('.auth-page__robot-icon');
  expect(loginPageStyles).toContain('.auth-page__feature-tag');
  expect(loginPageStyles).toContain('font-size: 17px');
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
  const loginAuthPanelSource = source('src/pages/login/LoginAuthPanel.tsx');

  expect(loginAuthPanelSource).toContain("if (event.key !== 'Enter') return;");
});

test('keeps login enter repeat guard out of React state updates', () => {
  const enterGuardSource = source('src/pages/login/UsernamePwd/usePreventEnterKeyLongPress.ts');

  expect(enterGuardSource).toContain('useRef');
  expect(enterGuardSource).not.toContain('useState');
  expect(enterGuardSource).not.toContain('setIsEnterPressed');
});

test('keeps the login form branch out of gateway status updates', () => {
  const loginAuthPanelSource = source('src/pages/login/LoginAuthPanel.tsx');

  expect(loginAuthPanelSource).toContain('<UsernamePwd formIns={form} />');
  expect(loginAuthPanelSource).not.toContain('LoginFormItems');
});

test('fetches terminal info after login before permission route selection', () => {
  const successHandlerSource = source('src/pages/login/hooks/useLoginSuccessHandler.ts');

  expect(successHandlerSource).toContain('fetchTerminalInfo');
  expect(successHandlerSource).toContain('.unwrap()');
  expect(successHandlerSource).not.toContain('selectIsThin');
});

test('loads terminal info before sending the login request device header', () => {
  const loginHandlerSource = source('src/pages/login/hooks/useLoginHandler.ts');
  const requestSource = source('src/native/tauri/api/request.ts');
  const ensureTerminalStart = loginHandlerSource.indexOf('ensureTerminalReady');
  const loginRequestStart = loginHandlerSource.indexOf('bridge.api.loginUser');

  expect(requestSource).toContain("h['X-Device-Id'] = deviceId");
  expect(loginHandlerSource).toContain('fetchTerminalInfo');
  expect(loginHandlerSource).toContain('selectId');
  expect(ensureTerminalStart).toBeGreaterThanOrEqual(0);
  expect(loginRequestStart).toBeGreaterThan(ensureTerminalStart);
  expect(loginHandlerSource).toContain('await ensureTerminalReady()');
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

test('keeps the login page shell split away from live auth and gateway state', () => {
  const loginPageSource = source('src/pages/login/LoginPage.tsx');
  const loginBrandPanelSource = source('src/pages/login/LoginBrandPanel.tsx');
  const loginAuthPanelSource = source('src/pages/login/LoginAuthPanel.tsx');

  expect(loginPageSource).toContain('LoginBrandPanel');
  expect(loginPageSource).toContain('LoginAuthPanel');
  expect(loginPageSource).not.toContain('useLoginHandler');
  expect(loginPageSource).not.toContain('useAppSelector');
  expect(loginPageSource).not.toContain('selectConnected');
  expect(loginPageSource).not.toContain('selectAutoGateway');
  expect(loginPageSource).not.toContain('Form.useForm');

  expect(loginBrandPanelSource).toContain('memo(');
  expect(loginAuthPanelSource).toContain('memo(');
  expect(loginAuthPanelSource).toContain('<UsernamePwd formIns={form} />');
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

test('defers Tauri feature modules until their methods are used', () => {
  const tauriBridgeSource = source('src/native/tauri/index.ts');

  expect(tauriBridgeSource).not.toContain("from './api'");
  expect(tauriBridgeSource).not.toContain("from './app_updates'");
  expect(tauriBridgeSource).not.toContain("from './cmd'");
  expect(tauriBridgeSource).not.toContain("from './config'");
  expect(tauriBridgeSource).not.toContain("from './terminal'");
  expect(tauriBridgeSource).toContain('createModuleLoader');
  expect(tauriBridgeSource).toContain("import('./api')");
  expect(tauriBridgeSource).toContain("import('./cmd')");
  expect(tauriBridgeSource).toContain("import('./config')");
});

test('loads password crypto only when login work needs it', () => {
  const legacyUtilsSource = source('src/utils/utils.jsx');
  const loginSuccessSource = source('src/pages/login/hooks/useLoginSuccessHandler.ts');
  const apiModuleSource = source('src/native/tauri/api/index.ts');

  expect(legacyUtilsSource).not.toContain('crypto-js');
  expect(loginSuccessSource).not.toContain("from '@/utils/utils'");
  expect(loginSuccessSource).toContain("import('@/utils/passwordCrypto')");
  expect(apiModuleSource).not.toContain("from '@/utils/utils'");
  expect(apiModuleSource).toContain("from '@/utils/passwordCrypto'");
});
