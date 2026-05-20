import type { LoginUserInfo, LoginUserReq, TerminalPhoneLoginReq } from '@/native/interfaces/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { setCurrentUser } from '@/store/feature/app';
import { selectIsThin } from '@/store/feature/terminal';
import Actions from '@/utils/actions';
import { encryption, LEGACY_PASSWORD_PREFIX } from '@/utils/utils';
import { message } from '@/ui';
import { useNavigate } from 'react-router';

export const useLoginSuccessHandler = () => {
  const navigate = useNavigate();
  const appDispatch = useAppDispatch();

  const isThin = useAppSelector(selectIsThin);

  // 登录成功后跳转路由的权限对照
  const getRouteActionMap = () => {
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

  const loginSuccessActionRoute = (userPermissions: string[]) => {
    const routActionMap = getRouteActionMap();
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
  const loginSuccessFun = async (res: LoginUserInfo, req: TerminalPhoneLoginReq | LoginUserReq) => {
    // TODO 后面需要去除password字段
    if ((req as LoginUserReq).password) {
      const password = encryption(
        LEGACY_PASSWORD_PREFIX + '-' + (req as LoginUserReq).password + '_' + new Date().getTime(),
      );
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

    loginSuccessActionRoute(res.permissions || []);
  };

  return {
    loginSuccessFun,
  };
};
