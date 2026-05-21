import { expect, test } from '@playwright/test';

const ignoredConsoleFragments = [
  'WwLogin had destroyed',
  'Download the React DevTools',
  'dynamic import will not move module into another chunk',
];

test.beforeEach(async ({ page }) => {
  const consoleErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (ignoredConsoleFragments.some((fragment) => text.includes(fragment))) return;
    consoleErrors.push(text);
  });

  page.on('pageerror', (error) => {
    consoleErrors.push(error.message);
  });

  await page.addInitScript(() => {
    localStorage.setItem('ui-theme', 'dark');
    localStorage.setItem(
      'viridian.web.config',
      JSON.stringify({
        gateway: [
          {
            uuid: 'smoke-gateway',
            name: 'Smoke Gateway',
            address: 'gateway.local',
            port: 443,
            isPublic: true,
            auto: true,
          },
        ],
        language: 'zh-CN',
        theme: 'dark',
      }),
    );
  });

  await page.exposeFunction('__assertNoConsoleErrors', () => {
    expect(consoleErrors).toEqual([]);
  });
});

test('renders login page shell', async ({ page }) => {
  await page.goto('/login');

  await expect(page).toHaveTitle('登录 - Viridian Desk');
  await expect(page.locator('.auth-page')).toBeVisible();
  await expect(page.locator('.auth-page__brand-logo')).toHaveAttribute('alt', /viridian desk/i);
  await expect(page.locator('.auth-page__card')).toBeVisible();

  await page.evaluate(() => window.__assertNoConsoleErrors());
});

test('keeps login layout scaled to the desktop viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 820 });
  await page.goto('/login');

  const rootFontSize = await page.evaluate(() =>
    Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
  );
  const heroBox = await page.locator('.auth-page__hero h1').boundingBox();
  const cardBox = await page.locator('.auth-page__card').boundingBox();

  if (!heroBox || !cardBox) {
    throw new Error('Login layout was not measurable');
  }

  expect(rootFontSize).toBeGreaterThan(80);
  expect(heroBox.width).toBeGreaterThan(500);
  expect(cardBox.width).toBeGreaterThan(360);
  expect(cardBox.x).toBeGreaterThan(heroBox.x + heroBox.width);
  await expect(page.locator('.auth-page')).toBeInViewport();

  await page.evaluate(() => window.__assertNoConsoleErrors());
});

test('keeps login hero and feature cards separated in fullscreen desktop height', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 640 });
  await page.goto('/login');

  const heroRuleBox = await page.locator('.auth-page__hero-rule').boundingBox();
  const statusGridBox = await page.locator('.auth-page__status-grid').boundingBox();
  const brandZoneBox = await page.locator('.auth-page__brand-zone').boundingBox();

  if (!heroRuleBox || !statusGridBox || !brandZoneBox) {
    throw new Error('Login brand layout was not measurable');
  }

  expect(statusGridBox.y).toBeGreaterThanOrEqual(heroRuleBox.y + heroRuleBox.height + 24);
  expect(statusGridBox.y + statusGridBox.height).toBeLessThanOrEqual(brandZoneBox.y + brandZoneBox.height);
});

test('renders pre-login settings route', async ({ page }) => {
  await page.goto('/configPage/serverSetting');

  await expect(page).toHaveTitle('服务器 - Viridian Desk');
  await expect(page.locator('.settings-page')).toBeVisible();
  await expect(page.locator('.settings-page__brand-mark .icon-setting2')).toBeVisible();
  await expect(page.locator('.settings-page__nav-button[aria-current="page"]')).toBeVisible();

  await page.evaluate(() => window.__assertNoConsoleErrors());
});

test('switches theme from settings', async ({ page }) => {
  await page.goto('/configPage/commonSetting');

  await expect(page).toHaveTitle('通用 - Viridian Desk');
  await expect(page.locator('html')).toHaveAttribute('data-ui-theme', 'dark');

  await page.getByRole('button', { name: /浅色/ }).click();

  await expect(page.locator('html')).toHaveAttribute('data-ui-theme', 'light');
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem('viridian.web.config') || '{}').theme),
    )
    .toBe('light');

  await page.evaluate(() => window.__assertNoConsoleErrors());
});

test('navigates away from common settings without update loop', async ({ page }) => {
  await page.goto('/configPage/commonSetting');

  await expect(page).toHaveTitle('通用 - Viridian Desk');

  await page.getByRole('button', { name: /关于/ }).click();
  await expect(page).toHaveURL(/\/configPage\/about$/);
  await expect(page).toHaveTitle('关于 - Viridian Desk');

  await page.getByRole('button', { name: /服务器/ }).click();
  await expect(page).toHaveURL(/\/configPage\/serverSetting$/);
  await expect(page).toHaveTitle('服务器 - Viridian Desk');

  await page.evaluate(() => window.__assertNoConsoleErrors());
});

