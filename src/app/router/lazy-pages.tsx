import { lazy, type ComponentType } from 'react';

const lazyNamedRoute = <T extends Record<string, unknown>>(
  loader: () => Promise<T>,
  exportName: keyof T,
) =>
  lazy(async () => {
    const module = await loader();
    return { default: module[exportName] as ComponentType };
  });

export const LoginPage = lazyNamedRoute(
  () => import('@/features/auth/routes/login-route'),
  'LoginPage',
);
export const SettingsPage = lazyNamedRoute(
  () => import('@/features/settings/routes/settings-route'),
  'SettingsPage',
);
export const ClientLayout = lazy(() => import('@/app/layouts/client-layout'));
export const AppLayout = lazy(() =>
  import('@/app/layouts/app-layout').then((module) => ({ default: module.AppLayout })),
);
export const ServerSetting = lazyNamedRoute(
  () => import('@/features/settings/routes/server-setting-route'),
  'ServerSetting',
);
export const CurrencySetting = lazyNamedRoute(
  () => import('@/features/settings/routes/common-setting-route'),
  'CommonSetting',
);
export const AdvancedSetting = lazyNamedRoute(
  () => import('@/features/settings/routes/advanced-setting-route'),
  'AdvancedSetting',
);
export const About = lazyNamedRoute(() => import('@/features/settings/routes/about-route'), 'About');
export const DeskPage = lazyNamedRoute(
  () => import('@/features/desktop/routes/desktop-route'),
  'DeskPage',
);
export const DeskDetailPage = lazyNamedRoute(
  () => import('@/features/desktop/routes/desktop-detail-route'),
  'DeskDetailPage',
);
export const Application = lazyNamedRoute(
  () => import('@/features/application/routes/application-route'),
  'Application',
);
export const PeripheralSetting = lazyNamedRoute(
  () => import('@/features/peripheral/routes/peripheral-route'),
  'Component',
);
export const Malfunction = lazyNamedRoute(
  () => import('@/features/malfunction/routes/malfunction-route'),
  'Component',
);
export const Approval = lazyNamedRoute(
  () => import('@/features/approval/routes/approval-route'),
  'Component',
);
export const EmptyPage = lazyNamedRoute(
  () => import('@/features/empty/routes/empty-route'),
  'EmptyPage',
);
