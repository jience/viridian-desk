import { appStore } from '@/store';
import { fetchConfigInfo } from '@/store/feature/config';
import { fetchClientOnlineStatus, fetchGatewayList, setNetwork } from '@/store/feature/gateway';
import { fetchTerminalInfo } from '@/store/feature/terminal';
import { RouteErrorBoundary } from '@/ui/shell/error-boundary';
import { RouteFallback } from '@/ui/shell/route-fallback';
import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';

const LoginPage = lazy(() => import('@/pages/login/LoginPage'));
const SettingsPage = lazy(() => import('@/pages/configPage/SettingsPage'));
const ClientLayout = lazy(() => import('../layouts/clientLayout'));
const AppLayout = lazy(() =>
  import('@/layouts/AppLayout').then((module) => ({ default: module.AppLayout })),
);
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

const preAuthConfigLoader = async () => {
  await Promise.all([
    appStore.dispatch(fetchConfigInfo()),
    appStore.dispatch(fetchGatewayList()),
    appStore.dispatch(fetchClientOnlineStatus()),
  ]);
  return null;
};

const clientLayoutLoader = async () => {
  appStore.dispatch(setNetwork(navigator.onLine));
  const state = appStore.getState();
  if (!state.terminal) {
    await appStore.dispatch(fetchTerminalInfo());
  }
  await appStore.dispatch(fetchConfigInfo());
  return null;
};

const rootRoutes: RouteObject[] = [
  {
    path: '/',
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        loader: preAuthConfigLoader,
        element: routeElement(<LoginPage />),
      },
    ],
  },
  {
    path: '/',
    element: <ClientLayout />,
    errorElement: <RouteErrorBoundary />,
    loader: clientLayoutLoader,
    children: [
      {
        path: 'configPage',
        element: routeElement(<SettingsPage />),
        children: createSettingsRoutes(),
      },
      {
        path: 'app',
        element: routeElement(<AppLayout />),
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
