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
  expect(source('src/pages/malfunction/index.tsx')).not.toContain("import CreatedModal from './create'");
  expect(source('src/pages/desk/DeskPage.tsx')).not.toContain(
    "import DeskPoolModal from './components/deskPoolDetail'",
  );
});

test('loads the assistant panel only when the user opens it', () => {
  expect(source('src/layouts/AppLayout/index.tsx')).not.toContain(
    "import { AssistantPanel } from '@/ui/assistant/assistant-panel'",
  );
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

test('loads slider verification images on demand', () => {
  const sliderSource = source('src/components/SliderVerify/index.tsx');

  expect(sliderSource).not.toContain("import img0 from '@/assets/images/verify/0.jpg'");
  expect(sliderSource).not.toContain("import img9 from '@/assets/images/verify/9.jpg'");
});

test('keeps the app shell background CSS-only', () => {
  expect(source('src/styles/theme.scss')).not.toContain('app_layout_bg.png');
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
