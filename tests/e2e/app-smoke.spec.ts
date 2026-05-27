import { expect, test } from '@playwright/test';

const ignoredConsoleFragments = [
  'WwLogin had destroyed',
  'Download the React DevTools',
  'dynamic import will not move module into another chunk',
  '[Services Error] getGatewayServer',
  '[Services Error] getClientOnlineStatus',
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
    let callbackId = 0;
    let listenerId = 0;
    let requestId = 0;
    const callbacks = new Map<number, { callback: (...args: unknown[]) => unknown; once?: boolean }>();
    const httpRequests = new Map<number, string>();

    const smokeConfig = {
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
      client_id: 'smoke-client',
      client_name: 'Smoke Client',
    };
    const cachedConfig = {
      language: smokeConfig.language,
      theme: smokeConfig.theme,
      client_id: smokeConfig.client_id,
      client_name: smokeConfig.client_name,
    };
    localStorage.setItem('ui-theme', 'dark');
    localStorage.setItem('viridian.web.config', JSON.stringify(smokeConfig));
    localStorage.setItem('viridian-desk:config', JSON.stringify(cachedConfig));

    const readConfig = () => JSON.parse(localStorage.getItem('viridian.web.config') || '{}');
    const writeConfig = (configPatch: Record<string, unknown>) => {
      const nextConfig = {
        ...readConfig(),
        ...configPatch,
      };
      localStorage.setItem('viridian.web.config', JSON.stringify(nextConfig));
      localStorage.setItem(
        'viridian-desk:config',
        JSON.stringify({
          language: nextConfig.language,
          theme: nextConfig.theme,
          client_id: nextConfig.client_id,
          client_name: nextConfig.client_name,
        }),
      );
      return nextConfig;
    };
    const getGatewayList = () => readConfig().gateway || [];
    const setGatewayList = (gateway: unknown[]) => writeConfig({ gateway });
    const getAppConf = () => {
      const config = readConfig();
      return {
        theme: config.theme || 'dark',
        auto_update: false,
        auto_start: false,
        full_screen: false,
        developer_mode: false,
        integration: false,
        language: config.language || 'zh-CN',
        gateway: config.gateway || [],
        client_id: config.client_id || 'smoke-client',
        client_name: config.client_name || 'Smoke Client',
        client_version: '2.0.1',
        api_key: '',
        log: {
          level: 'info',
          path: '',
          max_file_size: 10485760,
          rotation_strategy: 1,
        },
      };
    };
    const getHttpPayload = (url: string) => {
      if (url.includes('/loginUser')) {
        return {
          requestId: 'smoke-login',
          data: {
            userId: 'smoke-user',
            loginName: 'demo',
            userName: 'Demo User',
            type: 'Local',
            permissions: [],
          },
        };
      }

      return {
        requestId: 'smoke-list',
        data: {
          results: [],
          total: 0,
          list: [],
        },
      };
    };

    (window as any).__TAURI_EVENT_PLUGIN_INTERNALS__ = {
      unregisterListener: () => {},
    };
    (window as any).__TAURI_INTERNALS__ = {
      metadata: {
        currentWindow: {
          label: 'main',
        },
      },
      transformCallback: (callback: (...args: unknown[]) => unknown, once?: boolean) => {
        callbackId += 1;
        callbacks.set(callbackId, { callback, once });
        return callbackId;
      },
      unregisterCallback: (id: number) => {
        callbacks.delete(id);
      },
      convertFileSrc: (filePath: string) => filePath,
      invoke: async (command: string, args?: Record<string, any>) => {
        switch (command) {
          case 'get_terminal_info':
            return {
              id: 'smoke-terminal',
              osType: 'Linux',
              platform: 'linux',
              platformCode: 'linux',
              versionCode: '1',
              versionName: 'Smoke OS',
              clientIp: '127.0.0.1',
              cpuInfo: 'Smoke CPU',
              mac: '00:00:00:00:00:00',
              memInfo: 4096,
              clientType: 'desktop',
              clientOsVersion: 'debian',
              isThin: false,
              sku: 'smoke',
            };
          case 'get_client_config':
            return {
              logo: '',
              logoWhite: '',
              license: '',
              clientIconPng: '',
              clientIconIco: '',
              companyName: 'Viridian',
              isUpdate: 'Disabled',
              copyright: '',
              clientPrefix: 'viridian',
              timeout: '60',
              clientTheme: 'dark',
              deskToolbar: 'Enabled',
              deskToolbarPosition: 'right',
              companyPhone: '',
              companyEmail: '',
              gatewayAddrShowSwitch: 'Enabled',
              displayVersion: 'Enabled',
              backgroundImage: '',
              publicityImage: '',
              floatBall: 'Disabled',
              securityPassword: '',
              securityPasswordSwitch: 'Disabled',
            };
          case 'get_client_about':
            return {
              clientId: 'smoke-client',
              clientName: 'Smoke Client',
              clientVersion: '2.0.1',
              clientType: 'desktop',
              license: '',
              copyright: '',
              buildId: 'smoke',
              sku: 'smoke',
            };
          case 'get_gateway_server':
            return getGatewayList();
          case 'get_app_conf':
            return getAppConf();
          case 'get_client_online_status':
            return false;
          case 'list_usb_devices':
            return [];
          case 'kill_all_hdp_viewers':
            return null;
          case 'add_gateway_server': {
            const nextGateway = {
              uuid: `smoke-gateway-${Date.now()}`,
              name: args?.name,
              address: args?.address,
              port: 443,
              isPublic: Boolean(args?.isPublic),
              auto: Boolean(args?.auto),
            };
            setGatewayList([...getGatewayList(), nextGateway]);
            return null;
          }
          case 'switch_gateway_server': {
            const gwid = args?.gwid;
            setGatewayList(
              getGatewayList().map((gateway: any) => ({
                ...gateway,
                auto: gateway.uuid === gwid,
              })),
            );
            return null;
          }
          case 'update_gateway_server': {
            const gwid = args?.gwid;
            setGatewayList(
              getGatewayList().map((gateway: any) =>
                gateway.uuid === gwid
                  ? {
                      ...gateway,
                      name: args?.name,
                      address: args?.address,
                      isPublic: Boolean(args?.isPublic),
                    }
                  : gateway,
              ),
            );
            return null;
          }
          case 'delete_gateway_server':
            setGatewayList(getGatewayList().filter((gateway: any) => gateway.uuid !== args?.gwid));
            return null;
          case 'set_theme':
            writeConfig({ theme: args?.theme });
            return null;
          case 'set_language':
            writeConfig({ language: args?.language });
            return null;
          case 'set_developer_mode':
          case 'set_log_filter':
          case 'set_autostart':
          case 'set_fullscreen':
          case 'set_autoupdate':
          case 'login':
          case 'logout':
          case 'plugin:event|unlisten':
          case 'plugin:window|minimize':
          case 'plugin:window|maximize':
          case 'plugin:window|close':
            return null;
          case 'plugin:window|is_maximized':
          case 'plugin:window|is_fullscreen':
          case 'plugin:window|is_minimized':
            return false;
          case 'plugin:event|listen':
            listenerId += 1;
            return listenerId;
          case 'plugin:http|fetch':
            requestId += 1;
            httpRequests.set(requestId, String(args?.clientConfig?.url || ''));
            return requestId;
          case 'plugin:http|fetch_send':
            return {
              status: 200,
              statusText: 'OK',
              url: httpRequests.get(Number(args?.rid)) || '',
              headers: [['content-type', 'application/json']],
              rid: Number(args?.rid),
            };
          case 'plugin:http|fetch_read_body': {
            const url = httpRequests.get(Number(args?.rid)) || '';
            const bodyBytes = Array.from(new TextEncoder().encode(JSON.stringify(getHttpPayload(url))));
            args?.streamChannel?.onmessage?.([...bodyBytes, 0]);
            args?.streamChannel?.onmessage?.([1]);
            return null;
          }
          default:
            return null;
        }
      },
    };
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

  await expect
    .poll(() => page.evaluate(() => Number.parseFloat(getComputedStyle(document.documentElement).fontSize)))
    .toBeGreaterThan(80);
  const rootFontSize = await page.evaluate(() =>
    Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
  );
  const logoBox = await page.locator('.auth-page__brand-logo').boundingBox();
  const heroBox = await page.locator('.auth-page__hero h1').boundingBox();
  const heroRuleBox = await page.locator('.auth-page__hero-rule').boundingBox();
  const statusGridBox = await page.locator('.auth-page__status-grid').boundingBox();
  const brandZoneBox = await page.locator('.auth-page__brand-zone').boundingBox();
  const cardBox = await page.locator('.auth-page__card').boundingBox();

  if (!logoBox || !heroBox || !heroRuleBox || !statusGridBox || !brandZoneBox || !cardBox) {
    throw new Error('Login layout was not measurable');
  }

  const logoToHeroGap = heroBox.y - (logoBox.y + logoBox.height);
  const heroToRuleGap = heroRuleBox.y - (heroBox.y + heroBox.height);
  const ruleToCardsGap = statusGridBox.y - (heroRuleBox.y + heroRuleBox.height);
  const cardBottomGap =
    brandZoneBox.y + brandZoneBox.height - (statusGridBox.y + statusGridBox.height);

  expect(rootFontSize).toBeGreaterThan(80);
  expect(heroBox.width).toBeGreaterThan(500);
  expect(cardBox.width).toBeGreaterThan(360);
  expect(cardBox.x).toBeGreaterThan(heroBox.x + heroBox.width);
  expect(logoToHeroGap).toBeLessThanOrEqual(96);
  expect(heroToRuleGap).toBeLessThanOrEqual(28);
  expect(ruleToCardsGap).toBeLessThanOrEqual(84);
  expect(cardBottomGap).toBeLessThanOrEqual(104);
  expect(statusGridBox.y + statusGridBox.height).toBeLessThanOrEqual(
    brandZoneBox.y + brandZoneBox.height,
  );
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

  const cardBottomGap =
    brandZoneBox.y + brandZoneBox.height - (statusGridBox.y + statusGridBox.height);

  expect(statusGridBox.y).toBeGreaterThan(heroRuleBox.y + heroRuleBox.height);
  expect(cardBottomGap).toBeLessThanOrEqual(96);
  expect(statusGridBox.y + statusGridBox.height).toBeLessThanOrEqual(
    brandZoneBox.y + brandZoneBox.height,
  );
});

