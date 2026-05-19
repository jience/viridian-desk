import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
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
