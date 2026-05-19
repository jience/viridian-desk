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
  await expect(page.locator('.auth-page__brand-name')).toHaveText(/viridian desk/i);
  await expect(page.locator('.auth-page__card')).toBeVisible();

  await page.evaluate(() => window.__assertNoConsoleErrors());
});

test('renders pre-login settings route', async ({ page }) => {
  await page.goto('/configPage/serverSetting');

  await expect(page).toHaveTitle('服务器 - Viridian Desk');
  await expect(page.locator('.settings-page')).toBeVisible();
  await expect(page.locator('.settings-page__brand-mark .icon-setting2')).toBeVisible();
  await expect(page.locator('.settings-page__nav-button[aria-current="page"]')).toBeVisible();

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

declare global {
  interface Window {
    __assertNoConsoleErrors: () => void;
  }
}
