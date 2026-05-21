import type { LoginUserInfo, LoginUserReq } from '@/native/interfaces/api';
import { useAppDispatch } from '@/store';
import { setCurrentUser } from '@/store/feature/app';
import { fetchTerminalInfo } from '@/store/feature/terminal';
import Actions from '@/utils/actions';
import { message } from '@/ui';
import { logger } from '@/utils/logger';
import { useNavigate } from 'react-router';

export const useLoginSuccessHandler = () => {
  const navigate = useNavigate();
  const appDispatch = useAppDispatch();

  // 登录成功后跳转路由的权限对照
  const getRouteActionMap = (isThin?: boolean) => {
    const routeActionMap: { [key: string]: any } = {
      '/app/desk': Actions.TerminalRODesktopRead,
    };
    if (!isThin) {
      routeActionMap['/app/application'] = [
        Actions.TerminalROAppRead,
        Actions.TerminalRORemoteAppRead,
      ];
    }
    // 保证菜单顺序
    Object.assign(routeActionMap, {
      '/app/approval': Actions.TerminalROApplyManageRead,
      '/app/malfunction': Actions.TerminalROMalfunctionRead,
    });
    return routeActionMap;
  };

  const resolveTerminalThinMode = async () => {
    try {
      const terminalInfo = await appDispatch(fetchTerminalInfo()).unwrap();
      return Boolean(terminalInfo?.isThin);
    } catch (error) {
      logger.debug('fetchTerminalInfo before login route selection failed', error);
      return false;
    }
  };

  const loginSuccessActionRoute = (userPermissions: string[], isThin?: boolean) => {
    const routActionMap = getRouteActionMap(isThin);
    const routes = Object.keys(routActionMap).filter((route: any) => {
      const auths = routActionMap[route];
      if (Array.isArray(auths)) {
        for (const item of auths) {
          const isInclude = userPermissions.includes(item);
          if (isInclude) return isInclude;
        }
        return false;
      } else {
        return userPermissions.includes(auths);
      }
    });
    if (routes.length) {
      navigate(routes[0]);
    } else {
      navigate('/app/empty');
    }
  };

  // 登录成功后回调的处理
  const loginSuccessFun = async (res: LoginUserInfo, req: LoginUserReq) => {
    // TODO 后面需要去除password字段
    if (req.password) {
      const { encryptionPassword } = await import('@/utils/passwordCrypto');
      const password = encryptionPassword(req.password);
      await appDispatch(
        setCurrentUser({
          ...res,
          password,
        }),
      );
    } else {
      await appDispatch(
        setCurrentUser({
          ...res,
          password: '',
        }),
      );
    }

    if (res.passwordIsExpireSoon) {
      message.warning('您的密码即将过期，请及时修改密码以确保账户安全!');
    }

    const isThin = await resolveTerminalThinMode();
    loginSuccessActionRoute(res.permissions || [], isThin);
  };

  return {
    loginSuccessFun,
  };
};
