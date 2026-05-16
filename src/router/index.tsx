import { LoginAuthType } from '@/native/interfaces/login_history';
import { RedesignAppLayout } from '@/layouts/RedesignAppLayout';
import { Application } from '@/pages/application';
import RedesignConfigPage from '@/pages/configPage/redesign';
import About from '@/pages/configPage/subPages/about';
import AdvancedSetting from '@/pages/configPage/subPages/advancedSetting';
import CurrencySetting from '@/pages/configPage/subPages/commonSetting';
import ServerSetting from '@/pages/configPage/subPages/serverSetting';
import { Component as RedesignDesk } from '@/pages/desk/redesign';
import { Component as RedesignDeskDetail } from '@/pages/deskDetail/redesign';
import { appStore } from '@/store';
import { getLoginHistory, setCurrentLoginType } from '@/store/feature/app';
import { fetchConfigInfo } from '@/store/feature/config';
import { setNetwork } from '@/store/feature/gateway';
import { fetchTerminalInfo } from '@/store/feature/terminal';
import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from 'react-router';
import ClientLayout from '../layouts/clientLayout';
import { Component as Approval } from '../pages/approval';
import RedesignLogin from '../pages/login/redesign';
import { Component as Malfunction } from '../pages/malfunction';
import { Component as PeripheralSetting } from '../pages/peripheralSetting';

const createSettingsRoutes = (): RouteObject[] => [
  {
    index: true,
    element: <Navigate to="serverSetting" replace />,
  },
  {
    path: 'serverSetting',
    element: <ServerSetting />,
  },
  {
    path: 'commonSetting',
    element: <CurrencySetting />,
  },
  {
    path: 'advancedSetting',
    element: <AdvancedSetting />,
  },
  {
    path: 'about',
    element: <About />,
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
  { path: 'application', element: <Application /> },
  { path: 'deskDetail', element: deskDetail },
  { path: 'peripheral', element: <PeripheralSetting /> },
  { path: 'malfunction', element: <Malfunction /> },
  { path: 'approval', element: <Approval /> },
];

const rootRoutes: RouteObject[] = [
  {
    path: '/redesign-preview',
    loader: async () => {
      await appStore.dispatch(fetchConfigInfo());
      return null;
    },
    lazy: async () => {
      const { default: RedesignPreview } = await import('@/features/redesign-preview');
      return { Component: RedesignPreview };
    },
  },
  {
    path: '/',
    element: <ClientLayout />,
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
        element: <RedesignLogin />,
      },
      {
        path: 'configPage',
        element: <RedesignConfigPage />,
        children: createSettingsRoutes(),
      },
      {
        path: 'app',
        element: <RedesignAppLayout />,
        children: createAppRoutes({
          desk: <RedesignDesk />,
          deskDetail: <RedesignDeskDetail />,
        }),
      },
    ],
  },
];

const router = createBrowserRouter(rootRoutes);

export default router;
