import { LoginAuthType } from '@/native/interfaces/login_history';
import { AppLayout } from '@/layouts/AppLayout';
import { appStore } from '@/store';
import { getLoginHistory, setCurrentLoginType } from '@/store/feature/app';
import { fetchConfigInfo } from '@/store/feature/config';
import { setNetwork } from '@/store/feature/gateway';
import { fetchTerminalInfo } from '@/store/feature/terminal';
import { RouteErrorBoundary } from '@/ui/shell/error-boundary';
import { RouteFallback } from '@/ui/shell/route-fallback';
import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import ClientLayout from '../layouts/clientLayout';

const LoginPage = lazy(() => import('@/pages/login/LoginPage'));
const SettingsPage = lazy(() => import('@/pages/configPage/SettingsPage'));
const ServerSetting = lazy(() => import('@/pages/configPage/subPages/serverSetting'));
const CurrencySetting = lazy(() => import('@/pages/configPage/subPages/commonSetting'));
const AdvancedSetting = lazy(() => import('@/pages/configPage/subPages/advancedSetting'));
const About = lazy(() => import('@/pages/configPage/subPages/about'));
const DeskPage = lazy(() =>
  import('@/pages/desk/DeskPage').then((module) => ({ default: module.DeskPage })),
);
const DeskDetailPage = lazy(() =>
  import('@/pages/deskDetail/DeskDetailPage').then((module) => ({
    default: module.DeskDetailPage,
  })),
);
const Application = lazy(() =>
  import('@/pages/application').then((module) => ({ default: module.Application })),
);
const PeripheralSetting = lazy(() =>
  import('@/pages/peripheralSetting').then((module) => ({ default: module.Component })),
);
const Malfunction = lazy(() =>
  import('@/pages/malfunction').then((module) => ({ default: module.Component })),
);
const Approval = lazy(() =>
  import('@/pages/approval').then((module) => ({ default: module.Component })),
);
const EmptyPage = lazy(() =>
  import('@/pages/empty/EmptyPage').then((module) => ({ default: module.EmptyPage })),
);

const routeElement = (node: ReactNode) => <Suspense fallback={<RouteFallback />}>{node}</Suspense>;

const createSettingsRoutes = (): RouteObject[] => [
  {
    index: true,
    element: <Navigate to="serverSetting" replace />,
  },
  {
    path: 'serverSetting',
    element: routeElement(<ServerSetting />),
  },
  {
    path: 'commonSetting',
    element: routeElement(<CurrencySetting />),
  },
  {
    path: 'advancedSetting',
    element: routeElement(<AdvancedSetting />),
  },
  {
    path: 'about',
    element: routeElement(<About />),
  },
  {
    path: '*',
    element: <Navigate to="serverSetting" replace />,
  },
];

const createAppRoutes = ({
  desk,
  deskDetail,
}: {
  desk: RouteObject['element'];
  deskDetail: RouteObject['element'];
}): RouteObject[] => [
  { path: 'desk', element: desk },
  { path: 'application', element: routeElement(<Application />) },
  { path: 'deskDetail', element: deskDetail },
  { path: 'peripheral', element: routeElement(<PeripheralSetting />) },
  { path: 'malfunction', element: routeElement(<Malfunction />) },
  { path: 'approval', element: routeElement(<Approval />) },
  { path: 'empty', element: routeElement(<EmptyPage />) },
  { path: '*', element: routeElement(<EmptyPage />) },
];

const rootRoutes: RouteObject[] = [
  {
    path: '/',
    element: <ClientLayout />,
    errorElement: <RouteErrorBoundary />,
    // HydrateFallback: () => {
    //   return <div>Loading...</div>;
    // },
    loader: async () => {
      appStore.dispatch(setNetwork(navigator.onLine));
      await appStore.dispatch(fetchTerminalInfo());
      await appStore.dispatch(fetchConfigInfo());

      // 获取登录历史记录，并设置当前登录方式
      const res = await appStore.dispatch(getLoginHistory());
      if (getLoginHistory.fulfilled.match(res)) {
        // 获取第一个登录历史条目的登录类型
        const firstEntry = res.payload.history[0];
        const firstLoginType = firstEntry ? firstEntry.loginType : LoginAuthType.LOCAL;
        // 更新当前登录方式
        appStore.dispatch(setCurrentLoginType(firstLoginType));
      }
      return null;
    },
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />, // 使用Navigate组件重定向到/login
      },
      {
        path: 'login',
        element: routeElement(<LoginPage />),
      },
      {
        path: 'configPage',
        element: routeElement(<SettingsPage />),
        children: createSettingsRoutes(),
      },
      {
        path: 'app',
        element: <AppLayout />,
        children: createAppRoutes({
          desk: routeElement(<DeskPage />),
          deskDetail: routeElement(<DeskDetailPage />),
        }),
      },
      {
        path: '*',
        element: <Navigate to="/login" replace />,
      },
    ],
  },
];

const router = createBrowserRouter(rootRoutes);

export default router;
