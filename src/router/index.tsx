import { BasicLayout } from '@/layouts/BasicLayout';
import { LoginAuthType } from '@/native/interfaces/login_history';
import { isRedesignAuthEnabled } from '@/features/redesign-auth/enabled';
import { Application } from '@/pages/application';
import ConfigPage from '@/pages/configPage';
import RedesignConfigPage from '@/pages/configPage/redesign';
import About from '@/pages/configPage/subPages/about';
import AdvancedSetting from '@/pages/configPage/subPages/advancedSetting';
import CurrencySetting from '@/pages/configPage/subPages/commonSetting';
import ServerSetting from '@/pages/configPage/subPages/serverSetting';
import { appStore } from '@/store';
import { getLoginHistory, setCurrentLoginType } from '@/store/feature/app';
import { fetchConfigInfo } from '@/store/feature/config';
import { setNetwork } from '@/store/feature/gateway';
import { fetchTerminalInfo } from '@/store/feature/terminal';
import { useContext, useMemo } from 'react';
import {
  createBrowserRouter,
  Navigate,
  UNSAFE_DataRouterContext,
  UNSAFE_NavigationContext,
  type NavigateOptions,
  type Navigator as RouterNavigator,
  type RouteObject,
  type RouterNavigateOptions,
  type To,
} from 'react-router';
import ClientLayout from '../layouts/clientLayout';
import { Component as Approval } from '../pages/approval';
import { Component as Desk } from '../pages/desk';
import { Component as DeskDetail } from '../pages/deskDetail';
import Login from '../pages/login';
import RedesignLogin from '../pages/login/redesign';
import { Component as Malfunction } from '../pages/malfunction';
import { Component as PeripheralSetting } from '../pages/peripheralSetting';

const ActiveLogin = isRedesignAuthEnabled ? RedesignLogin : Login;
const ActiveConfigPage = isRedesignAuthEnabled ? RedesignConfigPage : ConfigPage;
const configPagePathPattern = /^\/configPage(?=\/|$)/;

const rewriteLegacyConfigPath = (to: To): To => {
  if (typeof to === 'string') {
    return to.replace(configPagePathPattern, '/legacy-configPage');
  }

  if (to.pathname) {
    return {
      ...to,
      pathname: to.pathname.replace(configPagePathPattern, '/legacy-configPage'),
    };
  }

  return to;
};

// eslint-disable-next-line react-refresh/only-export-components
function LegacyConfigPageRoute() {
  const dataRouterContext = useContext(UNSAFE_DataRouterContext);
  const navigationContext = useContext(UNSAFE_NavigationContext);

  const legacyDataRouterContext = useMemo(() => {
    if (!dataRouterContext) return dataRouterContext;

    const { router } = dataRouterContext;
    const legacyRouter = Object.create(router) as typeof router;

    legacyRouter.navigate = (async (
      to: number | To | null,
      opts?: RouterNavigateOptions,
    ): Promise<void> => {
      if (typeof to === 'number') {
        await router.navigate(to);
        return;
      }

      await router.navigate(to === null ? to : rewriteLegacyConfigPath(to), opts);
    }) as typeof router.navigate;

    return {
      ...dataRouterContext,
      router: legacyRouter,
    };
  }, [dataRouterContext]);

  const legacyNavigationContext = useMemo(() => {
    const { navigator } = navigationContext;
    const legacyNavigator: RouterNavigator = {
      ...navigator,
      push: (to: To, state?: unknown, opts?: NavigateOptions) => {
        navigator.push(rewriteLegacyConfigPath(to), state, opts);
      },
      replace: (to: To, state?: unknown, opts?: NavigateOptions) => {
        navigator.replace(rewriteLegacyConfigPath(to), state, opts);
      },
    };

    return {
      ...navigationContext,
      navigator: legacyNavigator,
    };
  }, [navigationContext]);

  return (
    <UNSAFE_DataRouterContext.Provider value={legacyDataRouterContext}>
      <UNSAFE_NavigationContext.Provider value={legacyNavigationContext}>
        <ConfigPage />
      </UNSAFE_NavigationContext.Provider>
    </UNSAFE_DataRouterContext.Provider>
  );
}

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
        element: <ActiveLogin />,
      },
      {
        path: 'legacy-login',
        element: <Login />,
      },
      {
        path: 'configPage',
        element: <ActiveConfigPage />,
        children: createSettingsRoutes(),
      },
      {
        path: 'legacy-configPage',
        element: <LegacyConfigPageRoute />,
        children: createSettingsRoutes(),
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
