import { expect, test } from '@playwright/test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const readJson = (path: string) => JSON.parse(source(path));
const localeLanguages = ['zh-CN', 'zh-TW', 'en-US'] as const;
const assetLocaleFiles = [
  'core.json',
  'error.json',
  'login.json',
  'settings.json',
  'workspace.json',
];
const stripComments = (content: string) =>
  content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const locale = (language: 'zh-CN' | 'zh-TW' | 'en-US') => {
  const legacyPath = `src/assets/locales/${language}.json`;
  if (existsSync(join(process.cwd(), legacyPath))) {
    return readJson(legacyPath);
  }

  return readdirSync(join(process.cwd(), `src/assets/locales/${language}`))
    .filter((file) => file.endsWith('.json'))
    .sort()
    .reduce(
      (acc, file) => ({
        ...acc,
        ...readJson(`src/assets/locales/${language}/${file}`),
      }),
      {} as Record<string, string>,
    );
};

const uiLocale = (language: 'zh-CN' | 'zh-TW' | 'en-US', namespace: 'common' | 'assistant') =>
  readJson(`src/shared/ui/i18n/locales/${language}/${namespace}.json`);

const collectSourceFiles = (dir: string): string[] =>
  readdirSync(join(process.cwd(), dir), { withFileTypes: true }).flatMap((entry) => {
    const child = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return collectSourceFiles(child);
    return /\.(ts|tsx|js|jsx)$/.test(child) ? [child] : [];
  });

const collectTypeScriptSourceFiles = (dir: string): string[] =>
  collectSourceFiles(dir).filter((file) => /\.(ts|tsx)$/.test(file));

const countExplicitAny = (dir: string) =>
  collectTypeScriptSourceFiles(dir).reduce((count, file) => {
    const content = stripComments(source(file));
    return count + (content.match(/\bany\b/g)?.length ?? 0);
  }, 0);

