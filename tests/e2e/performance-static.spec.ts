import { expect, test } from '@playwright/test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const fileSize = (path: string) => statSync(join(process.cwd(), path)).size;

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

test('loads the assistant panel only when the user opens it', () => {
  expect(source('src/layouts/AppLayout/index.tsx')).not.toContain(
    "import { AssistantPanel } from '@/ui/assistant/assistant-panel'",
  );
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

test('loads slider verification images on demand', () => {
  const sliderSource = source('src/components/SliderVerify/index.tsx');

  expect(sliderSource).not.toContain("import img0 from '@/assets/images/verify/0.jpg'");
  expect(sliderSource).not.toContain("import img9 from '@/assets/images/verify/9.jpg'");
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

test('keeps slider verification image assets small', () => {
  const verifyDir = join(process.cwd(), 'src/assets/images/verify');
  const totalBytes = readdirSync(verifyDir)
    .filter((fileName) => fileName.endsWith('.jpg'))
    .reduce((total, fileName) => total + fileSize(`src/assets/images/verify/${fileName}`), 0);

  expect(totalBytes).toBeLessThanOrEqual(150_000);
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
