import type { LoginUserInfo, LoginUserReq, TerminalPhoneLoginReq } from '@/native/interfaces/api';
import { LoginAuthType, type AddHistoryEntryParams } from '@/native/interfaces/login_history';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  addLoginEntry,
  selectIsAutoLogin,
  selectIsRememberMe,
  setAutoLogin,
  setCurrentUser,
  setRememberMe,
} from '@/store/feature/app';
import { selectIsThin } from '@/store/feature/terminal';
import Actions from '@/utils/actions';
import { encryption } from '@/utils/utils';
import { message } from '@/ui';
import { useNavigate } from 'react-router';

export const useLoginSuccessHandler = (opt: {
  autoLoginChecked: boolean;
  rememberMeChecked: boolean;
}) => {
  const { autoLoginChecked, rememberMeChecked } = opt;

  const navigate = useNavigate();
  const appDispatch = useAppDispatch();

  const isAutoLogin = useAppSelector(selectIsAutoLogin);
  const isRememberMe = useAppSelector(selectIsRememberMe);
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
  const loginSuccessFun = async (
    res: LoginUserInfo,
    req: TerminalPhoneLoginReq | LoginUserReq,
    isPhoneLogin: boolean,
  ) => {
    // TODO 后面需要去除password字段
    if ((req as LoginUserReq).password) {
      const password = encryption(
        'archeroscmp-' + (req as LoginUserReq).password + '_' + new Date().getTime(),
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

    // 保存记住我 和 自动登录 状态
    if (autoLoginChecked !== isAutoLogin) await appDispatch(setAutoLogin(autoLoginChecked));
    if (rememberMeChecked !== isRememberMe) await appDispatch(setRememberMe(rememberMeChecked));

    // 保存历史登录条目
    if (isPhoneLogin) {
      const phoneLoginInfo: AddHistoryEntryParams = {
        username: req.phone || '',
        isLocalPhoneLogin: true,
      };
      await appDispatch(addLoginEntry(phoneLoginInfo));
    } else {
      const loginReq = req as LoginUserReq;
      const otherLoginInfo: AddHistoryEntryParams = {
        username: loginReq.loginName,
        domainServerName:
          loginReq.authType === LoginAuthType.DOMAIN ? loginReq.domainServerName : undefined,
        ou: loginReq.authType === LoginAuthType.DOMAIN ? loginReq.ou : undefined,
        corpId: loginReq.authType === LoginAuthType.CORP ? loginReq.corpId : undefined,
        nisId: loginReq.authType === LoginAuthType.NIS ? loginReq.nisId : undefined,
      };
      await appDispatch(addLoginEntry(otherLoginInfo));
    }

    loginSuccessActionRoute(res.permissions || []);
  };

  return {
    loginSuccessFun,
  };
};