test('validates and creates a gateway from settings modal', async ({ page }) => {
  await page.goto('/configPage/serverSetting');

  await page.getByRole('button', { name: /添加服务器/ }).click();
  const dialog = page.getByRole('dialog', { name: /添加接入服务器/ });
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused();

  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press('Tab');
    await expect
      .poll(() => dialog.evaluate((element) => element.contains(document.activeElement)))
      .toBe(true);
  }

  await page.keyboard.press('Shift+Tab');
  await expect
    .poll(() => dialog.evaluate((element) => element.contains(document.activeElement)))
    .toBe(true);

  await dialog.getByRole('button', { name: /保存/ }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('请输入服务器名称')).toBeVisible();
  await expect(dialog.getByText('请输入服务器地址')).toBeVisible();

  await dialog.getByPlaceholder('请输入服务器名称').fill('ProdGW');
  await dialog.getByPlaceholder('请输入服务器地址').fill('prod.example.com');
  await dialog.getByRole('switch').click();
  await dialog.getByRole('button', { name: /保存/ }).click();

  await expect(page.locator('.server-setting-gateway-name', { hasText: 'ProdGW' })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem('viridian.web.config') || '{}').gateway?.some(
          (gateway: { name?: string; address?: string; isPublic?: boolean }) =>
            gateway.name === 'ProdGW' &&
            gateway.address === 'prod.example.com' &&
            gateway.isPublic === true,
        ),
      ),
    )
    .toBe(true);

  await page.evaluate(() => window.__assertNoConsoleErrors());
});

test('opens gateway action menu with keyboard', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'viridian.web.config',
      JSON.stringify({
        gateway: [
          {
            uuid: 'keyboard-gateway-a',
            name: 'Keyboard Gateway A',
            address: 'gateway-a.local',
            port: 443,
            isPublic: true,
            auto: true,
          },
          {
            uuid: 'keyboard-gateway-b',
            name: 'Keyboard Gateway B',
            address: 'gateway-b.local',
            port: 443,
            isPublic: true,
            auto: false,
          },
        ],
        language: 'zh-CN',
        theme: 'dark',
      }),
    );
  });
  await page.goto('/configPage/serverSetting');

  const moreButton = page
    .locator('.server-setting-gateway-row', { hasText: 'Keyboard Gateway B' })
    .getByRole('button', { name: /更多/ });
  await moreButton.focus();
  await moreButton.press('Enter');

  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: /编辑/ })).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: /启用/ })).toBeFocused();

  await page.keyboard.press('End');
  await expect(menu.getByRole('menuitem', { name: /删除/ })).toBeFocused();

  await page.keyboard.press('Home');
  await expect(menu.getByRole('menuitem', { name: /编辑/ })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(moreButton).toBeFocused();

  await page.evaluate(() => window.__assertNoConsoleErrors());
});

test('keeps login submit disabled when gateway is disconnected', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('请输入用户名').fill('demo');
  await page.getByPlaceholder('请输入密码').fill('demo-password');

  await expect(page.getByRole('button', { name: /^登录$/ })).toBeDisabled();
  await expect(
    page
      .locator('.auth-page__status-card')
      .filter({ hasText: 'Smoke Gateway' })
      .filter({ hasText: '未连接' }),
  ).toBeVisible();

  await page.evaluate(() => window.__assertNoConsoleErrors());
});

test('renders app empty state for no-permission route', async ({ page }) => {
  await page.goto('/app/empty');

  await expect(page).toHaveTitle('无可用资源 - Viridian Desk');
  await expect(page.locator('.app-layout')).toBeVisible();
  await expect(page.locator('.empty-page')).toBeVisible();
  await expect(page.locator('#empty-page-title')).toBeVisible();

  await page.evaluate(() => window.__assertNoConsoleErrors());
});

const appRouteSmokeCases = [
  { path: '/app/desk', title: '桌面 - Viridian Desk', selector: '.desk-page' },
  { path: '/app/application', title: '应用 - Viridian Desk', selector: '.application-page' },
  { path: '/app/peripheral', title: '外设 - Viridian Desk', selector: '.peripheralSetting' },
  { path: '/app/approval', title: '流程 - Viridian Desk', selector: '.approval-page' },
  { path: '/app/malfunction', title: '桌面问题 - Viridian Desk', selector: '.malfunction-page' },
];

for (const appRoute of appRouteSmokeCases) {
  test(`renders main route ${appRoute.path}`, async ({ page }) => {
    await page.goto(appRoute.path);

    await expect(page).toHaveTitle(appRoute.title);
    await expect(page.locator('.app-layout')).toBeVisible();
    await expect(page.locator(appRoute.selector)).toBeVisible();

    await page.evaluate(() => window.__assertNoConsoleErrors());
  });
}

declare global {
  interface Window {
    __assertNoConsoleErrors: () => void;
  }
}
