import { lazy } from 'react';

export const LoginPage = lazy(() => import('@/pages/login'));
export const SettingsPage = lazy(() => import('@/pages/configPage'));
export const ClientLayout = lazy(() => import('@/app/layouts/client-layout'));
export const AppLayout = lazy(() =>
  import('@/app/layouts/app-layout').then((module) => ({ default: module.AppLayout })),
);
export const ServerSetting = lazy(() => import('@/pages/configPage/serverSetting'));
export const CurrencySetting = lazy(() => import('@/pages/configPage/commonSetting'));
export const AdvancedSetting = lazy(() => import('@/pages/configPage/advancedSetting'));
export const About = lazy(() => import('@/pages/configPage/about'));
export const DeskPage = lazy(() =>
  import('@/pages/desk').then((module) => ({ default: module.DeskPage })),
);
export const DeskDetailPage = lazy(() =>
  import('@/pages/deskDetail').then((module) => ({
    default: module.DeskDetailPage,
  })),
);
export const Application = lazy(() =>
  import('@/pages/application').then((module) => ({ default: module.Application })),
);
export const PeripheralSetting = lazy(() =>
  import('@/pages/peripheralSetting').then((module) => ({ default: module.Component })),
);
export const Malfunction = lazy(() =>
  import('@/pages/malfunction').then((module) => ({ default: module.Component })),
);
export const Approval = lazy(() =>
  import('@/pages/approval').then((module) => ({ default: module.Component })),
);
export const EmptyPage = lazy(() =>
  import('@/pages/empty').then((module) => ({ default: module.EmptyPage })),
);
