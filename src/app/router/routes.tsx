import { Navigate, type RouteObject } from 'react-router';

import { RouteErrorBoundary } from '@/shared/ui/shell/error-boundary';

import { clientLayoutLoader, preAuthConfigLoader } from './bootstrap';
import {
  About,
  AdvancedSetting,
  AppLayout,
  Application,
  Approval,
  ClientLayout,
  CurrencySetting,
  DeskDetailPage,
  DeskPage,
  EmptyPage,
  LoginPage,
  Malfunction,
  PeripheralSetting,
  ServerSetting,
  SettingsPage,
} from './lazy-pages';
import { routeElement } from './route-element';

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

export const rootRoutes: RouteObject[] = [
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