test('keeps English fullscreen login brand content visible', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 768 });
  await page.addInitScript(() => {
    const config = JSON.parse(localStorage.getItem('viridian.web.config') || '{}');
    const englishConfig = {
      ...config,
      language: 'en-US',
    };
    const englishCachedConfig = {
      language: englishConfig.language,
      theme: englishConfig.theme,
      client_id: englishConfig.client_id,
      client_name: englishConfig.client_name,
    };
    localStorage.setItem('viridian.web.config', JSON.stringify(englishConfig));
    localStorage.setItem('viridian-desk:config', JSON.stringify(englishCachedConfig));
  });
  await page.goto('/login');

  const brandZoneBox = await page.locator('.auth-page__brand-zone').boundingBox();
  const logoBox = await page.locator('.auth-page__brand-logo').boundingBox();
  const statusGridBox = await page.locator('.auth-page__status-grid').boundingBox();
  const footerBox = await page.locator('.auth-page__footer-bar').boundingBox();

  if (!brandZoneBox || !logoBox || !statusGridBox || !footerBox) {
    throw new Error('English login brand layout was not measurable');
  }

  expect(logoBox.y - brandZoneBox.y).toBeLessThanOrEqual(72);
  expect(statusGridBox.y + statusGridBox.height).toBeLessThanOrEqual(
    brandZoneBox.y + brandZoneBox.height,
  );
  expect(statusGridBox.y + statusGridBox.height).toBeLessThanOrEqual(footerBox.y - 8);
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
  await expect(page.locator('.auth-page__status-card').filter({ hasText: 'TLS 保护' })).toBeVisible();

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
  { path: '/app/malfunction', title: '工单 - Viridian Desk', selector: '.malfunction-page' },
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
