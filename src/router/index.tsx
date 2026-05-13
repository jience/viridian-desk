import { BasicLayout } from '@/layouts/BasicLayout';
import RedesignPreview from '@/features/redesign-preview';
import { LoginAuthType } from '@/native/interfaces/login_history';
import { Application } from '@/pages/application';
import ConfigPage from '@/pages/configPage';
import About from '@/pages/configPage/subPages/about';
import AdvancedSetting from '@/pages/configPage/subPages/advancedSetting';
import CurrencySetting from '@/pages/configPage/subPages/commonSetting';
import ServerSetting from '@/pages/configPage/subPages/serverSetting';
import { appStore } from '@/store';
import { getLoginHistory, setCurrentLoginType } from '@/store/feature/app';
import { fetchConfigInfo } from '@/store/feature/config';
import { setNetwork } from '@/store/feature/gateway';
import { fetchTerminalInfo } from '@/store/feature/terminal';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import ClientLayout from '../layouts/clientLayout';
import { Component as Approval } from '../pages/approval';
import { Component as Desk } from '../pages/desk';
import { Component as DeskDetail } from '../pages/deskDetail';
import Login from '../pages/login';
import { Component as Malfunction } from '../pages/malfunction';
import { Component as PeripheralSetting } from '../pages/peripheralSetting';

const rootRoutes: RouteObject[] = [
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
        element: <Login />,
      },
      {
        path: 'redesign-preview',
        element: <RedesignPreview />,
      },
      {
        path: 'configPage',
        element: <ConfigPage />,
        children: [
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
        ],
      },
      {
        path: 'app',
        element: <BasicLayout />,
        children: [
          {
            path: 'desk',
            element: <Desk />,
          },
          {
            path: 'application',
            element: <Application />,
          },
          {
            path: 'deskDetail',
            element: <DeskDetail />,
          },
          {
            path: 'peripheral',
            element: <PeripheralSetting />,
          },
          {
            path: 'malfunction',
            element: <Malfunction />,
          },
          {
            path: 'approval',
            element: <Approval />,
          },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(rootRoutes);

export default router;