const collectStaticTranslationKeys = () => {
  const keys = new Set<string>();
  const patterns = [
    /formatMessage\(\{\s*id:\s*['"`]([^'"`$]+)['"`]/g,
    /intl\.formatMessage\(\{\s*id:\s*['"`]([^'"`$]+)['"`]/g,
    /formatI18NKey\(\s*['"`]([^'"`$]+)['"`]/g,
    /\bt\(\s*['"]([^'"]+)['"]/g,
    /i18nKey="([^"]+)"/g,
  ];

  for (const file of collectSourceFiles('src')) {
    const content = stripComments(source(file));
    for (const pattern of patterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content))) {
        keys.add(match[1]);
      }
    }
  }

  return [...keys].sort();
};

const dynamicTranslationKeys = [
  'Attached',
  'ApplySoftware',
  'ApplyDataDisk',
  'ApplyForDesk',
  'ApplyUSB',
  'CANCEL_DEFAULT',
  'ChangeConfig',
  'Error',
  'EXCLUSIVE',
  'LoginFeatureAssistantDescription',
  'LoginFeatureAssistantTag',
  'LoginFeatureAssistantTitle',
  'LoginFeatureSecureDescription',
  'LoginFeatureSecureTag',
  'LoginFeatureSecureTitle',
  'LoginFeatureWorkspaceDescription',
  'LoginFeatureWorkspaceTag',
  'LoginFeatureWorkspaceTitle',
  'PersonalDiskMounted',
  'PersonalDiskUnmounted',
  'RESTORE',
  'ResizeDisk',
  'SET_DEFAULT',
  'SHARE',
  'SendPhoneLable',
  'SUCCESS_DESKTOP_CANCEL_AUTO',
  'SUCCESS_DESKTOP_SET_AUTO',
  'Updating',
  'config_page.about.client_type',
  'config_page.about.client_version',
  'config_page.about.product',
  'config_page.about.product_description',
  'config_page.about.sku',
  'config_page.about.version_info',
  'config_page.about.version_info_description',
  'config_page.advanced_setting.developer_mode_description',
  'config_page.advanced_setting.developer_tools',
  'config_page.advanced_setting.developer_tools_description',
  'config_page.advanced_setting.diagnosis_description',
  'config_page.advanced_setting.network_info_description',
  'config_page.advanced_setting.operations',
  'config_page.advanced_setting.operations_description',
  'config_page.advanced_setting.support_tools',
  'config_page.advanced_setting.support_tools_description',
  'config_page.common_setting.appearance_language',
  'config_page.common_setting.appearance_language_description',
  'config_page.common_setting.preferences',
  'config_page.common_setting.preferences_description',
  'config_page.common_setting.startup_display',
  'config_page.common_setting.startup_display_description',
  'config_page.server_setting.available_gateway',
  'config_page.server_setting.current_gateway',
  'config_page.server_setting.empty_description',
  'config_page.server_setting.empty_title',
  'config_page.server_setting.eyebrow',
  'config_page.server_setting.gateway_count',
  'config_page.server_setting.gateway_count_helper',
  'config_page.server_setting.gateway_list',
  'config_page.server_setting.gateway_list_description',
  'config_page.server_setting.network_available',
  'config_page.server_setting.network_limited',
  'config_page.server_setting.network_state',
  'config_page.server_setting.network_state_helper',
  'config_page.server_setting.no_current_gateway',
  'config_page.server_setting.not_configured',
  'config_page.server_setting.private_network',
  'config_page.server_setting.workbench_description',
  'config_page.server_setting.workbench_title',
  'desktop_status.creating',
  'desktop_status.error',
  'desktop_status.paused',
  'desktop_status.rollingback',
  'desktop_status.snapshotcreating',
  'desktop_status.snapshotdeleting',
  'desktop_status.start',
  'desktop_status.stop',
  'desktop_status.stopretain',
  'desktop_status.unknown',
] as const;

const uiLocaleUsedKeys = {
  common: [
    'actions.close',
    'appName',
    'emptyPage.backToLogin',
    'emptyPage.description',
    'emptyPage.eyebrow',
    'emptyPage.title',
    'errorBoundary.description',
    'errorBoundary.eyebrow',
    'errorBoundary.reload',
    'errorBoundary.title',
    'navigation.application',
    'navigation.approval',
    'navigation.desktop',
    'navigation.desktopIssues',
    'navigation.detail',
    'navigation.empty',
    'navigation.peripheral',
    'status.online',
    'user.personalInformation',
    'user.preferences',
    'user.signOut',
  ],
  assistant: ['quick.connectionHelp', 'quick.openLogs', 'quick.reportFault', 'subtitle', 'title'],
} as const;

const usedTranslationKeySet = () =>
  new Set([...collectStaticTranslationKeys(), ...dynamicTranslationKeys]);

const keysOf = (resource: Record<string, unknown>) => Object.keys(resource).sort();

const untranslatedIdentifierAllowlist = new Set([
  'ABOUT',
  'ACTION',
  'ADD',
  'ADDRESS',
  'CANCEL',
  'CLOSE',
  'DEFAULT',
  'DELETE',
  'DETACH',
  'DETAIL',
  'EMAIL',
  'MINIMIZE',
  'NAME',
  'PHONE',
  'REALNAME',
  'REFRESH',
  'RESTART',
  'SAVE',
  'Server',
  'Terminal',
  'USERNAME',
  'DHCP',
  'PID',
  'VID',
  'VPN',
]);

const looksLikeUntranslatedIdentifier = (key: string, value: string) => {
  if (untranslatedIdentifierAllowlist.has(key)) return false;
  if (!/[A-Za-z0-9]/.test(value)) return false;
  if (/\s|<[^>]+>/.test(value)) return false;
  if (value !== key && !/[a-z][A-Z]|_|\.|:/.test(value)) return false;
  return /[a-z][A-Z]|_|\.|:/.test(value) || /^[A-Z0-9_]{4,}$/.test(value);
};

test('keeps English locale keys aligned with the primary locale', () => {
  const pairs = [
    ['translation', locale('zh-CN'), locale('en-US')],
    ['common', uiLocale('zh-CN', 'common'), uiLocale('en-US', 'common')],
    ['assistant', uiLocale('zh-CN', 'assistant'), uiLocale('en-US', 'assistant')],
  ] as const;

  for (const [namespace, zhCN, enUS] of pairs) {
    const missingKeys = Object.keys(zhCN)
      .filter((key) => !(key in enUS))
      .sort();
    expect(missingKeys, namespace).toEqual([]);
  }
});

test('keeps statically referenced English locale copy translated', () => {
  const enUSLocale = {
    ...locale('en-US'),
    ...uiLocale('en-US', 'common'),
    ...uiLocale('en-US', 'assistant'),
  };
  const keys = collectStaticTranslationKeys();
  const missingKeys = keys.filter((key) => !(key in enUSLocale));
  const untranslatedKeys = keys.filter((key) => {
    const value = enUSLocale[key];
    return typeof value === 'string' && looksLikeUntranslatedIdentifier(key, value);
  });

  expect(missingKeys).toEqual([]);
  expect(untranslatedKeys).toEqual([]);
});

test('keeps locale resources aligned and trimmed to used keys', () => {
  const usedKeys = usedTranslationKeySet();

  for (const language of localeLanguages) {
    const assetKeyOwners = new Map<string, string[]>();

    for (const file of assetLocaleFiles) {
      const resource = readJson(`src/assets/locales/${language}/${file}`);
      const unusedKeys = keysOf(resource).filter(
        (key) => file !== 'error.json' && !usedKeys.has(key),
      );

      for (const key of keysOf(resource)) {
        assetKeyOwners.set(key, [...(assetKeyOwners.get(key) ?? []), file]);
      }

      expect(unusedKeys, `${language}/${file}`).toEqual([]);
    }

    const duplicatedAssetKeys = [...assetKeyOwners.entries()]
      .filter(([, owners]) => owners.length > 1)
      .map(([key, owners]) => `${key}: ${owners.join(', ')}`)
      .sort();

    expect(duplicatedAssetKeys, `${language} duplicated asset locale keys`).toEqual([]);

    for (const namespace of ['common', 'assistant'] as const) {
      const resource = uiLocale(language, namespace);
      const allowedKeys = new Set<string>(uiLocaleUsedKeys[namespace]);
      const unusedKeys = keysOf(resource).filter((key) => !allowedKeys.has(key));
      expect(unusedKeys, `${language}/${namespace}`).toEqual([]);
    }
  }
});

test('keeps locale file key sets aligned across supported languages', () => {
  for (const file of assetLocaleFiles) {
    const primaryKeys = keysOf(readJson(`src/assets/locales/zh-CN/${file}`));
    for (const language of ['zh-TW', 'en-US'] as const) {
      expect(
        keysOf(readJson(`src/assets/locales/${language}/${file}`)),
        `${language}/${file}`,
      ).toEqual(primaryKeys);
    }
  }

  for (const namespace of ['common', 'assistant'] as const) {
    const primaryKeys = keysOf(uiLocale('zh-CN', namespace));
    for (const language of ['zh-TW', 'en-US'] as const) {
      expect(keysOf(uiLocale(language, namespace)), `${language}/${namespace}`).toEqual(
        primaryKeys,
      );
    }
  }
});

test('keeps runtime API error translations on the error_code namespace', () => {
  const legacyRequestErrorHandler = source('src/utils/requestErrorHandler.ts');
  const nativeRequestErrorHandler = source('src/services/requestErrorHandler.ts');
  const createSnapSource = source(
    'src/features/desktop/components/create-snapshot-modal/index.tsx',
  );

  expect(legacyRequestErrorHandler).toContain('`error_code.${errorCode}`');
  expect(legacyRequestErrorHandler).toContain('`error_code.${httpStatus}`');
  expect(legacyRequestErrorHandler).toContain(
    'return translateDynamic(errorMessageKey, { sec: seconds });',
  );
  expect(legacyRequestErrorHandler).not.toContain('formatI18NKey(errorCode');
  expect(legacyRequestErrorHandler).not.toContain('formatI18NKey(res.errorCode');
  expect(nativeRequestErrorHandler).toContain('`error_code.${res.code}`');
  expect(nativeRequestErrorHandler).toContain(
    "t('error_code.LoginErrorTimesExceed', { sec: seconds })",
  );
  expect(nativeRequestErrorHandler).not.toContain(
    "t('error_code.LoginErrorTimesExceed', { sec: minute })",
  );
  expect(createSnapSource).toContain('`error_code.${res.errorCode}`');
  expect(createSnapSource).not.toContain('id: res.errorCode');
});

test('keeps low-frequency modal components lazy-loaded', () => {
  expect(source('src/features/approval/routes/approval-route.tsx')).not.toContain(
    "import Create from './component/create'",
  );
  expect(source('src/features/application/routes/application-route.tsx')).not.toContain(
    "import { AddFromSysModal } from './component/AddFromSysModal'",
  );
  expect(source('src/features/application/routes/application-route.tsx')).not.toContain(
    "import { AddFromSelfModal } from './component/AddFromSelfModal'",
  );
  expect(source('src/features/malfunction/routes/malfunction-route.tsx')).not.toContain(
    "import CreatedModal from './create'",
  );
  expect(source('src/features/desktop/pages/desktop-page.tsx')).not.toContain(
    "import DeskPoolModal from './components/deskPoolDetail'",
  );
});

test('uses mature headless primitives behind the shared ui boundary', () => {
  const packageJson = readJson('package.json') as {
    dependencies?: Record<string, string>;
  };
  const deps = packageJson.dependencies ?? {};
  const modalSource = source('src/shared/ui/modal.tsx');
  const overlaySource = source('src/shared/ui/overlay.tsx');
  const tableSource = source('src/shared/ui/table.tsx');
  const formSource = source('src/shared/ui/form.tsx');
  const selectSource = source('src/shared/ui/select.tsx');
  const dropdownSource = source('src/shared/ui/dropdown.tsx');
  const selectionSource = source('src/shared/ui/selection.tsx');
  const boundaryDependencies = [
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-select',
    '@radix-ui/react-switch',
    '@radix-ui/react-tooltip',
    '@tanstack/react-table',
    '@tanstack/react-virtual',
    'react-hook-form',
  ];

  for (const dep of boundaryDependencies) {
    expect(deps[dep], dep).toBeTruthy();
  }

  expect(modalSource).toContain("from '@radix-ui/react-dialog'");
  expect(modalSource).not.toContain("document.addEventListener('keydown'");
  expect(modalSource).not.toContain('getFocusableElements');

  expect(overlaySource).toContain("from '@radix-ui/react-popover'");
  expect(overlaySource).toContain("from '@radix-ui/react-tooltip'");
  expect(overlaySource).not.toContain("document.addEventListener('pointerdown'");
  expect(overlaySource).not.toContain("document.addEventListener('keydown'");

  expect(tableSource).toContain("from '@tanstack/react-table'");
  expect(tableSource).toContain('getCoreRowModel');

  expect(formSource).toContain("from 'react-hook-form'");
  expect(formSource).toContain('createFormControl');

  expect(selectSource).toContain("from '@radix-ui/react-select'");
  expect(selectSource).toContain('<SelectPrimitive.Root');
  expect(selectSource).not.toContain("document.addEventListener('pointerdown'");

  expect(dropdownSource).toContain("from '@radix-ui/react-dropdown-menu'");
  expect(dropdownSource).toContain('<DropdownMenuPrimitive.Root');
  expect(dropdownSource).not.toContain("document.addEventListener('pointerdown'");
  expect(dropdownSource).not.toContain("document.addEventListener('keydown'");

  expect(selectionSource).toContain("from '@radix-ui/react-switch'");
  expect(selectionSource).toContain('<SwitchPrimitive.Root');

  for (const file of collectSourceFiles('src')) {
    if (file.startsWith('src/shared/ui/')) continue;
    const fileSource = source(file);
    for (const dep of boundaryDependencies) {
      expect(fileSource, `${file} must import ${dep} through @/shared/ui`).not.toContain(dep);
    }
  }
});

test('loads the desk connection overlay only while connecting', () => {
  const deskPageSource = source('src/features/desktop/pages/desktop-page.tsx');

  expect(deskPageSource).not.toContain(
    "import DeskLoading from '@/features/desktop/components/desk-loading'",
  );
  expect(deskPageSource).toContain("import('@/features/desktop/components/desk-loading')");
});

test('loads desk detail modals only when opened', () => {
  const deskDetailSource = source('src/features/desktop/pages/desktop-detail-page.tsx');

  expect(deskDetailSource).not.toContain("import AllDiskListModal from './allDiskListModal'");
  expect(deskDetailSource).not.toContain("import CreateModal from './createSnap'");
  expect(deskDetailSource).toContain("import('../components/all-disk-list-modal')");
  expect(deskDetailSource).toContain("import('../components/create-snapshot-modal')");
});

test('loads application detail modal only when opened', () => {
  const applicationPageSource = source('src/features/application/pages/application-page.tsx');

  expect(applicationPageSource).not.toContain(
    "import { AppDetailModal } from '../components/app-detail-modal'",
  );
  expect(applicationPageSource).toContain("import('../components/app-detail-modal')");
});

test('keeps the login page local-account only', () => {
  const loginPageSource = source('src/features/auth/pages/login-page.tsx');
  const loginAuthPanelSource = source('src/features/auth/components/login-auth-panel.tsx');
  const loginHandlerSource = source('src/features/auth/model/use-login-handler.ts');
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
  expect(loginAuthPanelSource).toContain('<form');

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
  const loginAuthPanelSource = source('src/features/auth/components/login-auth-panel.tsx');
  const loginStyles = source('src/features/auth/pages/login-page.scss');

  expect(loginAuthPanelSource).toContain('LoginPanelTitle');
  expect(loginAuthPanelSource).toContain('LoginPanelSubtitle');
  expect(loginAuthPanelSource).toContain('LocalAuthLogin');
  expect(loginAuthPanelSource).toContain('auth-page__mode-divider');
  expect(loginAuthPanelSource).toContain("formatMessage({ id: 'login_page.username_label' })");
  expect(loginAuthPanelSource).toContain("formatMessage({ id: 'login_page.password_label' })");
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
  const loginBrandPanelSource = source('src/features/auth/components/login-brand-panel.tsx');
  const loginStyles = source('src/features/auth/pages/login-page.scss');

  expect(loginBrandPanelSource).toContain('viridian_logo_with_text_dark.svg');
  expect(loginBrandPanelSource).toContain('viridian_logo_with_text_light.svg');
  expect(loginBrandPanelSource).toContain('@/assets/images/viridian_logo_with_text_dark.svg');
  expect(loginBrandPanelSource).toContain('@/assets/images/viridian_logo_with_text_light.svg');
  expect(loginBrandPanelSource).not.toContain('../../../docs/images');
  expect(loginBrandPanelSource).toContain('useUiTheme');
  expect(loginBrandPanelSource).toContain("resolvedTheme === 'dark'");
  expect(loginBrandPanelSource).toContain('auth-page__brand-logo');
  expect(loginBrandPanelSource).not.toContain("import loginLogo from '@/assets/images/logo.svg'");
  expect(loginBrandPanelSource).not.toContain('auth-page__brand-mark');
  expect(loginStyles).toContain('.auth-page__brand-logo');
  expect(loginStyles).toContain(
    'padding: clamp(42px, 5.8vh, 58px) 18px clamp(20px, 3vh, 28px) 54px;',
  );
  expect(loginStyles).toContain('width: clamp(420px, 42vw, 620px);');
  expect(loginStyles).not.toContain('.auth-page__brand-mark');
  expect(loginStyles).not.toContain('.auth-page__brand-name');
  expect(loginStyles).not.toContain('.auth-page__logo');
});

test('keeps login hero copy aligned with the visual reference', () => {
  const loginBrandPanelSource = source('src/features/auth/components/login-brand-panel.tsx');
  const loginStyles = source('src/features/auth/pages/login-page.scss');
  const zhCNLocale = locale('zh-CN');
  const zhTWLocale = locale('zh-TW');
  const enUSLocale = locale('en-US');

  expect(loginBrandPanelSource).toContain('auth-page__hero-title-accent');
  expect(loginBrandPanelSource).toContain('auth-page__hero-rule');
  expect(loginBrandPanelSource).not.toContain('统一访问桌面');
  expect(loginStyles).toContain('.auth-page__hero-title-accent');
  expect(loginStyles).toContain('.auth-page__hero-rule');
  expect(loginStyles).toContain('align-content: start;');
  expect(loginStyles).toContain('margin-top: clamp(12px, 1.8vh, 20px);');
  expect(zhCNLocale.LoginHeroTitle).toBe('安全连接，');
  expect(zhCNLocale.LoginSubTitle).toBe('高效访问工作空间');
  expect(zhTWLocale.LoginHeroTitle).toBe('安全連接，');
  expect(zhTWLocale.LoginSubTitle).toBe('高效訪問工作空間');
  expect(enUSLocale.LoginHeroTitle).toBe('Secure access,');
  expect(enUSLocale.LoginSubTitle).toBe('workspaces without friction');
});

test('uses static product capability cards on the login brand panel', () => {
  const loginBrandPanelSource = source('src/features/auth/components/login-brand-panel.tsx');
  const loginStyles = source('src/features/auth/pages/login-page.scss');
  const zhCNLocale = locale('zh-CN');
  const zhTWLocale = locale('zh-TW');
  const enUSLocale = locale('en-US');

  expect(loginBrandPanelSource).toContain('LOGIN_FEATURE_CARDS');
  expect(loginBrandPanelSource).toContain('LoginFeatureSecureTitle');
  expect(loginBrandPanelSource).toContain('LoginFeatureWorkspaceTitle');
  expect(loginBrandPanelSource).toContain('LoginFeatureAssistantTitle');
  expect(loginBrandPanelSource).toContain(
    "import { Bot, Monitor, ShieldCheck } from 'lucide-react';",
  );
  expect(loginBrandPanelSource).toContain('Icon: ShieldCheck');
  expect(loginBrandPanelSource).toContain('Icon: Monitor');
  expect(loginBrandPanelSource).toContain('Icon: Bot');
  expect(loginBrandPanelSource).not.toContain("iconType: 'iconfont'");
  expect(loginBrandPanelSource).not.toContain('icon-lock-o');
  expect(loginBrandPanelSource).not.toContain('icon-desktop');
  expect(loginBrandPanelSource).not.toContain("icon: 'robot'");
  expect(loginBrandPanelSource).not.toContain('icon-c_question-s');
  expect(loginBrandPanelSource).not.toContain('useAppSelector');
  expect(loginBrandPanelSource).not.toContain('selectAutoGateway');
  expect(loginBrandPanelSource).not.toContain('selectConnected');
  expect(loginBrandPanelSource).not.toContain('selectNetwork');
  expect(loginStyles).toContain('align-content: center;');
  expect(loginStyles).toContain('grid-template-rows: auto auto auto;');
  expect(loginStyles).toContain('row-gap: clamp(42px, 5.8vh, 56px);');
  expect(loginStyles).toContain('grid-template-rows: auto auto;');
  expect(loginStyles).toContain('margin-top: clamp(12px, 1.8vh, 20px);');
  expect(loginStyles).toContain('margin-top: 0;');
  expect(loginStyles).toContain('@media (min-width: 981px) and (max-height: 780px)');
  expect(loginStyles).toContain('row-gap: clamp(30px, 4.2vh, 38px);');
  expect(loginStyles).not.toContain('align-content: space-between;');
  expect(loginStyles).not.toContain('grid-template-rows: minmax(0, 1fr) auto minmax(0, 1fr);');
  expect(loginStyles).not.toContain('margin-top: clamp(50px, 7vh, 84px);');
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

test('keeps form control focus styles compositor-safe', () => {
  const uiStyles = source('src/shared/ui/styles.scss');
  const settingsStyles = source('src/features/settings/pages/settings-page.scss');
  const approvalStyles = source('src/features/approval/pages/approval-page.scss');
  const malfunctionStyles = source('src/features/malfunction/pages/malfunction-page.scss');
  const snapStyles = source('src/features/desktop/components/create-snapshot-modal/index.scss');
  const appModalStyles = source(
    'src/features/application/components/add-from-sys-modal/index.scss',
  );
  const formTableStyles = source(
    'src/features/settings/components/configuration-form/form-table/index.scss',
  );
  const ipv4Styles = source('src/features/settings/components/configuration-form/ipv4/index.scss');
  expect(uiStyles).not.toContain('box-shadow 180ms ease');
  expect(uiStyles).not.toContain('box-shadow: 0 0 0 2px');
  expect(formTableStyles).not.toContain('box-shadow 160ms ease');
  expect(ipv4Styles).not.toContain('box-shadow 160ms ease');
  expect(settingsStyles).not.toMatch(
    /vdui-input-affix-wrapper-focused[\s\S]{0,180}box-shadow:\s*var\(--settings-page-focus\)/,
  );
  expect(approvalStyles).not.toContain('box-shadow: 0 0 0 2px var(--approval-page-focus)');
  expect(malfunctionStyles).not.toContain('box-shadow: 0 0 0 2px var(--malfunction-page-focus)');
  for (const scopedStyles of [snapStyles, appModalStyles, formTableStyles, ipv4Styles]) {
    expect(scopedStyles).not.toContain('box-shadow: 0 0 0 2px');
  }
});

test('keeps shared form and modal typography readable', () => {
  const uiStyles = source('src/shared/ui/styles.scss');
  const snapStyles = source('src/features/desktop/components/create-snapshot-modal/index.scss');
  const downloadModalStyles = source('src/features/settings/components/download-modal/index.scss');
  const buttonBlock = uiStyles.slice(
    uiStyles.indexOf('.vdui-btn {'),
    uiStyles.indexOf('\n.vdui-btn-primary', uiStyles.indexOf('.vdui-btn {')),
  );
  const controlBlock = uiStyles.slice(
    uiStyles.indexOf('.vdui-input-affix-wrapper,\n.vdui-input,\n.vdui-select {'),
    uiStyles.indexOf('\n.vdui-input-affix-wrapper {'),
  );
  const modalBodyBlock = uiStyles.slice(
    uiStyles.indexOf('.vdui-modal-body {'),
    uiStyles.indexOf('\n.vdui-modal-footer', uiStyles.indexOf('.vdui-modal-body {')),
  );
  const modalFooterBlock = uiStyles.slice(
    uiStyles.indexOf('.vdui-modal-footer {'),
    uiStyles.indexOf(
      '\n.vdui-modal-footer .vdui-btn-primary',
      uiStyles.indexOf('.vdui-modal-footer {'),
    ),
  );

  expect(buttonBlock).toContain('font-size: 14px;');
  expect(buttonBlock).toContain('line-height: 1.2;');
  expect(uiStyles).toContain('.vdui-btn-small {\n  min-height: 28px;');
  expect(uiStyles).not.toContain(
    '.vdui-btn-small {\n  min-height: 28px;\n  padding: 0 10px;\n  font-size: 12px;',
  );
  expect(controlBlock).toContain('font-size: 14px;');
  expect(controlBlock).toContain('line-height: 1.35;');
  expect(uiStyles).toContain('.vdui-input::placeholder');
  expect(uiStyles).toContain('font-size: inherit;');
  expect(uiStyles).toContain('.vdui-select-placeholder {\n  color:');
  expect(uiStyles).toMatch(/\.vdui-select-placeholder \{[\s\S]*font-size:\s*inherit;/);
  expect(modalBodyBlock).toContain('font-size: 14px;');
  expect(modalBodyBlock).toContain('line-height: 1.6;');
  expect(modalFooterBlock).toContain('font-size: 14px;');
  expect(uiStyles).toMatch(/\.vdui-modal-footer \.vdui-btn-primary \{[\s\S]*font-size:\s*14px;/);
  expect(downloadModalStyles).toMatch(/\.update-msg \{[\s\S]*font-size:\s*14px;/);
  expect(downloadModalStyles).toMatch(/\.update-msg \{[\s\S]*line-height:\s*1\.6;/);
  expect(snapStyles).not.toContain('outline: 2px solid var(--desk-detail-modal-accent-soft);');
  expect(snapStyles).toContain('.vdui-input-affix-wrapper:focus-within');
});

test('keeps system prompt surfaces visually unified', () => {
  const confirmPath = 'src/shared/ui/confirm.tsx';
  const hasConfirmModule = existsSync(join(process.cwd(), confirmPath));
  const confirmSource = hasConfirmModule ? source(confirmPath) : '';
  const messageSource = source('src/shared/ui/message.ts');
  const messageStyles = source('src/shared/ui/message.scss');
  const uiStyles = source('src/shared/ui/styles.scss');
  const modalSource = source('src/shared/ui/modal.tsx');
  const fastPath = 'src/shared/ui/fast.tsx';
  const hasFastModule = existsSync(join(process.cwd(), fastPath));
  const fastSource = hasFastModule ? source(fastPath) : '';

  expect(hasConfirmModule, confirmPath).toBe(true);
  expect(modalSource).not.toContain('window.confirm');
  expect(modalSource).toContain("import { showConfirm } from './confirm'");
  if (hasFastModule) {
    expect(fastSource).not.toContain('window.confirm');
    expect(fastSource).toContain("import { showConfirm } from './confirm'");
  }
  expect(confirmSource).toContain("import('react-dom/client')");
  expect(confirmSource).toContain("from '@radix-ui/react-dialog'");
  expect(confirmSource).toContain('<Dialog.Root');
  expect(confirmSource).toContain('role="alertdialog"');
  expect(confirmSource).toContain('className="vdui-modal-footer vdui-confirm-modal__footer"');
  expect(confirmSource).toContain('aria-live="polite"');
  expect(confirmSource).not.toContain("document.addEventListener('keydown'");
  expect(confirmSource).not.toContain('focusableSelector');

  expect(messageSource).toContain("container.setAttribute('role'");
  expect(messageSource).toContain("container.setAttribute('aria-live'");
  expect(messageSource).toContain("icon.className = 'vd-toast__icon'");
  expect(messageSource).toContain("contentNode.className = 'vd-toast__content'");
  expect(messageSource).toContain('--vd-toast-index');
  expect(messageStyles).toContain('.vd-toast__icon');
  expect(messageStyles).toContain('grid-template-columns: 28px minmax(0, 1fr);');
  expect(messageStyles).toContain('--vd-toast-accent');
  expect(messageStyles).toContain('animation: vdToastEnter');
  for (const type of ['success', 'error', 'warning', 'info', 'loading']) {
    expect(messageStyles).toContain(`.vd-toast--${type}`);
  }

  expect(uiStyles).toContain('--vdui-feedback-bg');
  expect(uiStyles).toContain('--vdui-feedback-border');
  expect(uiStyles).toContain('--vdui-feedback-shadow');
  expect(uiStyles).toContain('.vdui-confirm-modal');
  expect(uiStyles).toContain('.vdui-confirm-modal__icon');
});

test('keeps shared ui as the canonical component library boundary', () => {
  const sharedUiRoot = 'src/shared/ui';
  const sharedIndexPath = `${sharedUiRoot}/index.tsx`;
  const legacyUiRootPath = join(process.cwd(), 'src/ui');
  const legacyUiFiles = existsSync(legacyUiRootPath) ? collectSourceFiles('src/ui') : [];

  expect(existsSync(join(process.cwd(), sharedIndexPath)), sharedIndexPath).toBe(true);
  expect(source(sharedIndexPath)).toContain("export { Button, type ButtonProps } from './button'");
  expect(source(`${sharedUiRoot}/button.tsx`)).toContain("import { cn } from '@/shared/ui/lib/cn'");
  expect(source(`${sharedUiRoot}/message.ts`)).toContain("import './message.scss'");
  expect(source(`${sharedUiRoot}/shell/app-shell.tsx`)).toContain('@/shared/ui/lib/cn');
  expect(source(`${sharedUiRoot}/theme/theme-provider.tsx`)).not.toContain('@/ui/');
  expect(legacyUiFiles).toEqual([]);
  expect(source('src/app/App.tsx')).toContain("from '@/shared/ui/theme/theme-provider'");
  expect(source('src/app/router/routes.tsx')).toContain("from '@/shared/ui/shell/error-boundary'");
});

test('keeps shared ui internal modules behind public entrypoints', () => {
  const internalUiImportPattern =
    /@\/shared\/ui\/(?:button|input|select|modal|form|table|display|dropdown|overlay|selection|date-picker|config|components\/button)\b/;
  const allowedComponentEntrypoint = 'src/shared/ui/components/index.ts';

  expect(source(allowedComponentEntrypoint)).toContain(
    "export { Button, type ButtonProps } from './button'",
  );

  for (const file of collectSourceFiles('src')) {
    if (file.startsWith('src/shared/ui/')) continue;
    expect(stripComments(source(file)), file).not.toMatch(internalUiImportPattern);
  }

  expect(source('src/features/settings/pages/settings-page.tsx')).toContain(
    "from '@/shared/ui/components'",
  );
  expect(source('src/features/empty/pages/empty-page.tsx')).toContain(
    "from '@/shared/ui/components'",
  );
});

test('keeps TypeScript escape hatches under tracked frontend budgets', () => {
  const eslintConfig = source('eslint.config.ts');
  const budgets = {
    'src/features': 360,
    'src/shared/ui': 70,
    'src/native': 0,
    'src/services': 0,
    'src/store': 0,
  };

  expect(eslintConfig).toContain("'@typescript-eslint/ban-ts-comment': 'error'");
  expect(eslintConfig).toContain("'@typescript-eslint/no-empty-object-type': 'error'");
  expect(eslintConfig).not.toContain("'@typescript-eslint/ban-ts-comment': 'off'");
  expect(eslintConfig).not.toContain("'@typescript-eslint/no-empty-object-type': 'off'");

  for (const [dir, maxCount] of Object.entries(budgets)) {
    expect(countExplicitAny(dir), dir).toBeLessThanOrEqual(maxCount);
  }
});

test('keeps shell and account feature components out of the shared component bucket', () => {
  const featurePaths = [
    'src/features/shell/components/control-window/index.tsx',
    'src/features/shell/components/footer/index.tsx',
    'src/features/shell/components/gateway-dock/index.tsx',
    'src/features/shell/components/developer-mode-overlay/index.tsx',
    'src/features/shell/components/sidebar/index.tsx',
    'src/features/account/components/account-workbench/index.tsx',
    'src/features/account/components/diff-login-tip/index.tsx',
  ];
  const legacyComponentPaths = [
    'src/components/ControlWindow/index.tsx',
    'src/components/Footer/index.tsx',
    'src/components/LoginGatewayDock/index.tsx',
    'src/components/DeveloperModeOverlay/index.tsx',
    'src/components/Sidebar/index.tsx',
    'src/components/AccountWorkbench/index.tsx',
    'src/components/DiffLoginTip/index.tsx',
    'src/components/ChangePhone/index.tsx',
    'src/components/ComModal/index.jsx',
    'src/components/PwdForm/index.jsx',
    'src/components/UserInfo/index.tsx',
  ];

  for (const featurePath of featurePaths) {
    expect(existsSync(join(process.cwd(), featurePath)), featurePath).toBe(true);
  }

  for (const legacyPath of legacyComponentPaths) {
    expect(existsSync(join(process.cwd(), legacyPath)), legacyPath).toBe(false);
  }

  expect(source('src/app/App.tsx')).toContain(
    "from '@/features/shell/components/developer-mode-overlay'",
  );
  expect(source('src/features/auth/pages/login-page.tsx')).toContain(
    "from '@/features/shell/components/control-window'",
  );
  expect(source('src/features/auth/pages/login-page.tsx')).toContain(
    "from '@/features/shell/components/footer'",
  );
  expect(source('src/features/auth/pages/login-page.tsx')).toContain(
    "from '@/features/shell/components/gateway-dock'",
  );
  expect(source('src/app/layouts/app-layout/index.tsx')).toContain(
    "from '@/features/shell/components/sidebar'",
  );
  expect(source('src/app/layouts/app-layout/index.tsx')).toContain(
    "import('@/features/shell/components/gateway-dock')",
  );
  expect(source('src/features/shell/components/sidebar/index.tsx')).toContain(
    "from '@/features/account/components/account-workbench'",
  );
  expect(source('src/features/shell/components/sidebar/index.tsx')).toContain(
    "import('@/features/account/components/diff-login-tip')",
  );
});

test('keeps remaining desktop and reusable components in explicit feature boundaries', () => {
  const expectedPaths = [
    'src/features/desktop/components/desktop-resource-cards.tsx',
    'src/features/desktop/components/desk-loading/index.tsx',
    'src/features/desktop/components/desk-pool-icon.tsx',
    'src/features/desktop/components/detail-close-icon.tsx',
    'src/features/desktop/components/detail-open-icon.tsx',
    'src/features/peripheral/components/integrated-card/index.tsx',
    'src/features/settings/components/download-modal/index.tsx',
    'src/shared/components/action-dropdown/index.tsx',
    'src/shared/components/data-table/index.tsx',
    'src/shared/components/info-table/index.tsx',
    'src/shared/components/search-bar/index.tsx',
    'src/shared/components/setting-item/index.tsx',
  ];
  const legacyPaths = [
    'src/components/DeskLoading/index.tsx',
    'src/components/Deskpoolsvg.tsx',
    'src/components/Closesvg.tsx',
    'src/components/Opensvg.tsx',
    'src/components/IntegratedCard/index.tsx',
    'src/components/DownloadModal/index.tsx',
    'src/components/Dropdown/index.tsx',
    'src/components/TableCommon/index.tsx',
    'src/components/InfoTable/index.tsx',
    'src/components/SearchBar/index.tsx',
    'src/components/SettingItem/index.tsx',
  ];

  for (const expectedPath of expectedPaths) {
    expect(existsSync(join(process.cwd(), expectedPath)), expectedPath).toBe(true);
  }

  for (const legacyPath of legacyPaths) {
    expect(existsSync(join(process.cwd(), legacyPath)), legacyPath).toBe(false);
  }

  expect(source('src/features/desktop/pages/desktop-page.tsx')).toContain(
    "import('@/features/desktop/components/desk-loading')",
  );
  expect(source('src/features/desktop/components/desktop-resource-cards.tsx')).toContain(
    "from './desk-pool-icon'",
  );
  expect(source('src/features/desktop/pages/desktop-detail-page.tsx')).toContain(
    "from '@/features/desktop/components/detail-close-icon'",
  );
  expect(source('src/features/desktop/pages/desktop-detail-page.tsx')).toContain(
    "from '@/features/desktop/components/detail-open-icon'",
  );
  expect(source('src/features/peripheral/pages/peripheral-page.tsx')).toContain(
    "from '../components/integrated-card'",
  );
  expect(source('src/features/settings/pages/about/VersionInfo/index.tsx')).toContain(
    "from '@/features/settings/components/download-modal'",
  );
  expect(source('src/features/settings/pages/advanced-setting/NetworkInfo/index.tsx')).toContain(
    "from '@/shared/components/info-table'",
  );
  expect(source('src/features/approval/components/approval-detail-modal/index.tsx')).toContain(
    "from '@/shared/components/setting-item'",
  );
  expect(source('src/features/application/components/virtual-app/index.tsx')).toContain(
    "from '@/shared/components/action-dropdown'",
  );
});

test('keeps configuration form controls inside the settings feature', () => {
  const expectedPaths = [
    'src/features/settings/components/configuration-form/index.tsx',
    'src/features/settings/components/configuration-form/form-table/index.tsx',
    'src/features/settings/components/configuration-form/ipv4/index.tsx',
    'src/features/settings/components/configuration-form/ipv4-cidr/index.tsx',
    'src/features/settings/components/configuration-form/ipv6/index.tsx',
    'src/features/settings/components/configuration-form/ipv6-cidr/index.tsx',
    'src/features/settings/components/configuration-form/slider-with-input-number/index.tsx',
  ];
  const legacyPaths = [
    'src/components/ConfigurationForm/index.tsx',
    'src/components/FormTable/index.tsx',
    'src/components/IPv4/index.tsx',
    'src/components/IPv4-cidr/index.tsx',
    'src/components/IPv6/index.tsx',
    'src/components/IPv6-cidr/index.tsx',
    'src/components/SliderWithInputNumber/index.tsx',
    'src/components/ConfigurationForm/formConfigDemo.tsx',
  ];
  const legacyComponentFiles = existsSync(join(process.cwd(), 'src/components'))
    ? collectSourceFiles('src/components')
    : [];

  for (const expectedPath of expectedPaths) {
    expect(existsSync(join(process.cwd(), expectedPath)), expectedPath).toBe(true);
  }

  for (const legacyPath of legacyPaths) {
    expect(existsSync(join(process.cwd(), legacyPath)), legacyPath).toBe(false);
  }

  expect(legacyComponentFiles).toEqual([]);
  expect(source('src/features/settings/components/form-modal/index.tsx')).toContain(
    "from '@/features/settings/components/configuration-form'",
  );
  expect(source('src/features/settings/components/configuration-form/index.tsx')).toContain(
    "from './slider-with-input-number'",
  );
  expect(
    source('src/features/settings/components/configuration-form/form-table/index.tsx'),
  ).toContain("from '../ipv4-cidr'");
});

test('keeps application implementation inside the application feature', () => {
  const expectedPaths = [
    'src/features/application/routes/application-route.tsx',
    'src/features/application/pages/application-page.tsx',
    'src/features/application/pages/application-page.scss',
    'src/features/application/model/init-data.ts',
    'src/features/application/components/add-from-self-modal/index.tsx',
    'src/features/application/components/add-from-sys-modal/index.tsx',
    'src/features/application/components/app-detail-modal/index.tsx',
    'src/features/application/components/app-icon/index.tsx',
    'src/features/application/components/virtual-app/index.tsx',
  ];
  const legacyPaths = [
    'src/pages/application/ApplicationPage.tsx',
    'src/pages/application/ApplicationPage.scss',
    'src/pages/application/initData.ts',
    'src/pages/application/component/AddFromSelfModal/index.tsx',
    'src/pages/application/component/AddFromSysModal/index.tsx',
    'src/pages/application/component/AppDetailModal/index.tsx',
    'src/pages/application/component/AppIcon/index.tsx',
    'src/pages/application/component/VirtualApp/index.tsx',
  ];

  for (const expectedPath of expectedPaths) {
    expect(existsSync(join(process.cwd(), expectedPath)), expectedPath).toBe(true);
  }

  for (const legacyPath of legacyPaths) {
    expect(existsSync(join(process.cwd(), legacyPath)), legacyPath).toBe(false);
  }

  expect(existsSync(join(process.cwd(), 'src/pages/application'))).toBe(false);
  expect(source('src/features/application/routes/application-route.tsx')).toContain(
    "from '../model/init-data'",
  );
  expect(source('src/features/application/pages/application-page.tsx')).toContain(
    "from '../components/app-icon'",
  );
});

test('keeps approval and malfunction implementations inside feature domains', () => {
  const expectedPaths = [
    'src/features/approval/routes/approval-route.tsx',
    'src/features/approval/pages/approval-page.tsx',
    'src/features/approval/pages/approval-page.scss',
    'src/features/approval/model/approval-utils.ts',
    'src/features/approval/components/approval-detail-modal/index.tsx',
    'src/features/approval/components/approval-detail-modal/use-info-table.tsx',
    'src/features/approval/components/icon-with-tooltip/index.tsx',
    'src/features/approval/components/cancel-workflow.tsx',
    'src/features/approval/components/create-workflow.tsx',
    'src/features/malfunction/routes/malfunction-route.tsx',
    'src/features/malfunction/pages/malfunction-page.tsx',
    'src/features/malfunction/pages/malfunction-page.scss',
    'src/features/malfunction/model/init-data.ts',
    'src/features/malfunction/model/types.ts',
    'src/features/malfunction/model/utils.ts',
    'src/features/malfunction/components/create-fault-modal/index.tsx',
    'src/features/malfunction/components/create-fault-modal/base-form.tsx',
  ];
  const legacyPaths = [
    'src/pages/approval/ApprovalPage.tsx',
    'src/pages/approval/ApprovalPage.scss',
    'src/pages/approval/ApprovalDetailModal/index.tsx',
    'src/pages/approval/ApprovalDetailModal/useInfoTable.tsx',
    'src/pages/approval/approvalUtils.ts',
    'src/pages/approval/component/cancel.tsx',
    'src/pages/approval/component/create.tsx',
    'src/pages/approval/component/IconWithTooltip/index.tsx',
    'src/pages/approval/utils.js',
    'src/pages/malfunction/MalfunctionPage.tsx',
    'src/pages/malfunction/MalfunctionPage.scss',
    'src/pages/malfunction/create/BaseForm.tsx',
    'src/pages/malfunction/create/index.tsx',
    'src/pages/malfunction/initData.ts',
    'src/pages/malfunction/types.ts',
    'src/pages/malfunction/utils.ts',
  ];

  for (const expectedPath of expectedPaths) {
    expect(existsSync(join(process.cwd(), expectedPath)), expectedPath).toBe(true);
  }

  for (const legacyPath of legacyPaths) {
    expect(existsSync(join(process.cwd(), legacyPath)), legacyPath).toBe(false);
  }

  expect(existsSync(join(process.cwd(), 'src/pages/approval'))).toBe(false);
  expect(existsSync(join(process.cwd(), 'src/pages/malfunction'))).toBe(false);
  expect(source('src/features/approval/routes/approval-route.tsx')).toContain(
    "from '../model/approval-utils'",
  );
  expect(source('src/features/malfunction/routes/malfunction-route.tsx')).toContain(
    "from '../model/init-data'",
  );
});

test('keeps desktop implementations inside the desktop feature', () => {
  const expectedPaths = [
    'src/features/desktop/routes/desktop-route.tsx',
    'src/features/desktop/routes/desktop-detail-route.tsx',
    'src/features/desktop/pages/desktop-page.tsx',
    'src/features/desktop/pages/desktop-page.scss',
    'src/features/desktop/pages/desktop-detail-page.tsx',
    'src/features/desktop/pages/desktop-detail-page.scss',
    'src/features/desktop/model/use-desk-hooks.tsx',
    'src/features/desktop/model/use-desk-detail.tsx',
    'src/features/desktop/model/use-snap.tsx',
    'src/features/desktop/components/desk-pool-detail/index.tsx',
    'src/features/desktop/components/in-use-loading/index.tsx',
    'src/features/desktop/components/all-disk-list-modal/index.tsx',
    'src/features/desktop/components/create-snapshot-modal/index.tsx',
  ];
  const legacyPaths = [
    'src/pages/desk/DeskPage.tsx',
    'src/pages/desk/DeskPage.scss',
    'src/pages/desk/useDeskHooks.tsx',
    'src/pages/desk/components/deskPoolDetail.tsx',
    'src/pages/desk/components/loading.tsx',
    'src/pages/deskDetail/DeskDetailPage.tsx',
    'src/pages/deskDetail/DeskDetailPage.scss',
    'src/pages/deskDetail/useDeskDetail.tsx',
    'src/pages/deskDetail/useSnap.tsx',
    'src/pages/deskDetail/allDiskListModal/index.tsx',
    'src/pages/deskDetail/createSnap.tsx',
  ];

  for (const expectedPath of expectedPaths) {
    expect(existsSync(join(process.cwd(), expectedPath)), expectedPath).toBe(true);
  }

  for (const legacyPath of legacyPaths) {
    expect(existsSync(join(process.cwd(), legacyPath)), legacyPath).toBe(false);
  }

  expect(existsSync(join(process.cwd(), 'src/pages/desk'))).toBe(false);
  expect(existsSync(join(process.cwd(), 'src/pages/deskDetail'))).toBe(false);
  expect(source('src/app/router/lazy-pages.tsx')).toContain(
    "import('@/features/desktop/routes/desktop-route')",
  );
  expect(source('src/app/router/lazy-pages.tsx')).toContain(
    "import('@/features/desktop/routes/desktop-detail-route')",
  );
});

test('keeps peripheral implementation inside the peripheral feature', () => {
  const expectedPaths = [
    'src/features/peripheral/routes/peripheral-route.tsx',
    'src/features/peripheral/pages/peripheral-page.tsx',
    'src/features/peripheral/pages/peripheral-page.scss',
    'src/features/peripheral/components/integrated-card/index.tsx',
  ];
  const legacyPaths = [
    'src/pages/peripheralSetting/index.scss',
    'src/pages/peripheralSetting/peripheral-page.tsx',
  ];

  for (const expectedPath of expectedPaths) {
    expect(existsSync(join(process.cwd(), expectedPath)), expectedPath).toBe(true);
  }

  for (const legacyPath of legacyPaths) {
    expect(existsSync(join(process.cwd(), legacyPath)), legacyPath).toBe(false);
  }

  expect(existsSync(join(process.cwd(), 'src/pages/peripheralSetting'))).toBe(false);
  expect(source('src/features/peripheral/pages/peripheral-page.tsx')).toContain(
    "from '../components/integrated-card'",
  );
});

test('keeps settings implementation inside the settings feature', () => {
  const expectedPaths = [
    'src/features/settings/routes/settings-route.tsx',
    'src/features/settings/routes/server-setting-route.tsx',
    'src/features/settings/routes/common-setting-route.tsx',
    'src/features/settings/routes/advanced-setting-route.tsx',
    'src/features/settings/routes/about-route.tsx',
    'src/features/settings/pages/settings-page.tsx',
    'src/features/settings/pages/settings-page.scss',
    'src/features/settings/pages/server-setting/index.tsx',
    'src/features/settings/pages/common-setting/index.tsx',
    'src/features/settings/pages/advanced-setting/index.tsx',
    'src/features/settings/pages/about/index.tsx',
    'src/features/settings/components/settings-workbench.tsx',
    'src/features/settings/components/form-modal/index.tsx',
  ];
  const legacyPaths = [
    'src/pages/configPage/SettingsPage.tsx',
    'src/pages/configPage/SettingsPage.scss',
    'src/pages/configPage/components/SettingsWorkbench.tsx',
    'src/pages/configPage/modalComp/FormModal/index.tsx',
    'src/pages/configPage/subPages/serverSetting/index.tsx',
    'src/pages/configPage/subPages/commonSetting/index.tsx',
    'src/pages/configPage/subPages/advancedSetting/index.tsx',
    'src/pages/configPage/subPages/about/index.tsx',
  ];

  for (const expectedPath of expectedPaths) {
    expect(existsSync(join(process.cwd(), expectedPath)), expectedPath).toBe(true);
  }

  for (const legacyPath of legacyPaths) {
    expect(existsSync(join(process.cwd(), legacyPath)), legacyPath).toBe(false);
  }

  expect(existsSync(join(process.cwd(), 'src/pages/configPage'))).toBe(false);
  expect(source('src/features/settings/pages/settings-page.tsx')).toContain(
    "from '../components/form-modal'",
  );
});

test('keeps auth and empty implementations inside feature domains', () => {
  const expectedPaths = [
    'src/features/auth/routes/login-route.tsx',
    'src/features/auth/pages/login-page.tsx',
    'src/features/auth/pages/login-page.scss',
    'src/features/auth/components/login-auth-panel.tsx',
    'src/features/auth/components/login-brand-panel.tsx',
    'src/features/auth/model/use-login-handler.ts',
    'src/features/auth/model/use-login-success-handler.ts',
    'src/features/auth/model/types.ts',
    'src/features/empty/routes/empty-route.tsx',
    'src/features/empty/pages/empty-page.tsx',
    'src/features/empty/pages/empty-page.scss',
  ];
  const legacyPaths = [
    'src/pages/login/LoginPage.tsx',
    'src/pages/login/LoginPage.scss',
    'src/pages/login/LoginAuthPanel.tsx',
    'src/pages/login/LoginBrandPanel.tsx',
    'src/pages/login/UsernamePwd/index.tsx',
    'src/pages/login/hooks/useLoginHandler.ts',
    'src/pages/login/hooks/useLoginSuccessHandler.ts',
    'src/pages/login/types.ts',
    'src/features/auth/components/username-password/index.tsx',
    'src/features/auth/components/username-password/use-prevent-enter-key-long-press.ts',
    'src/pages/empty/EmptyPage.tsx',
    'src/pages/empty/EmptyPage.scss',
  ];

  for (const expectedPath of expectedPaths) {
    expect(existsSync(join(process.cwd(), expectedPath)), expectedPath).toBe(true);
  }

  for (const legacyPath of legacyPaths) {
    expect(existsSync(join(process.cwd(), legacyPath)), legacyPath).toBe(false);
  }

  expect(existsSync(join(process.cwd(), 'src/pages/login'))).toBe(false);
  expect(existsSync(join(process.cwd(), 'src/pages/empty'))).toBe(false);
});

test('keeps app layouts inside the app layer', () => {
  const expectedPaths = [
    'src/app/layouts/app-layout/index.tsx',
    'src/app/layouts/app-layout/index.scss',
    'src/app/layouts/client-layout/index.tsx',
    'src/app/layouts/client-layout/index.scss',
  ];
  const legacyPaths = [
    'src/layouts/AppLayout/index.tsx',
    'src/layouts/AppLayout/index.scss',
    'src/layouts/clientLayout/index.tsx',
    'src/layouts/clientLayout/index.scss',
  ];

  for (const expectedPath of expectedPaths) {
    expect(existsSync(join(process.cwd(), expectedPath)), expectedPath).toBe(true);
  }

  for (const legacyPath of legacyPaths) {
    expect(existsSync(join(process.cwd(), legacyPath)), legacyPath).toBe(false);
  }

  expect(source('src/app/router/lazy-pages.tsx')).toContain("import('@/app/layouts/app-layout')");
  expect(source('src/app/router/lazy-pages.tsx')).toContain(
    "import('@/app/layouts/client-layout')",
  );
  expect(source('src/app/router/lazy-pages.tsx')).not.toContain("import('@/pages/");
  expect(existsSync(join(process.cwd(), 'src/layouts'))).toBe(false);
  expect(existsSync(join(process.cwd(), 'src/pages'))).toBe(false);
});

test('removes deprecated non-local login copy and auth types from the client', () => {
  const removedLocaleKeys = [
    'OtherLoginTip',
    'loginByphone',
    'ForgetPassword',
    'ResetPasswordForPhone',
    'UserPhoneNotExist',
    'ResetPwdSuccessInfo',
    'DomainAuthLogin',
    'CorpAuthLogin',
    'IamAuthLogin',
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
    'login_page.login_way.local_user',
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
  for (const language of ['zh-CN', 'zh-TW', 'en-US'] as const) {
    const currentLocale = locale(language);
    for (const removedLocaleKey of removedLocaleKeys) {
      expect(currentLocale, `${language}:${removedLocaleKey}`).not.toHaveProperty(removedLocaleKey);
    }
    expect(currentLocale, `${language}:LocalAuthLogin`).toHaveProperty('LocalAuthLogin');
  }

  const appSliceSource = source('src/store/feature/app/appSlice.ts');
  const clientSliceSource = source('src/store/feature/client/clientSlice.ts');
  const clientTypesSource = source('src/store/feature/client/types.ts');
  const terminalTypesSource = source('src/native/interfaces/terminal/types.ts');
  const loginHandlerSource = source('src/features/auth/model/use-login-handler.ts');
  const loginAuthPanelSource = source('src/features/auth/components/login-auth-panel.tsx');
  const loginStylesSource = source('src/features/auth/pages/login-page.scss');
  const sidebarSource = source('src/features/shell/components/sidebar/index.tsx');
  const apiTypesSource = source('src/native/interfaces/api/types.ts');
  const loginAuthTypeStart = apiTypesSource.indexOf('export const LoginAuthType');
  const loginAuthTypeBlock = apiTypesSource.slice(
    loginAuthTypeStart,
    apiTypesSource.indexOf('export type UserPolicy', loginAuthTypeStart),
  );
  const loginUserTypeStart = apiTypesSource.indexOf('export const LoginUserType');
  const loginUserTypeBlock = apiTypesSource.slice(
    loginUserTypeStart,
    apiTypesSource.indexOf('export const LoginAuthType', loginUserTypeStart),
  );
  const loginAuthPath = 'src/native/interfaces/login_auth.ts';
  const removedLegacyLoginPaths = [
    'src/native/interfaces/login_history',
    'src/native/tauri/login_history',
    'src/pages/login/component',
    'docs/superpowers/plans/2026-05-14-frontend-redesign-phase-2-auth-settings.md',
  ];
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
  expect(loginUserTypeBlock).toContain('LoginUserType');
  expect(loginUserTypeBlock).toContain('LOCAL');
  expect(loginUserTypeBlock).not.toContain('CORP');
  expect(loginUserTypeBlock).not.toContain('DOMAIN');
  expect(loginHandlerSource).toContain('LoginAuthType.LOCAL');
  expect(loginAuthPanelSource).toContain('LocalAuthLogin');
  expect(loginAuthPanelSource).toContain('auth-page__mode-divider');
  expect(loginStylesSource).toContain('.auth-page__mode-divider');
  expect(sidebarSource).not.toContain('LoginUserType.CORP');
  expect(sidebarSource).not.toContain('LoginUserType.DOMAIN');
  expect(appSliceSource).not.toContain('currentLoginType');
  expect(appSliceSource).not.toContain('smsResetPasswordSwitch');
  expect(clientSliceSource).not.toContain('selectLoginTypes');
  expect(clientTypesSource).not.toContain('LoginType');
  for (const removedClientConfigField of removedClientConfigFields) {
    expect(clientSliceSource).not.toContain(removedClientConfigField);
    expect(terminalTypesSource).not.toContain(removedClientConfigField);
  }
  for (const removedLegacyLoginPath of removedLegacyLoginPaths) {
    expect(existsSync(join(process.cwd(), removedLegacyLoginPath)), removedLegacyLoginPath).toBe(
      false,
    );
  }
});

test('keeps login route outside the authenticated client layout', () => {
  const routesSource = source('src/app/router/routes.tsx');
  const clientLayoutBlockStart = routesSource.indexOf('element: <ClientLayout />');
  const clientLayoutBlock = routesSource.slice(clientLayoutBlockStart);

  expect(routesSource).toContain("path: 'login'");
  expect(routesSource).toContain('element: routeElement(<LoginPage />)');
  expect(clientLayoutBlock).not.toContain("path: 'login'");
  expect(clientLayoutBlock).not.toContain('<LoginPage />');
});

test('starts saved config loading without blocking the lightweight login route', () => {
  const bootstrapSource = source('src/app/router/bootstrap.ts');
  const routesSource = source('src/app/router/routes.tsx');
  const configInitSource = source('src/store/feature/config/initState.ts');
  const configSliceSource = source('src/store/feature/config/configSlice.ts');
  const i18nSource = source('src/utils/i18n.ts');
  const preAuthLoaderStart = bootstrapSource.indexOf('export const preAuthConfigLoader');
  const preAuthLoaderEnd = bootstrapSource.indexOf(
    'export const clientLayoutLoader',
    preAuthLoaderStart,
  );
  const preAuthLoaderBlock = bootstrapSource.slice(preAuthLoaderStart, preAuthLoaderEnd);

  expect(preAuthLoaderStart).toBeGreaterThanOrEqual(0);
  expect(preAuthLoaderEnd).toBeGreaterThan(preAuthLoaderStart);
  expect(preAuthLoaderBlock).toContain('fetchTerminalInfo');
  expect(preAuthLoaderBlock).toContain('fetchConfigInfo');
  expect(preAuthLoaderBlock).not.toContain('await ');
  expect(preAuthLoaderBlock).not.toContain('Promise.all');
  expect(preAuthLoaderBlock).toContain('scheduleAfterFirstPaint');
  expect(preAuthLoaderBlock).toContain('scheduleWhenIdle');
  expect(preAuthLoaderBlock).toContain('return null');
  expect(configInitSource).toContain('readCachedConfig');
  expect(configSliceSource).toContain('writeCachedConfig');
  expect(i18nSource).toContain('readCachedConfig');
  expect(i18nSource).toContain('lng: cachedLanguage');
  expect(routesSource).toContain('loader: preAuthConfigLoader');
});

test('starts saved gateway selection loading without blocking the lightweight login route', () => {
  const bootstrapSource = source('src/app/router/bootstrap.ts');
  const preAuthLoaderStart = bootstrapSource.indexOf('export const preAuthConfigLoader');
  const preAuthLoaderEnd = bootstrapSource.indexOf(
    'export const clientLayoutLoader',
    preAuthLoaderStart,
  );
  const preAuthLoaderBlock = bootstrapSource.slice(preAuthLoaderStart, preAuthLoaderEnd);

  expect(bootstrapSource).toContain('fetchGatewayList');
  expect(preAuthLoaderBlock).toContain('fetchGatewayList');
  expect(preAuthLoaderBlock).toContain('fetchTerminalInfo');
  expect(preAuthLoaderBlock).not.toContain('await ');
  expect(preAuthLoaderBlock).not.toContain('Promise.all');
  expect(preAuthLoaderBlock).toContain('scheduleAfterFirstPaint');
});

test('starts gateway online status loading without blocking the lightweight login route', () => {
  const bootstrapSource = source('src/app/router/bootstrap.ts');
  const gatewaySource = source('src/store/feature/gateway/gatewaySlice.ts');
  const clientLayoutSource = source('src/app/layouts/client-layout/index.tsx');
  const preAuthLoaderStart = bootstrapSource.indexOf('export const preAuthConfigLoader');
  const preAuthLoaderEnd = bootstrapSource.indexOf(
    'export const clientLayoutLoader',
    preAuthLoaderStart,
  );
  const preAuthLoaderBlock = bootstrapSource.slice(preAuthLoaderStart, preAuthLoaderEnd);
  const clientLayoutLoaderStart = bootstrapSource.indexOf('export const clientLayoutLoader');
  const clientLayoutLoaderEnd = bootstrapSource.indexOf(
    'function scheduleAuthenticatedClientBootstrap',
    clientLayoutLoaderStart,
  );
  const clientLayoutLoaderBlock = bootstrapSource.slice(
    clientLayoutLoaderStart,
    clientLayoutLoaderEnd,
  );
  const authenticatedBootstrapBlock = bootstrapSource.slice(clientLayoutLoaderStart);

  expect(gatewaySource).toContain('fetchClientOnlineStatus');
  expect(gatewaySource).toContain('bridge.cmd.getClientOnlineStatus()');
  expect(gatewaySource).toContain('state.connected = action.payload');
  expect(preAuthLoaderBlock).toContain('fetchClientOnlineStatus');
  expect(preAuthLoaderBlock).toContain('fetchTerminalInfo');
  expect(preAuthLoaderBlock).not.toContain('await ');
  expect(preAuthLoaderBlock).not.toContain('Promise.all');
  expect(preAuthLoaderBlock).toContain('scheduleWhenIdle');
  expect(clientLayoutLoaderBlock).toContain('scheduleAuthenticatedClientBootstrap');
  expect(authenticatedBootstrapBlock).toContain('fetchClientOnlineStatus');
  expect(clientLayoutSource).not.toContain('dispatch(fetchClientOnlineStatus())');
});

test('keeps network status synced before authenticated layout loads', () => {
  const appSource = source('src/app/App.tsx');
  const clientLayoutSource = source('src/app/layouts/client-layout/index.tsx');
  const clientLayoutNetworkHookPath = 'src/app/layouts/client-layout/useInitState.ts';

  expect(appSource).toContain('setNetwork(navigator.onLine)');
  expect(appSource).toContain("window.addEventListener('online', handleNetworkChange)");
  expect(appSource).toContain("window.addEventListener('offline', handleNetworkChange)");
  expect(clientLayoutSource).not.toContain('useInitState');
  expect(
    existsSync(join(process.cwd(), clientLayoutNetworkHookPath)),
    clientLayoutNetworkHookPath,
  ).toBe(false);
});

test('keeps thin-client footer actions correct before terminal info loads', () => {
  const footerSource = source('src/features/shell/components/footer/index.tsx');
  const viteEnvSource = source('src/@types/vite-env.d.ts');

  expect(footerSource).toContain('TAURI_IS_THIN_CLIENT');
  expect(footerSource).toContain('?? isThinFromEnv');
  expect(viteEnvSource).toContain('TAURI_IS_THIN_CLIENT');
});

test('keeps login window controls local to the lightweight login route', () => {
  const loginPageSource = source('src/features/auth/pages/login-page.tsx');
  const loginPageStyles = source('src/features/auth/pages/login-page.scss');

  expect(loginPageSource).toContain(
    "import ControlWindow from '@/features/shell/components/control-window'",
  );
  expect(loginPageSource).toContain('auth-page__drag-region');
  expect(loginPageSource).toContain('<ControlWindow />');
  expect(loginPageStyles).toContain('.auth-page__controls');
});

test('surfaces developer mode as a global desktop state', () => {
  const overlayPath = 'src/features/shell/components/developer-mode-overlay/index.tsx';
  const overlayStylePath = 'src/features/shell/components/developer-mode-overlay/index.scss';
  const appSource = source('src/app/App.tsx');
  const footerSource = source('src/features/shell/components/footer/index.tsx');
  const overlaySource = source(overlayPath);
  const overlayStyles = source(overlayStylePath);
  const zhCNLogin = source('src/assets/locales/zh-CN/login.json');
  const zhTWLogin = source('src/assets/locales/zh-TW/login.json');
  const enUSLogin = source('src/assets/locales/en-US/login.json');

  expect(existsSync(join(process.cwd(), overlayPath)), overlayPath).toBe(true);
  expect(existsSync(join(process.cwd(), overlayStylePath)), overlayStylePath).toBe(true);
  expect(appSource).toContain(
    "import { DeveloperModeOverlay } from '@/features/shell/components/developer-mode-overlay'",
  );
  expect(appSource).toContain('<DeveloperModeOverlay />');
  expect(overlaySource).toContain('selectDeveloperMode');
  expect(overlaySource).toContain('developer-mode-overlay__strip');
  expect(overlaySource).toContain('developer-mode-overlay__badge');
  expect(overlaySource).toContain('developer-mode-overlay__toast');
  expect(overlaySource).toContain('developer-mode-overlay__watermark');
  expect(overlaySource).toContain("t('login_page.developer_mode_enabled')");
  expect(overlaySource).toContain("t('login_page.developer_mode_badge')");
  expect(overlaySource).toContain("t('login_page.developer_mode_toast_description')");
  expect(overlayStyles).toContain('position: fixed;');
  expect(overlayStyles).toContain('height: 4px;');
  expect(overlayStyles).toContain('--developer-mode-accent: #f6b84b;');
  expect(overlayStyles).toContain('pointer-events: none;');
  expect(overlayStyles).toContain('DEV MODE');
  expect(footerSource).not.toContain('login-footer__developer');
  expect(footerSource).not.toContain('selectDeveloperMode');
  expect(zhCNLogin).toContain('"login_page.developer_mode_badge": "开发者模式"');
  expect(zhTWLogin).toContain('"login_page.developer_mode_badge": "開發者模式"');
  expect(enUSLogin).toContain('"login_page.developer_mode_badge": "Developer Mode"');
});

test('keeps viewport rem scaling available before authenticated layout loads', () => {
  const viewportScalePath = 'src/utils/setupViewportScale.ts';
  const appSource = source('src/app/App.tsx');
  const clientLayoutSource = source('src/app/layouts/client-layout/index.tsx');

  expect(existsSync(join(process.cwd(), viewportScalePath)), viewportScalePath).toBe(true);
  expect(appSource).toContain('setupViewportScale');
  expect(clientLayoutSource).not.toContain('docEl.clientWidth / 12');
  expect(clientLayoutSource).not.toContain('setBodyFontSize');
});

test('keeps the login typing path free of expensive live filters', () => {
  const loginCriticalStyles = [
    source('src/features/auth/pages/login-page.scss'),
    source('src/features/shell/components/gateway-dock/index.scss'),
  ].join('\n');

  expect(loginCriticalStyles).not.toContain('backdrop-filter');
  expect(loginCriticalStyles).not.toContain('mask-image');
  expect(loginCriticalStyles).not.toContain('filter:');
});

test('keeps the login page hero and footer controls minimal', () => {
  const loginPageSource = source('src/features/auth/pages/login-page.tsx');
  const loginPageStyles = source('src/features/auth/pages/login-page.scss');
  const footerSource = source('src/features/shell/components/footer/index.tsx');
  const footerStyles = source('src/features/shell/components/footer/index.scss');

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
  const serverSettingSource = source('src/features/settings/pages/server-setting/index.tsx');
  const serverSettingStyles = source('src/features/settings/pages/server-setting/index.scss');
  const dropdownSource = source('src/shared/ui/dropdown.tsx');
  const uiStyles = source('src/shared/ui/styles.scss');

  expect(serverSettingSource).toContain('gatewayList.map((g, index)');
  expect(serverSettingSource).toContain(
    "placement={index === gatewayList.length - 1 ? 'topRight' : 'bottomRight'}",
  );
  expect(serverSettingStyles).toContain('.vd-settings-group__content');
  expect(serverSettingStyles).toContain('overflow: visible');
  expect(dropdownSource).toContain('`vdui-dropdown--${placement}`');
  expect(uiStyles).toContain('.vdui-dropdown--topRight');
  expect(uiStyles).toContain('bottom: calc(100% + 8px)');
});

test('shows restrained icons on login feature cards', () => {
  const loginBrandPanelSource = source('src/features/auth/components/login-brand-panel.tsx');
  const loginPageStyles = source('src/features/auth/pages/login-page.scss');

  expect(loginBrandPanelSource).toContain('auth-page__feature-icon');
  expect(loginBrandPanelSource).toContain(
    "import { Bot, Monitor, ShieldCheck } from 'lucide-react';",
  );
  expect(loginBrandPanelSource).toContain('Icon: ShieldCheck');
  expect(loginBrandPanelSource).toContain('Icon: Monitor');
  expect(loginBrandPanelSource).toContain('Icon: Bot');
  expect(loginBrandPanelSource).not.toContain('icon-lock-o');
  expect(loginBrandPanelSource).not.toContain('icon-desktop');
  expect(loginBrandPanelSource).not.toContain("icon: 'robot'");
  expect(loginBrandPanelSource).not.toContain('icon-c_question-s');
  expect(loginPageStyles).toContain('.auth-page__feature-icon');
  expect(loginPageStyles).toContain('.auth-page__feature-lucide');
  expect(loginPageStyles).not.toContain('.auth-page__robot-icon');
  expect(loginPageStyles).toContain('.auth-page__feature-tag');
  expect(loginPageStyles).toContain('width: 18px');
  expect(loginPageStyles).toContain('height: 18px');
});

test('keeps the login shell cheap to repaint on low-power devices', () => {
  const loginStyles = source('src/features/auth/pages/login-page.scss');

  expect(loginStyles).not.toContain('radial-gradient');
  expect(loginStyles).not.toContain('background-size: 34px 34px');
  expect(loginStyles).not.toContain('.auth-page__window::before');
});

test('keeps login input focus styles cheap to repaint while typing', () => {
  const loginStyles = source('src/features/auth/pages/login-page.scss');

  expect(loginStyles).not.toContain('box-shadow 180ms ease');
  expect(loginStyles).not.toContain('box-shadow: 0 0 0 3px');
  expect(loginStyles).not.toContain(
    'outline: 2px solid color-mix(in srgb, var(--auth-accent) 28%, transparent)',
  );
  expect(loginStyles).not.toContain('outline-offset: 1px');
  expect(loginStyles).toContain(
    'border-color: color-mix(in srgb, var(--auth-accent) 42%, transparent);',
  );
});

test('keeps modal and login input focus rings single-layered', () => {
  const loginStyles = source('src/features/auth/pages/login-page.scss');
  const publishAppModalStyles = source(
    'src/features/application/components/add-from-self-modal/index.scss',
  );
  const uiStyles = source('src/shared/ui/styles.scss');
  const inputAffixWrapperStart = uiStyles.indexOf('.vdui-input-affix-wrapper {');
  const inputAffixWrapperBlock = uiStyles.slice(
    inputAffixWrapperStart,
    uiStyles.indexOf('\n.vdui-input,', inputAffixWrapperStart),
  );

  expect(loginStyles).toContain('.auth-page__input-shell');
  expect(loginStyles).toContain('&:focus-within');
  expect(loginStyles).toContain('.auth-page__input');
  expect(loginStyles).toContain('outline: 0;');
  expect(loginStyles).not.toContain('.vdui-input-affix-wrapper .vdui-input:focus');
  expect(publishAppModalStyles).not.toContain('.vdui-input');
  expect(publishAppModalStyles).not.toContain('.vdui-select');
  expect(publishAppModalStyles).not.toContain('--app-modal-accent');
  expect(publishAppModalStyles).not.toContain('--app-modal-surface-subtle');
  expect(inputAffixWrapperBlock).not.toContain('&:hover');
  expect(inputAffixWrapperBlock).toContain('&:focus-within');
});

test('keeps modal close button icon centered during hover', () => {
  const uiStyles = source('src/shared/ui/styles.scss');
  const closeButtonStart = uiStyles.indexOf('.vdui-modal-close {');
  const closeButtonBlock = uiStyles.slice(
    closeButtonStart,
    uiStyles.indexOf('\n.vdui-modal-body', closeButtonStart),
  );

  expect(closeButtonStart).toBeGreaterThanOrEqual(0);
  expect(closeButtonBlock).toContain('display: inline-flex;');
  expect(closeButtonBlock).toContain('align-items: center;');
  expect(closeButtonBlock).toContain('justify-content: center;');
  expect(closeButtonBlock).toContain('position: absolute;');
  expect(closeButtonBlock).toContain('top: 50%;');
  expect(closeButtonBlock).toContain('left: 50%;');
  expect(closeButtonBlock).toContain('transform: translate(-50%, -50%) rotate(45deg);');
  expect(closeButtonBlock).toContain('transform: translate(-50%, -50%) rotate(-45deg);');
  expect(closeButtonBlock).toContain('transform: none;');
  expect(closeButtonBlock).not.toContain('transform: translateY(-1px);');
});

test('keeps the main Tauri window opaque for low-power Linux compositors', () => {
  const tauriConfig = source('src-tauri/tauri.conf.json');

  expect(tauriConfig).not.toContain('"transparent": true');
  expect(tauriConfig).toContain('"transparent": false');
});

test('notifies only changed form fields while typing', () => {
  const formSource = source('src/shared/ui/form.tsx');

  expect(formSource).toContain('fieldListeners');
  expect(formSource).toContain('notifyField');
  expect(formSource).toContain('_subscribeField');
  expect(formSource).not.toContain('form._subscribe?.(() => force((value) => value + 1))');
});

test('does not keep ignored AntD form layout props in the shared form API', () => {
  const formSource = source('src/shared/ui/form.tsx');
  const formPropsStart = formSource.indexOf('interface FormProps');
  const formPropsEnd = formSource.indexOf('\ninterface FormItemProps', formPropsStart);
  const formPropsSource = formSource.slice(formPropsStart, formPropsEnd);
  const formComponentStart = formSource.indexOf('function FormComponent');
  const formComponentEnd = formSource.indexOf('\n  } as FormComponentType', formComponentStart);
  const formComponentSource = formSource.slice(formComponentStart, formComponentEnd);

  for (const propName of ['colon', 'labelCol', 'labelAlign', 'wrapperCol', 'requiredMark']) {
    expect(formPropsSource).not.toContain(`${propName}?:`);
    expect(formComponentSource).not.toContain(`${propName}: _${propName}`);
  }
});

test('does not keep unused AntD select and config-provider compatibility APIs', () => {
  const selectTypesSource = source('src/shared/ui/types.ts');
  const selectSource = source('src/shared/ui/select.tsx');
  const sharedUiIndexSource = source('src/shared/ui/index.tsx');
  const configSource = source('src/shared/ui/config.tsx');
  const selectPropsStart = selectTypesSource.indexOf('export type SelectProps');
  const selectPropsEnd = selectTypesSource.indexOf('\nexport type ItemType', selectPropsStart);
  const selectPropsSource = selectTypesSource.slice(selectPropsStart, selectPropsEnd);

  for (const propName of [
    'allowClear',
    'getPopupContainer',
    'popupClassName',
    'showSearch',
    'filterOption',
  ]) {
    expect(selectTypesSource).not.toContain(`${propName}?:`);
  }

  expect(selectPropsSource).not.toContain('children?:');
  expect(selectSource).not.toContain('Option:');
  expect(selectSource).not.toContain('readOptions');
  expect(selectSource).not.toContain('props.children');
  expect(selectSource).not.toContain('export function AutoComplete');
  expect(selectSource).not.toContain('export const TreeSelect');
  expect(sharedUiIndexSource).not.toContain('AutoComplete');
  expect(sharedUiIndexSource).not.toContain('TreeSelect');
  expect(sharedUiIndexSource).not.toContain('ConfigProvider');
  expect(configSource).not.toContain('ConfigProvider');
  expect(configSource).not.toContain('ConfigContext');
});

test('does not keep legacy AntD modal visibility aliases', () => {
  const modalSource = source('src/shared/ui/modal.tsx');

  expect(modalSource).not.toContain('visible?:');
  expect(modalSource).not.toContain('props.visible');
  expect(modalSource).not.toContain('destroyOnHidden');
  expect(modalSource).not.toContain('destroyOnClose');
});

test('keeps textarea native value props mutually exclusive', () => {
  const inputSource = source('src/shared/ui/input.tsx');
  const textAreaStart = inputSource.indexOf('InputBase.TextArea = forwardRef');
  const textAreaEnd = inputSource.indexOf('\nInputBase.Search', textAreaStart);
  const textAreaSource = inputSource.slice(textAreaStart, textAreaEnd);

  expect(textAreaSource).toContain('value: textAreaValue');
  expect(textAreaSource).toContain('defaultValue: textAreaDefaultValue');
  expect(textAreaSource).toContain('nativeValueProps');
  expect(textAreaSource).toMatch(
    /textAreaValue !== undefined[\s\S]*\? \{ value: textAreaValue \}[\s\S]*: \{ defaultValue: textAreaDefaultValue \}/,
  );
  expect(textAreaSource).toMatch(/\.{3}nativeValueProps[\s\S]*\.{3}props/);
});

test('allows login text fields to avoid controlled React value writes while typing', () => {
  const formSource = source('src/shared/ui/form.tsx');
  const loginAuthPanelSource = source('src/features/auth/components/login-auth-panel.tsx');

  expect(formSource).toContain('liveValue?: boolean');
  expect(formSource).toContain('_setFieldValueSilently');
  expect(formSource).toContain('defaultValue');
  expect(loginAuthPanelSource).toContain('useRef<HTMLFormElement');
  expect(loginAuthPanelSource).toContain('new FormData(formRef.current)');
  expect(loginAuthPanelSource).toContain('name="loginName"');
  expect(loginAuthPanelSource).toContain('name="password"');
  expect(loginAuthPanelSource).not.toContain('value={');
  expect(loginAuthPanelSource).not.toContain('Form.useForm');
  expect(loginAuthPanelSource).not.toContain('validateFields');
  expect(loginAuthPanelSource).not.toContain('UsernamePwd');
  expect(existsSync(join(process.cwd(), 'src/pages/login/UsernamePwd')), 'UsernamePwd').toBe(false);
});

test('keeps login key handling off the per-character DOM query path', () => {
  const loginAuthPanelSource = source('src/features/auth/components/login-auth-panel.tsx');

  expect(loginAuthPanelSource).toContain('onSubmit={handleSubmit}');
  expect(loginAuthPanelSource).not.toContain("document.addEventListener('keydown'");
  expect(loginAuthPanelSource).not.toContain('closest(');
});

test('keeps login enter repeat guard out of React state updates', () => {
  const loginHandlerSource = source('src/features/auth/model/use-login-handler.ts');

  expect(loginHandlerSource).toContain('submitLockRef');
  expect(loginHandlerSource).toContain('useRef(false)');
  expect(loginHandlerSource).not.toContain('setIsEnterPressed');
});

test('keeps the login form branch out of gateway status updates', () => {
  const loginAuthPanelSource = source('src/features/auth/components/login-auth-panel.tsx');

  expect(loginAuthPanelSource).toContain('<form');
  expect(loginAuthPanelSource).not.toContain('LoginFormItems');
});

test('keeps the login submit path free of shared button runtime dependencies', () => {
  const loginAuthPanelSource = source('src/features/auth/components/login-auth-panel.tsx');

  expect(loginAuthPanelSource).not.toContain('@/ui/components/button');
  expect(loginAuthPanelSource).not.toContain('<Button');
  expect(loginAuthPanelSource).toContain('<button');
  expect(loginAuthPanelSource).toContain('type="submit"');
  expect(loginAuthPanelSource).toContain('className="auth-page__submit"');
});

test('reuses prepared terminal info after login before permission route selection', () => {
  const successHandlerSource = source('src/features/auth/model/use-login-success-handler.ts');
  const loginHandlerSource = source('src/features/auth/model/use-login-handler.ts');

  expect(successHandlerSource).not.toContain('fetchTerminalInfo');
  expect(successHandlerSource).not.toContain('resolveTerminalThinMode');
  expect(successHandlerSource).not.toContain('.unwrap()');
  expect(successHandlerSource).toContain('isThin');
  expect(loginHandlerSource).toContain('const terminalInfo = await ensureTerminalReady()');
  expect(loginHandlerSource).toContain('loginSuccessFun(data.data, {');
  expect(loginHandlerSource).toContain('isThin: Boolean(terminalInfo?.isThin)');
});

test('loads terminal info before sending the login request device header', () => {
  const loginHandlerSource = source('src/features/auth/model/use-login-handler.ts');
  const requestSource = source('src/native/tauri/api/request.ts');
  const ensureTerminalStart = loginHandlerSource.indexOf('ensureTerminalReady');
  const loginRequestStart = loginHandlerSource.indexOf('bridge.api.loginUser');

  expect(requestSource).toContain("h['X-Device-Id'] = deviceId");
  expect(loginHandlerSource).toContain('fetchTerminalInfo');
  expect(loginHandlerSource).toContain('selectId');
  expect(ensureTerminalStart).toBeGreaterThanOrEqual(0);
  expect(loginRequestStart).toBeGreaterThan(ensureTerminalStart);
  expect(loginHandlerSource).toContain('const terminalInfo = await ensureTerminalReady()');
});

test('avoids duplicate terminal bootstrap after login success', () => {
  const bootstrapSource = source('src/app/router/bootstrap.ts');
  const successHandlerSource = source('src/features/auth/model/use-login-success-handler.ts');

  expect(bootstrapSource).toContain('const state = appStore.getState();');
  expect(bootstrapSource).toContain('if (!state.terminal)');
  expect(bootstrapSource).toContain('appStore.dispatch(fetchTerminalInfo())');
  expect(successHandlerSource).not.toContain('fetchTerminalInfo');
});

test('keeps the local username password form native and isolated from parent shell renders', () => {
  const loginAuthPanelSource = source('src/features/auth/components/login-auth-panel.tsx');

  expect(loginAuthPanelSource).toContain('memo(');
  expect(loginAuthPanelSource).toContain('useRef<HTMLFormElement');
  expect(loginAuthPanelSource).not.toContain('import { Form');
});

test('keeps the login page shell split away from live auth and gateway state', () => {
  const loginPageSource = source('src/features/auth/pages/login-page.tsx');
  const loginBrandPanelSource = source('src/features/auth/components/login-brand-panel.tsx');
  const loginAuthPanelSource = source('src/features/auth/components/login-auth-panel.tsx');

  expect(loginPageSource).toContain('LoginBrandPanel');
  expect(loginPageSource).toContain('LoginAuthPanel');
  expect(loginPageSource).not.toContain('useLoginHandler');
  expect(loginPageSource).not.toContain('useAppSelector');
  expect(loginPageSource).not.toContain('selectConnected');
  expect(loginPageSource).not.toContain('selectAutoGateway');
  expect(loginPageSource).not.toContain('Form.useForm');

  expect(loginBrandPanelSource).toContain('memo(');
  expect(loginAuthPanelSource).toContain('memo(');
  expect(loginAuthPanelSource).toContain('<form');
  expect(loginAuthPanelSource).not.toContain('Form.useForm');
});

test('loads the assistant panel only when the user opens it', () => {
  expect(source('src/app/layouts/app-layout/index.tsx')).not.toContain(
    "import { AssistantPanel } from '@/shared/ui/assistant/assistant-panel'",
  );
});

test('keeps authenticated shell slots stable across route content renders', () => {
  const appLayoutSource = source('src/app/layouts/app-layout/index.tsx');

  expect(appLayoutSource).not.toContain('import { LoginGatewayDock }');
  expect(appLayoutSource).toContain("import('@/features/shell/components/gateway-dock')");
  expect(appLayoutSource).toContain('useCallback');
  expect(appLayoutSource).toContain('const assistantSlot = useMemo');
  expect(appLayoutSource).toContain('const navSlot = useMemo');
  expect(appLayoutSource).toContain('const footerSlot = useMemo');
});

test('keeps desk resource cards memoized away from page-level refresh state', () => {
  const deskPageSource = source('src/features/desktop/pages/desktop-page.tsx');
  const desktopCardSource = source('src/features/desktop/components/desktop-resource-cards.tsx');

  expect(deskPageSource).toContain("from '../components/desktop-resource-cards'");
  expect(desktopCardSource).toContain('memo(');
  expect(desktopCardSource).toContain('function DesktopCard');
  expect(desktopCardSource).toContain('function DeskPoolCard');
  expect(deskPageSource).toContain('useCallback');
  expect(deskPageSource).toContain('useMemo');
});

test('keeps desk hook actions stable for memoized desk cards', () => {
  const deskHookSource = source('src/features/desktop/model/use-desk-hooks.tsx');

  expect(deskHookSource).toContain('useCallback');
  expect(deskHookSource).toContain('useMemo');
  expect(deskHookSource).toContain('const generateMenus = useCallback');
  expect(deskHookSource).toContain('const enterDesk = useCallback');
  expect(deskHookSource).toContain('const createDeskFromDeskPool = useCallback');
  expect(deskHookSource).toContain('const hookResult = useMemo');
});

test('defers desktop resource requests until after the desk route first paint', () => {
  const deskHookSource = source('src/features/desktop/model/use-desk-hooks.tsx');

  expect(deskHookSource).toContain('scheduleDeskResourceBootstrap');
  expect(deskHookSource).toContain('window.requestAnimationFrame');
  expect(deskHookSource).toContain('window.setTimeout');
  expect(deskHookSource).toContain('window.cancelAnimationFrame');
  expect(deskHookSource).not.toContain('getDeskList();\n    //获取桌面池\n    getDeskPoolList();');
});

test('loads desktop idle cleanup shell command only when idle disconnect fires', () => {
  const deskPageSource = source('src/features/desktop/pages/desktop-page.tsx');

  expect(deskPageSource).not.toContain(
    "import { killAllHdpViewers } from '@/services/invoke/shell'",
  );
  expect(deskPageSource).toContain("import('@/services/invoke/shell')");
});

test('removes authenticated message notification feature from the client', () => {
  const clientLayoutSource = source('src/app/layouts/client-layout/index.tsx');
  const sidebarSource = source('src/features/shell/components/sidebar/index.tsx');
  const sidebarStyles = source('src/features/shell/components/sidebar/index.scss');
  const appSliceSource = source('src/store/feature/app/appSlice.ts');
  const appInitStateSource = source('src/store/feature/app/initState.ts');
  const appTypesSource = source('src/store/feature/app/types.ts');
  const domainApiSources = [
    'src/services/api/account/index.ts',
    'src/services/api/session/index.ts',
  ]
    .map((path) => source(path))
    .join('\n');
  const localeSources = [locale('zh-CN'), locale('zh-TW'), locale('en-US')]
    .map((resource) => JSON.stringify(resource))
    .join('\n');
  const removedPaths = [
    'src/components/MessageCenter',
    'src/services/api/msg',
    'src/services/api/notice',
  ];

  expect(clientLayoutSource).not.toContain('@/components/MessageCenter');
  expect(clientLayoutSource).not.toContain('msgModalShow');
  expect(clientLayoutSource).not.toContain('msgId');
  expect(sidebarSource).not.toContain('setMsgModalShow');
  expect(sidebarSource).not.toContain('setMsgDot');
  expect(sidebarSource).not.toContain('selectMsgDot');
  expect(sidebarSource).not.toContain('icon-message');
  expect(sidebarSource).not.toContain("id: 'MSG'");
  expect(sidebarStyles).not.toContain('sidebar__button--unread');
  expect(appSliceSource).not.toContain('setMsgModalShow');
  expect(appSliceSource).not.toContain('setMsgDot');
  expect(appSliceSource).not.toContain('selectMsg');
  expect(appInitStateSource).not.toContain('msg');
  expect(appTypesSource).not.toContain('msg');
  expect(domainApiSources).not.toContain('listHistoryMessage');
  expect(domainApiSources).not.toContain('deleteHistoryMsg');
  expect(domainApiSources).not.toContain('listHistoryNotice');
  expect(domainApiSources).not.toContain('listNotice');
  expect(localeSources).not.toContain('common.message_modal');
  expect(localeSources).not.toContain('"MSG"');
  expect(localeSources).not.toContain('login_page.message_announcement');
  for (const removedPath of removedPaths) {
    expect(existsSync(join(process.cwd(), removedPath)), removedPath).toBe(false);
  }
  expect(existsSync(join(process.cwd(), 'src/services/public.ts'))).toBe(false);
  expect(existsSync(join(process.cwd(), 'src/services/user.ts'))).toBe(false);
});

test('keeps account workbench code out of the sidebar shell', () => {
  const sidebarSource = source('src/features/shell/components/sidebar/index.tsx');
  const accountWorkbenchSource = source(
    'src/features/account/components/account-workbench/index.tsx',
  );

  expect(sidebarSource).not.toContain("import ChangePhone from '@/components/ChangePhone'");
  expect(sidebarSource).not.toContain("import ComModal from '@/components/ComModal'");
  expect(sidebarSource).not.toContain(
    "import DiffLoginTip from '@/features/account/components/diff-login-tip'",
  );
  expect(sidebarSource).not.toContain("import PwdForm from '@/components/PwdForm'");
  expect(sidebarSource).not.toContain("import UserInfo from '@/components/UserInfo'");
  expect(sidebarSource).not.toContain("import useRequest from '@/hooks/useRequest'");
  expect(sidebarSource).not.toContain("import { changePasswordUser } from '@/services/user'");
  expect(sidebarSource).not.toContain("import { Buffer } from 'buffer'");
  expect(sidebarSource).toContain(
    "import { AccountWorkbench } from '@/features/account/components/account-workbench'",
  );
  expect(sidebarSource).toContain('<AccountWorkbench');
  expect(sidebarSource).toContain('currentUser={currentUser}');
  expect(sidebarSource).toContain('forcePasswordChange=');
  expect(sidebarSource).toContain("import('@/features/account/components/diff-login-tip')");
  expect(accountWorkbenchSource).toContain('changePasswordUser');
  expect(accountWorkbenchSource).toContain('updateUserPhone');
  expect(accountWorkbenchSource).toContain('getPhoneCode');
  expect(accountWorkbenchSource).toContain("import('buffer')");
});

test('keeps account controls inside the left-bottom workbench', () => {
  const overlaySource = source('src/shared/ui/overlay.tsx');
  const sidebarSource = source('src/features/shell/components/sidebar/index.tsx');
  const workbenchPath = 'src/features/account/components/account-workbench/index.tsx';
  const workbenchViewsPath =
    'src/features/account/components/account-workbench/account-workbench-views.tsx';
  const workbenchStylesPath = 'src/features/account/components/account-workbench/index.scss';
  const workbenchSource = source(workbenchPath);
  const workbenchViewsSource = source(workbenchViewsPath);
  const workbenchStyles = source(workbenchStylesPath);
  const zhCNCore = source('src/assets/locales/zh-CN/core.json');
  const zhTWCore = source('src/assets/locales/zh-TW/core.json');
  const enUSCore = source('src/assets/locales/en-US/core.json');

  expect(overlaySource).toContain("from '@radix-ui/react-popover'");
  expect(overlaySource).toContain(
    '<PopoverPrimitive.Root open={visible} onOpenChange={setVisible}>',
  );
  expect(overlaySource).toContain('onOpenChange?.(nextOpen)');
  expect(overlaySource).not.toContain("document.addEventListener('pointerdown'");
  expect(overlaySource).not.toContain("document.addEventListener('keydown'");
  expect(existsSync(join(process.cwd(), workbenchPath)), workbenchPath).toBe(true);
  expect(existsSync(join(process.cwd(), workbenchViewsPath)), workbenchViewsPath).toBe(true);
  expect(existsSync(join(process.cwd(), workbenchStylesPath)), workbenchStylesPath).toBe(true);
  expect(sidebarSource).not.toContain('<Popover');
  expect(sidebarSource).not.toContain('userMenus');
  expect(sidebarSource).not.toContain('setUserInfoVisible');
  expect(sidebarSource).not.toContain('setChangePhoneVisible');
  expect(workbenchSource).toContain('account-workbench__panel');
  expect(workbenchViewsSource).toContain('account-workbench__view');
  expect(workbenchSource).toContain("setView('password')");
  expect(workbenchSource).toContain("setView('phone')");
  expect(workbenchSource).not.toContain("setView('profile')");
  expect(workbenchSource).not.toContain("'profile'");
  expect(workbenchSource).not.toContain('view_profile');
  expect(workbenchSource).not.toContain('profile_title');
  expect(workbenchViewsSource).toContain('className="account-workbench__footer vdui-modal-footer"');
  expect(workbenchSource).toContain('LoginUserType.LOCAL');
  expect(workbenchSource).toContain('LEGACY_PASSWORD_PREFIX');
  expect(workbenchSource).toContain(
    "document.addEventListener('pointerdown', handlePointerDown, true)",
  );
  expect(workbenchSource).toContain("document.addEventListener('keydown', handleKeyDown)");
  expect(workbenchSource).toContain("event.key === 'Escape'");
  expect(workbenchStyles).toContain('left: 58px;');
  expect(workbenchStyles).toContain('bottom: 8px;');
  expect(workbenchStyles).toContain('width: min(380px, calc(100vw - 78px));');
  expect(workbenchStyles).toContain('max-height: min(620px, calc(100vh - 24px));');
  expect(workbenchStyles).toContain('.account-workbench__danger');
  expect(workbenchStyles).toContain('.account-workbench__footer.vdui-modal-footer');
  expect(workbenchStyles).toContain('padding: 0;');
  expect(workbenchStyles).not.toContain('position: fixed;');
  expect(zhCNCore).toContain('"account.workbench.title": "账户工作台"');
  expect(zhTWCore).toContain('"account.workbench.title": "賬戶工作台"');
  expect(enUSCore).toContain('"account.workbench.title": "Account workbench"');
});

test('keeps shared action controls visually consistent', () => {
  const deskDetailSource = source('src/features/desktop/pages/desktop-detail-page.tsx');
  const deskDetailStyles = source('src/features/desktop/pages/desktop-detail-page.scss');
  const createFaultBaseFormSource = source(
    'src/features/malfunction/components/create-fault-modal/base-form.tsx',
  );
  const malfunctionCreateSource = source(
    'src/features/malfunction/components/create-fault-modal/index.tsx',
  );
  const uiStyles = source('src/shared/ui/styles.scss');
  const selectSource = source('src/shared/ui/select.tsx');
  const inputSource = source('src/shared/ui/input.tsx');
  const commonZh = source('src/shared/ui/i18n/locales/zh-CN/common.json');
  const publishAppStyles = source(
    'src/features/application/components/add-from-self-modal/index.scss',
  );
  const addFavoriteSource = source(
    'src/features/application/components/add-from-sys-modal/index.tsx',
  );
  const diagnosisModalSource = source(
    'src/features/settings/pages/advanced-setting/Diagnosis/DiagnosisModal/index.tsx',
  );
  const approvalStyles = source('src/features/approval/pages/approval-page.scss');
  const malfunctionStyles = source('src/features/malfunction/pages/malfunction-page.scss');
  const malfunctionSource = source('src/features/malfunction/routes/malfunction-route.tsx');
  const faultTypesSource = source('src/services/api/fault/types.ts');
  const requestSource = source('src/utils/request/index.ts');

  expect(deskDetailSource).toContain('className="desk-detail-page__create-button"');
  expect(deskDetailStyles).toContain('&__create-button');
  expect(deskDetailStyles).toContain('min-height: 34px;');
  expect(deskDetailStyles).toContain('border-radius: 7px;');
  expect(deskDetailStyles).toContain('background: var(--detail-primary-bg);');
  expect(deskDetailStyles).toContain('> span {\n      color: inherit;');
  expect(deskDetailStyles).toContain('font-size: inherit;');
  expect(deskDetailStyles).toContain('font-weight: inherit;');

  expect(commonZh).toContain('"navigation.desktopIssues": "工单"');
  expect(malfunctionCreateSource).toContain("okText={formatMessage({ id: 'Create' })}");
  expect(uiStyles).toContain('.vdui-modal-footer {\n  padding: 0 22px 18px;');
  expect(uiStyles).toContain('min-width: 86px;');
  expect(uiStyles).toContain('.vdui-btn:not(.vdui-btn-primary)');
  expect(uiStyles).toContain('.vdui-modal-footer .vdui-btn-primary');
  expect(uiStyles).toContain('--vdui-modal-primary-bg:');
  expect(uiStyles).toContain('--vdui-switch-checked-bg: #3f9f68;');
  expect(uiStyles).toContain('background: var(--vdui-switch-checked-bg, #4d7c3f);');
  expect(selectSource).not.toContain('selectedLabel ?? props.placeholder');
  expect(selectSource).toContain('selectedValues.length > 0 ? (');
  expect(inputSource).not.toContain('showCount');
  expect(inputSource).toContain('rows={rows ?? minRows}');
  expect(createFaultBaseFormSource).toContain('const { key, ...resProps } = props;');
  expect(createFaultBaseFormSource).toContain('<Select key={key} {...resProps} />');
  expect(publishAppStyles).toContain('.vdui-modal-body {');
  expect(publishAppStyles).toContain('overflow-y: auto;');

  expect(addFavoriteSource).not.toContain('ReloadOutlined');
  expect(addFavoriteSource).toContain('className="vdui-modal-footer add-vapp-footer"');
  expect(addFavoriteSource).toContain('iconfont icon-refresh');
  expect(addFavoriteSource).toContain('loading={listVappLoading}');
  expect(diagnosisModalSource).toContain('className="vdui-modal-footer diagnosis-modal-footer"');

  for (const pageStyles of [approvalStyles, malfunctionStyles]) {
    expect(pageStyles).toContain('.vdui-pagination-item {\n      border-color: transparent;');
    expect(pageStyles).toContain('background: transparent;');
    expect(pageStyles).toContain(
      '.vdui-pagination-item-active {\n      border-color: transparent;',
    );
  }

  expect(malfunctionSource).toContain('selectCurrentUser');
  expect(malfunctionSource).toContain('const currentUser = useAppSelector(selectCurrentUser);');
  expect(malfunctionSource).toContain('if (!currentUser?.userId)');
  expect(malfunctionSource).not.toContain('userId: currentUser?.userId');
  expect(faultTypesSource).not.toContain('userId?: string;');
  expect(requestSource).toContain("h['VisitorId'] = userId");
});

test('keeps authenticated client bootstrap centralized outside ClientLayout render effects', () => {
  const bootstrapSource = source('src/app/router/bootstrap.ts');
  const clientLayoutSource = source('src/app/layouts/client-layout/index.tsx');
  const sharedStatePath = 'src/app/layouts/client-layout/useSharedState';
  const clientLayoutLoaderStart = bootstrapSource.indexOf('export const clientLayoutLoader');
  const clientLayoutLoaderEnd = bootstrapSource.indexOf(
    'function scheduleAuthenticatedClientBootstrap',
    clientLayoutLoaderStart,
  );
  const clientLayoutLoaderBlock = bootstrapSource.slice(
    clientLayoutLoaderStart,
    clientLayoutLoaderEnd,
  );
  const authenticatedBootstrapBlock = bootstrapSource.slice(clientLayoutLoaderStart);

  expect(clientLayoutLoaderBlock).toContain('scheduleAuthenticatedClientBootstrap');
  expect(bootstrapSource).toContain('let authenticatedClientBootstrapScheduled = false');
  expect(authenticatedBootstrapBlock).toContain(
    'if (authenticatedClientBootstrapScheduled) return',
  );
  expect(authenticatedBootstrapBlock).toContain('fetchGatewayList');
  expect(authenticatedBootstrapBlock).toContain('fetchClientOnlineStatus');
  expect(authenticatedBootstrapBlock).toContain('fetchClientInfo');
  expect(authenticatedBootstrapBlock).not.toContain('await ');
  expect(clientLayoutSource).not.toContain("import useSharedState from './useSharedState'");
  expect(clientLayoutSource).not.toContain('dispatch(fetchClientOnlineStatus())');
  expect(clientLayoutSource).not.toContain('getGateWays');
  expect(clientLayoutSource).not.toContain('getClientConfig');
  expect(existsSync(join(process.cwd(), sharedStatePath)), sharedStatePath).toBe(false);
});

test('stages authenticated bootstrap work after first paint on low-power devices', () => {
  const routerSource = source('src/app/router/bootstrap.ts');
  const bootstrapStart = routerSource.indexOf('function scheduleAuthenticatedClientBootstrap()');
  const bootstrapBlock = routerSource.slice(bootstrapStart);

  expect(bootstrapBlock).toContain('scheduleAfterFirstPaint');
  expect(bootstrapBlock).toContain('scheduleWhenIdle');
  expect(routerSource).toContain('window.requestAnimationFrame');
  expect(routerSource).toContain('window.requestIdleCallback');
  expect(bootstrapBlock.indexOf('fetchGatewayList')).toBeLessThan(
    bootstrapBlock.indexOf('fetchConfigInfo'),
  );
  expect(bootstrapBlock.indexOf('fetchClientOnlineStatus')).toBeLessThan(
    bootstrapBlock.indexOf('fetchClientInfo'),
  );
  expect(bootstrapBlock).not.toContain(
    'void appStore.dispatch(fetchConfigInfo());\n    void appStore.dispatch(fetchGatewayList());',
  );
});

test('does not statically bundle every locale at startup', () => {
  const i18nSource = source('src/utils/i18n.ts');
  const packageJson = source('package.json');

  expect(i18nSource).not.toContain("from '@/assets/locales/zh-CN.json'");
  expect(i18nSource).not.toContain("from '@/assets/locales/zh-TW.json'");
  expect(i18nSource).not.toContain("from '@/assets/locales/en-US.json'");
  expect(i18nSource).not.toContain("from '@/ui/i18n/locales/zh-CN/common.json'");
  expect(i18nSource).not.toContain("from '@/ui/i18n/locales/zh-CN/assistant.json'");
  expect(i18nSource).not.toContain('LanguageDetector');
  expect(packageJson).not.toContain('i18next-browser-languagedetector');
});

test('keeps async route styles split from the startup stylesheet', () => {
  expect(source('vite.config.ts')).not.toContain('cssCodeSplit: false');
});

test('splits vendor chunks by exact package name to avoid production init cycles', () => {
  const viteConfig = source('vite.config.ts');

  expect(viteConfig).toContain('function getNodePackageName');
  expect(viteConfig).toContain("packageName === 'react-i18next'");
  expect(viteConfig).toContain("packageName?.startsWith('@tanstack/')");
  expect(viteConfig).toContain("packageName === 'react-hook-form'");
  expect(viteConfig).toContain("return 'vendor-data'");
  expect(viteConfig).toContain("return 'vendor-form'");
  expect(viteConfig).toContain("return 'vendor-icons'");
  expect(viteConfig).toContain("return 'vendor-state'");
  expect(viteConfig).not.toContain("return 'vendor-scrollbars'");
  expect(viteConfig).not.toContain("return 'vendor-react'");
  expect(viteConfig).not.toContain("id.includes('/react')");
  expect(viteConfig).not.toContain("id.includes('/react-i18next')");
});

test('removes custom scrollbar and lodash runtimes from the frontend bundle', () => {
  const packageJson = source('package.json');
  const viteConfig = source('vite.config.ts');
  const searchableSources = [
    ...collectSourceFiles('src').map((path) => source(path)),
    viteConfig,
    packageJson,
  ].join('\n');

  expect(packageJson).not.toContain('react-custom-scrollbars');
  expect(packageJson).not.toContain('@types/react-custom-scrollbars');
  expect(packageJson).not.toContain('"lodash-es"');
  expect(packageJson).not.toContain('@types/lodash-es');
  expect(packageJson).not.toContain('"classnames"');
  expect(packageJson).not.toContain('"qs"');
  expect(packageJson).not.toContain('@types/qs');
  expect(packageJson).not.toContain('"uuid"');
  expect(packageJson).not.toContain('crypto-browserify');
  expect(packageJson).not.toContain('stream-browserify');
  expect(viteConfig).not.toContain('vendor-scrollbars');
  expect(searchableSources).not.toContain('react-custom-scrollbars');
  expect(searchableSources).not.toContain("from 'lodash-es'");
  expect(searchableSources).not.toContain("from 'classnames'");
  expect(searchableSources).not.toContain("from 'qs'");
  expect(searchableSources).not.toContain("from 'uuid'");
});

test('keeps frontend application source TypeScript-only', () => {
  const jsFiles = collectSourceFiles('src').filter((path) => /\.(js|jsx)$/.test(path));

  expect(jsFiles).toEqual([]);
  expect(source('tsconfig.app.json')).toContain('"allowJs": false');
  expect(source('eslint.config.ts')).not.toContain('src/hooks/useRequest.js');
  expect(source('eslint.config.ts')).not.toContain('src/utils/constant.js');
});

test('removes request-backed global loading subscriptions from list and modal flows', () => {
  const storeSource = source('src/store/index.ts');
  const mittTypesSource = source('src/utils/mitt/types.ts');
  const requestSource = source('src/utils/request/index.ts');
  const vappSource = source('src/services/api/vapp/index.ts');
  const faultSource = source('src/services/api/fault/index.ts');
  const appIndexSource = source('src/features/application/routes/application-route.tsx');
  const appPageSource = source('src/features/application/pages/application-page.tsx');
  const virtualAppSource = source('src/features/application/components/virtual-app/index.tsx');
  const addFromSysSource = source(
    'src/features/application/components/add-from-sys-modal/index.tsx',
  );
  const addFromSelfSource = source(
    'src/features/application/components/add-from-self-modal/index.tsx',
  );
  const malfunctionSource = source('src/features/malfunction/routes/malfunction-route.tsx');

  expect(existsSync(join(process.cwd(), 'src/hooks/useLoading.ts'))).toBe(false);
  expect(existsSync(join(process.cwd(), 'src/store/feature/loading'))).toBe(false);
  expect(storeSource).not.toContain('loadingReducer');
  expect(storeSource).not.toContain('api/startLoading');
  expect(storeSource).not.toContain('api/stopLoading');
  expect(mittTypesSource).not.toContain('api/startLoading');
  expect(mittTypesSource).not.toContain('api/stopLoading');
  expect(requestSource).not.toContain('trackLoading');
  expect(requestSource).not.toContain("globalEmitter.emit('api/startLoading'");
  expect(vappSource).not.toContain('trackLoading');
  expect(faultSource).not.toContain('trackLoading');

  for (const sourceText of [
    appIndexSource,
    appPageSource,
    virtualAppSource,
    addFromSysSource,
    addFromSelfSource,
    malfunctionSource,
  ]) {
    expect(sourceText).not.toContain('useLoading');
    expect(sourceText).toMatch(/useState\(false\)/);
  }

  expect(appPageSource).toContain('@/shared/ui/fast');
  expect(malfunctionSource).toContain("from '@/shared/ui'");
  expect(malfunctionSource).not.toContain('@/shared/ui/fast');
});

test('splits translation locales into named chunks instead of monolithic json files', () => {
  const i18nSource = source('src/utils/i18n.ts');
  const generatorSource = source('scripts/generate-i18n-types.js');

  for (const language of ['zh-CN', 'zh-TW', 'en-US'] as const) {
    expect(existsSync(join(process.cwd(), `src/assets/locales/${language}.json`))).toBe(false);
    for (const chunk of ['core', 'error', 'login', 'settings', 'workspace']) {
      expect(
        existsSync(join(process.cwd(), `src/assets/locales/${language}/${chunk}.json`)),
        `${language}/${chunk}.json`,
      ).toBe(true);
    }
    const resource = locale(language);
    expect(Object.hasOwn(resource, 'LOGIN')).toBe(true);
    expect(Object.hasOwn(resource, 'error_code.InternalError')).toBe(true);
    expect(Object.hasOwn(resource, 'config_page.common_setting.theme')).toBe(true);
    expect(Object.hasOwn(resource, 'application_page.workbench_title')).toBe(true);
  }

  expect(i18nSource).toContain('import.meta.glob');
  expect(i18nSource).toContain('../shared/ui/i18n/locales/*/*.json');
  expect(i18nSource).toContain('loadTranslationNamespace');
  expect(generatorSource).toContain('collectLocaleResource');
  expect(generatorSource).not.toContain("readJson('../src/assets/locales/zh-CN.json')");
});

test('keeps request hot paths lodash-free', () => {
  const hotPathSources = [
    'src/utils/request/index.ts',
    'src/native/tauri/api/request.ts',
    'src/services/requestErrorHandler.ts',
    'src/features/desktop/pages/desktop-page.tsx',
  ];

  for (const path of hotPathSources) {
    expect(source(path), path).not.toContain("from 'lodash-es'");
  }

  expect(source('src/utils/request/index.ts')).not.toContain('isEmpty');
});

test('keeps feature API imports on domain modules', () => {
  const featureImports = collectSourceFiles('src/features').map((path) => [path, source(path)]);

  for (const [path, content] of featureImports) {
    expect(content, path).not.toContain('@/services/resource');
  }

  expect(source('src/services/api/desktop/index.ts')).toContain('export enum DeskTopApi');
  expect(source('src/services/api/approval/index.ts')).toContain('export enum ApprovalApi');
  expect(source('src/services/api/account/index.ts')).toContain('export enum AccountApi');
  expect(source('src/services/api/session/index.ts')).toContain('export enum SessionApi');
  expect(existsSync(join(process.cwd(), 'src/services/resource.ts'))).toBe(false);
  expect(existsSync(join(process.cwd(), 'src/services/public.ts'))).toBe(false);
  expect(existsSync(join(process.cwd(), 'src/services/user.ts'))).toBe(false);
});

test('stages login route bootstrap after first paint without low-power visual defaults', () => {
  const bootstrapSource = source('src/app/router/bootstrap.ts');
  const preAuthLoaderStart = bootstrapSource.indexOf('export const preAuthConfigLoader');
  const preAuthLoaderEnd = bootstrapSource.indexOf(
    'export const clientLayoutLoader',
    preAuthLoaderStart,
  );
  const preAuthLoaderBlock = bootstrapSource.slice(preAuthLoaderStart, preAuthLoaderEnd);
  const bootstrapStart = bootstrapSource.indexOf('function scheduleAuthenticatedClientBootstrap()');
  const bootstrapBlock = bootstrapSource.slice(bootstrapStart);

  expect(bootstrapSource).toContain('schedulePreAuthClientBootstrap');
  expect(bootstrapSource).toContain('scheduleAfterFirstPaint');
  expect(bootstrapSource).toContain('scheduleWhenIdle');
  expect(bootstrapSource).toContain('window.requestAnimationFrame');
  expect(bootstrapSource).toContain('window.requestIdleCallback');
  expect(preAuthLoaderBlock).toContain('scheduleAfterFirstPaint');
  expect(preAuthLoaderBlock).toContain('scheduleWhenIdle');
  expect(preAuthLoaderBlock).toContain('fetchConfigInfo');
  expect(preAuthLoaderBlock).toContain('fetchTerminalInfo');
  expect(preAuthLoaderBlock).toContain('fetchGatewayList');
  expect(preAuthLoaderBlock).toContain('fetchClientOnlineStatus');
  expect(preAuthLoaderBlock).not.toContain('window.setTimeout(() => {');

  expect(bootstrapBlock).toContain('if (!state.gateway.gatewayList.length)');
  expect(bootstrapBlock).toContain('if (state.gateway.connected === false)');
  expect(bootstrapBlock).toContain('if (!state.config.client_id)');
  expect(bootstrapBlock).toContain('if (!state.client)');
});

test('keeps route design-system styles out of the global stylesheet', () => {
  expect(source('src/styles/index.scss')).not.toContain("@use '@/styles/design-system.css'");
});

test('keeps component library styles out of the global stylesheet', () => {
  expect(source('src/styles/index.scss')).not.toContain("@use '@/ui/styles.scss'");
  expect(source('src/styles/index.scss')).not.toContain("@use '@/shared/ui/styles.scss'");
});

test('keeps route-only color icon fonts out of the global stylesheet', () => {
  expect(source('src/styles/index.scss')).not.toContain('iconfontColor');
  expect(source('src/features/desktop/model/use-desk-hooks.tsx')).toContain(
    "import '@/assets/iconfontColor/iconfont-color.css'",
  );
  expect(source('src/features/desktop/model/use-snap.tsx')).toContain(
    "import '@/assets/iconfontColor/iconfont-color.css'",
  );
});

test('lazy-loads the authenticated app layout with its route styles', () => {
  const lazyPagesSource = source('src/app/router/lazy-pages.tsx');

  expect(lazyPagesSource).not.toContain("import { AppLayout } from '@/app/layouts/app-layout'");
  expect(lazyPagesSource).toContain("import('@/app/layouts/app-layout')");
});

test('keeps the full UI component bundle out of the app bootstrap', () => {
  const appSource = source('src/app/App.tsx');
  const mainSource = source('src/main.tsx');
  const startSource = source('src/app/start.tsx');
  const providersSource = source('src/app/providers/app-providers.tsx');

  expect(appSource).not.toContain("from '@/ui'");
  expect(appSource).not.toContain("from '@/shared/ui'");
  expect(appSource).not.toContain('ConfigProvider');
  expect(appSource).not.toContain('ClientApp');
  expect(mainSource).toContain("import { startApp } from '@/app/start'");
  expect(mainSource).toContain('startApp();');
  expect(mainSource).not.toContain('ReactDOM.createRoot');
  expect(startSource).toContain('ReactDOM.createRoot');
  expect(startSource).toContain('setupServices();');
  expect(providersSource).toContain('Provider store={appStore}');
});

test('keeps startup notifications out of the full UI component bundle', () => {
  const startupSources = [
    source('src/app/layouts/client-layout/index.tsx'),
    source('src/services/requestErrorHandler.ts'),
    source('src/utils/invoke/index.ts'),
  ];

  for (const startupSource of startupSources) {
    expect(startupSource).not.toContain("from '@/ui'");
    expect(startupSource).not.toContain("from '@/shared/ui'");
  }

  expect(source('src/shared/ui/message.ts')).toContain("import './message.scss'");
  expect(source('src/shared/ui/styles.scss')).not.toContain('.vd-toast');
});

test('uses a lightweight local request hook instead of the ahooks runtime', () => {
  const packageJson = source('package.json');
  const requestHookSource = source('src/hooks/useRequest.ts');

  expect(packageJson).not.toContain('"ahooks"');
  expect(requestHookSource).not.toContain("from 'ahooks'");
  expect(requestHookSource).not.toContain("from 'lodash-es'");
  expect(requestHookSource).toContain('lastParamsRef');
  expect(requestHookSource).toContain('throttleTimerRef');
  expect(requestHookSource).toContain('return {');
  expect(requestHookSource).toContain('run,');
  expect(requestHookSource).toContain('refresh,');
  expect(requestHookSource).toContain('loading,');
});

test('uses the native clipboard helper instead of a React copy dependency', () => {
  const packageJson = source('package.json');
  const clipboardHelperPath = 'src/utils/clipboard.ts';
  const clipboardConsumers = [
    source('src/features/settings/pages/advanced-setting/NetworkInfo/index.tsx'),
    source('src/features/settings/pages/about/VersionInfo/index.tsx'),
    source('src/features/settings/pages/advanced-setting/Diagnosis/DiagnosisModal/index.tsx'),
  ].join('\n');

  expect(packageJson).not.toContain('react-copy-to-clipboard');
  expect(clipboardConsumers).not.toContain('CopyToClipboard');
  expect(clipboardConsumers).not.toContain('react-copy-to-clipboard');
  expect(clipboardConsumers).toContain("from '@/utils/clipboard'");
  expect(existsSync(join(process.cwd(), clipboardHelperPath)), clipboardHelperPath).toBe(true);
  expect(source(clipboardHelperPath)).toContain('navigator.clipboard.writeText');
  expect(source(clipboardHelperPath)).toContain("document.execCommand('copy')");
});

test('removes slider verification assets from the login client', () => {
  expect(existsSync(join(process.cwd(), 'src/components/SliderVerify'))).toBe(false);
  expect(existsSync(join(process.cwd(), 'src/assets/images/verify'))).toBe(false);
});

test('keeps the app shell background CSS-only', () => {
  expect(source('src/styles/theme.scss')).not.toContain('app_layout_bg.png');
});

test('does not load cached native background images in the renderer', () => {
  const clientLayoutSource = source('src/app/layouts/client-layout/index.tsx');
  const deskLoadingSource = source('src/features/desktop/components/desk-loading/index.tsx');

  expect(clientLayoutSource).not.toContain('selectBackgroundImage');
  expect(clientLayoutSource).not.toContain('backgroundImage:');
  expect(deskLoadingSource).not.toContain('selectBackgroundImage');
  expect(deskLoadingSource).not.toContain('backgroundImage:');
});

test('keeps desk detail fact values free of nested paragraph markup', () => {
  expect(source('src/features/desktop/model/use-desk-detail.tsx')).not.toContain('<p');
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
    source('src/features/auth/components/login-auth-panel.tsx'),
    source('src/features/shell/components/sidebar/index.tsx'),
  ].join('\n');

  expect(sourceFiles).not.toContain('login_history');
  expect(sourceFiles).not.toContain('loginHistory');
  expect(sourceFiles).not.toContain('clearLoginHistory');
  expect(sourceFiles).not.toContain('showEasyLog');
  expect(locale('zh-CN')).not.toHaveProperty('EasyLog');
  expect(locale('zh-CN')).not.toHaveProperty('login_page.clear_account');
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
  const startSource = source('src/app/start.tsx');
  const setupViewIndex = startSource.indexOf('renderApp();');
  const setupEnvLogIndex = startSource.indexOf('scheduleHardwareAccelerationLog();');

  expect(setupViewIndex).toBeGreaterThan(-1);
  expect(setupEnvLogIndex).toBeGreaterThan(setupViewIndex);
  expect(startSource).not.toContain('applyInitialPerformanceTier');
  expect(startSource).not.toContain('performanceTier');
  expect(startSource).not.toContain('  setupEnvLog();\n\n  setupServices();');
});

test('uses low-power rendering defaults without runtime device tier detection', () => {
  const mainSource = source('src/main.tsx');
  const globalStyles = source('src/styles/index.scss');
  const lowPowerStyles = source('src/styles/low-power-defaults.scss');

  expect(existsSync(join(process.cwd(), 'src/utils/performanceTier.ts'))).toBe(false);
  expect(existsSync(join(process.cwd(), 'src/styles/performance-tier.scss'))).toBe(false);
  expect(mainSource).not.toContain('dataset.performanceTier');
  expect(mainSource).not.toContain('TAURI_ARCH');
  expect(mainSource).not.toContain('hardwareConcurrency');
  expect(globalStyles).toContain("@use '@/styles/low-power-defaults.scss';");
  expect(globalStyles).not.toContain("@use '@/styles/performance-tier.scss';");
  expect(lowPowerStyles).not.toContain('data-performance-tier');
  expect(lowPowerStyles).toContain('backdrop-filter: none !important');
  expect(lowPowerStyles).toContain('filter: none !important');
  expect(lowPowerStyles).toContain('box-shadow: none !important');
  expect(lowPowerStyles).toContain('transition-duration: 0ms !important');
  expect(lowPowerStyles).toContain('animation: none !important');
});

test('keeps editable focus cheap and native text helpers disabled on low-power devices', () => {
  const mainSource = source('src/main.tsx');
  const startSource = source('src/app/start.tsx');
  const editableDefaultsPath = 'src/utils/setupLowPowerEditableDefaults.ts';
  const lowPowerStyles = source('src/styles/low-power-defaults.scss');

  expect(existsSync(join(process.cwd(), editableDefaultsPath)), editableDefaultsPath).toBe(true);

  const editableDefaultsSource = source(editableDefaultsPath);

  expect(mainSource).toContain('startApp');
  expect(startSource).toContain('setupLowPowerEditableDefaults');
  expect(editableDefaultsSource).toContain("setAttribute('spellcheck', 'false')");
  expect(editableDefaultsSource).toContain("setAttribute('autocorrect', 'off')");
  expect(editableDefaultsSource).toContain("setAttribute('autocapitalize', 'none')");
  expect(editableDefaultsSource).toContain('MutationObserver');
  expect(lowPowerStyles).toContain('.auth-page__input-shell:focus-within');
  expect(lowPowerStyles).toContain('.vdui-input-affix-wrapper:focus-within');
  expect(lowPowerStyles).toContain('.vdui-input-textarea:focus');
  expect(lowPowerStyles).toContain('outline: 0 !important');
  expect(lowPowerStyles).toContain('box-shadow: none !important');
  expect(lowPowerStyles).toContain('filter: none !important');
  expect(lowPowerStyles).toContain('background-image: none !important');
});

test('keeps terminal info loading free of window maximize side effects', () => {
  const terminalSliceSource = source('src/store/feature/terminal/terminalSlice.ts');

  expect(terminalSliceSource).toContain('fetchTerminalInfo');
  expect(terminalSliceSource).toContain('bridge.terminal.getTerminalInfo');
  expect(terminalSliceSource).not.toContain('maximizeWindow');
});

test('disables unstable WebKitGTK compositing paths on low-power Linux', () => {
  const tauriLibSource = source('src-tauri/src/lib.rs');
  const dmabufIndex = tauriLibSource.indexOf('WEBKIT_DISABLE_DMABUF_RENDERER');
  const compositingIndex = tauriLibSource.indexOf('WEBKIT_DISABLE_COMPOSITING_MODE');
  const builderIndex = tauriLibSource.indexOf('tauri::Builder::default()');

  expect(tauriLibSource).toContain('#[cfg(target_os = "linux")]');
  expect(dmabufIndex).toBeGreaterThanOrEqual(0);
  expect(compositingIndex).toBeGreaterThan(dmabufIndex);
  expect(builderIndex).toBeGreaterThan(compositingIndex);
});

test('routes high-frequency text inputs through the low-power lean input path', () => {
  const leanInputPath = 'src/shared/ui/lean-input.tsx';
  const uiSource = source('src/shared/ui/index.tsx');
  const loginSource = source('src/features/auth/components/login-auth-panel.tsx');
  const configurationFormSource = source(
    'src/features/settings/components/configuration-form/index.tsx',
  );
  const formTableSource = source(
    'src/features/settings/components/configuration-form/form-table/index.tsx',
  );
  const lowPowerStyles = source('src/styles/low-power-defaults.scss');

  expect(existsSync(join(process.cwd(), leanInputPath)), leanInputPath).toBe(true);

  const leanInputSource = source(leanInputPath);

  expect(leanInputSource).toContain('LeanInput');
  expect(leanInputSource).toContain('LeanTextarea');
  expect(leanInputSource).toContain('memo(');
  expect(leanInputSource).toContain('forwardRef');
  expect(leanInputSource).toContain('spellCheck={false}');
  expect(leanInputSource).toContain('autoCorrect="off"');
  expect(leanInputSource).toContain('autoCapitalize="none"');
  expect(leanInputSource).toContain('data-lean-input');
  expect(uiSource).not.toContain("from './lean-input'");
  expect(uiSource).not.toContain('<LeanInput');
  expect(uiSource).not.toContain('<LeanTextarea');
  expect(loginSource).toContain('@/shared/ui/lean-input');
  expect(loginSource).toContain('<LeanInput');
  expect(loginSource).not.toContain('setPasswordVisible');
  expect(configurationFormSource).toContain('deferredTextComTypes');
  expect(configurationFormSource).toContain('getItemLiveValue');
  expect(configurationFormSource).toContain('liveValue={getItemLiveValue');
  expect(formTableSource).toContain('deferredInlineEditTypes');
  expect(formTableSource).toContain('commitInlineEdit');
  expect(formTableSource).toContain('onBlur');
  expect(formTableSource).toContain('defaultValue: defaultValue');
  expect(lowPowerStyles).toContain('contain: layout paint style');
  expect(lowPowerStyles).toContain('.vdui-lean-input');
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

test('keeps request execution independent from global loading state', () => {
  const requestSource = source('src/utils/request/index.ts');
  const vappSource = source('src/services/api/vapp/index.ts');
  const faultSource = source('src/services/api/fault/index.ts');
  const storeSource = source('src/store/index.ts');

  expect(requestSource).not.toContain('trackLoading');
  expect(requestSource).not.toContain('api/startLoading');
  expect(requestSource).not.toContain('api/stopLoading');
  expect(storeSource).not.toContain('startLoading');
  expect(storeSource).not.toContain('stopLoading');
  expect(vappSource).not.toContain('trackLoading');
  expect(faultSource).not.toContain('trackLoading');
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

test('keeps password crypto out of login success persistence', () => {
  const legacyUtilsSource = source('src/utils/utils.tsx');
  const loginSuccessSource = source('src/features/auth/model/use-login-success-handler.ts');
  const appSliceSource = source('src/store/feature/app/appSlice.ts');
  const apiModuleSource = source('src/native/tauri/api/index.ts');

  expect(legacyUtilsSource).not.toContain('crypto-js');
  expect(loginSuccessSource).not.toContain("from '@/utils/utils'");
  expect(loginSuccessSource).not.toContain("import('@/utils/passwordCrypto')");
  expect(loginSuccessSource).not.toContain('req.password');
  expect(appSliceSource).toContain('password:');
  expect(appSliceSource).toContain('return userInfo');
  expect(apiModuleSource).not.toContain("from '@/utils/utils'");
  expect(apiModuleSource).toContain("from '@/utils/passwordCrypto'");
});

test('keeps high-traffic authenticated pages off the full ui bundle', () => {
  const highTrafficSources = [
    'src/features/desktop/pages/desktop-page.tsx',
    'src/features/desktop/model/use-desk-hooks.tsx',
    'src/features/application/pages/application-page.tsx',
    'src/features/approval/pages/approval-page.tsx',
    'src/features/malfunction/pages/malfunction-page.tsx',
  ];

  for (const path of highTrafficSources) {
    const fileSource = source(path);
    expect(fileSource, path).not.toMatch(/from ['"]@\/shared\/ui['"]/);
  }

  const fastUiSource = source('src/shared/ui/fast.tsx');
  expect(fastUiSource).toContain('export function Table');
  expect(fastUiSource).toContain('export const Modal');
  expect(fastUiSource).not.toContain('export const Form');
  expect(fastUiSource).not.toContain('createForm');
  expect(fastUiSource).not.toContain('InputBase');
});

test('keeps the login startup path off the main iconfont', () => {
  const globalStyles = source('src/styles/index.scss');
  const loginSources = [
    source('src/features/auth/components/login-auth-panel.tsx'),
    source('src/features/auth/components/login-brand-panel.tsx'),
    source('src/features/auth/pages/login-page.tsx'),
    source('src/features/shell/components/control-window/index.tsx'),
    source('src/features/shell/components/footer/index.tsx'),
  ].join('\n');
  const appLayoutSource = source('src/app/layouts/app-layout/index.tsx');
  const settingsPageSource = source('src/features/settings/pages/settings-page.tsx');

  expect(globalStyles).not.toContain("@use '@/assets/iconfont/iconfont.css'");
  expect(loginSources).not.toContain('iconfont');
  expect(loginSources).toContain('lucide-react');
  expect(appLayoutSource).toContain("import '@/assets/iconfont/iconfont.css'");
  expect(settingsPageSource).toContain("import '@/assets/iconfont/iconfont.css'");
});

test('progressively renders large authenticated card collections', () => {
  const progressiveHookSource = source('src/hooks/useProgressiveItems.ts');
  const deskPageSource = source('src/features/desktop/pages/desktop-page.tsx');
  const applicationPageSource = source('src/features/application/pages/application-page.tsx');
  const deskStyles = source('src/features/desktop/pages/desktop-page.scss');
  const applicationStyles = source('src/features/application/pages/application-page.scss');

  expect(progressiveHookSource).toContain('useProgressiveItems');
  expect(progressiveHookSource).not.toContain('resolvePerformanceTier');
  expect(progressiveHookSource).not.toContain('performanceTier');
  expect(progressiveHookSource).toContain('requestIdleCallback');
  expect(progressiveHookSource).toContain('initialCount');
  expect(progressiveHookSource).toContain('chunkSize');

  expect(deskPageSource).toContain('useProgressiveItems');
  expect(deskPageSource).toContain('visibleDesktopCardItems');
  expect(deskPageSource).toContain('visibleDeskPoolCardItems');
  expect(applicationPageSource).toContain('useProgressiveItems');
  expect(applicationPageSource).toContain('visibleApps');

  for (const styleSource of [deskStyles, applicationStyles]) {
    expect(styleSource).toContain('content-visibility: auto');
    expect(styleSource).toContain('contain: layout paint style');
    expect(styleSource).toContain('contain-intrinsic-size');
  }
});

test('stages login route bootstrap after first paint and avoids duplicate authenticated requests', () => {
  const routerSource = source('src/app/router/bootstrap.ts');
  const preAuthLoaderStart = routerSource.indexOf('export const preAuthConfigLoader');
  const preAuthLoaderEnd = routerSource.indexOf(
    'export const clientLayoutLoader',
    preAuthLoaderStart,
  );
  const preAuthLoaderBlock = routerSource.slice(preAuthLoaderStart, preAuthLoaderEnd);
  const bootstrapStart = routerSource.indexOf('function scheduleAuthenticatedClientBootstrap()');
  const bootstrapBlock = routerSource.slice(bootstrapStart);

  expect(routerSource).toContain('schedulePreAuthClientBootstrap');
  expect(preAuthLoaderBlock).toContain('scheduleAfterFirstPaint');
  expect(preAuthLoaderBlock).toContain('scheduleWhenIdle');
  expect(routerSource).toContain('window.requestAnimationFrame');
  expect(routerSource).toContain('window.requestIdleCallback');
  expect(preAuthLoaderBlock).toContain('fetchConfigInfo');
  expect(preAuthLoaderBlock).toContain('fetchTerminalInfo');
  expect(preAuthLoaderBlock).toContain('fetchGatewayList');
  expect(preAuthLoaderBlock).toContain('fetchClientOnlineStatus');
  expect(preAuthLoaderBlock).not.toContain('window.setTimeout(() => {');

  expect(bootstrapBlock).toContain('if (!state.gateway.gatewayList.length)');
  expect(bootstrapBlock).toContain('if (state.gateway.connected === false)');
  expect(bootstrapBlock).toContain('if (!state.config.client_id)');
  expect(bootstrapBlock).toContain('if (!state.client)');
});

test('translates desktop card menu actions in every supported locale', () => {
  const requiredDesktopMenuKeys = [
    'SET_DEFAULT',
    'CANCEL_DEFAULT',
    'PersonalDiskMounted',
    'PersonalDiskUnmounted',
  ];

  for (const language of localeLanguages) {
    const messages = locale(language);
    for (const key of requiredDesktopMenuKeys) {
      expect(messages[key], `${language} ${key}`).toBeTruthy();
      expect(messages[key], `${language} ${key}`).not.toBe(key);
    }
  }
});

test('keeps select dropdown portals above modal overlays', () => {
  const sharedUiStyles = source('src/shared/ui/styles.scss');
  const modalRootZIndex = Number(
    sharedUiStyles.match(/\.vdui-modal-root\s*\{[\s\S]*?z-index:\s*(\d+)/)?.[1],
  );
  const selectDropdownZIndex = Number(
    sharedUiStyles.match(/\.vdui-select-dropdown\s*\{[\s\S]*?z-index:\s*(\d+)/)?.[1],
  );
  const confirmRootZIndex = Number(
    sharedUiStyles.match(/\.vdui-confirm-root\s*\{[\s\S]*?z-index:\s*(\d+)/)?.[1],
  );

  expect(selectDropdownZIndex).toBeGreaterThan(modalRootZIndex);
  expect(selectDropdownZIndex).toBeLessThan(confirmRootZIndex);
});
