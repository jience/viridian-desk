import { bridge } from '@/native';
import type {
  CheckTerminalUserReq,
  GetSmsCaptchaReq,
  LoginUserReq,
  TerminalPhoneLoginReq,
} from '@/native/interfaces/api';
import { LoginAuthType } from '@/native/interfaces/login_history';
import { useAppSelector } from '@/store';
import {
  selectCurrentLoginType,
  selectIsAutoLogin,
  selectIsRememberMe,
  selectLastLoginEntry,
} from '@/store/feature/app';
import {
  selectOneTimePasswordSwitch,
  selectTerminalGraphAuthenticationSwitch,
  selectTerminalMultiFactorAuthenticationSwitch,
} from '@/store/feature/client';
import { useMemo, useRef, useState } from 'react';
import type { OneTimePwdModalRef } from '../OneTimePasswordModal';
import type { SendMsgModalRef } from '../SendMsgModal';
import type { SliderVerifyModalRef } from '../SliderVerifyModal';
import type { LoginFormType } from '../types';
import { useLoginSuccessHandler } from './useLoginSuccessHandler';

export const useLoginHandler = () => {
  const currentLoginType = useAppSelector(selectCurrentLoginType);
  const lastLoginHistory = useAppSelector(selectLastLoginEntry);
  const terminalGraphAuthenticationSwitch = useAppSelector(selectTerminalGraphAuthenticationSwitch);
  const terminalMultiFactorAuthenticationSwitch = useAppSelector(
    selectTerminalMultiFactorAuthenticationSwitch,
  );
  const oneTimePasswordSwitch = useAppSelector(selectOneTimePasswordSwitch);
  const isAutoLogin = useAppSelector(selectIsAutoLogin);
  const isRememberMe = useAppSelector(selectIsRememberMe);

  const sliderVerifyModalRef = useRef<SliderVerifyModalRef>(null);
  const sendMsgModalRef = useRef<SendMsgModalRef>(null);
  const oneTimePwdModalRef = useRef<OneTimePwdModalRef>(null);

  const [loginLoading, setLoginLoading] = useState(false);
  const [isLocalPhoneLogin, setIsLocalPhoneLogin] = useState(!!lastLoginHistory?.isLocalPhoneLogin);
  const [autoLoginChecked, setAutoLoginChecked] = useState(isAutoLogin);
  const [rememberMeChecked, setRememberMeChecked] = useState(isRememberMe);

  const { loginSuccessFun } = useLoginSuccessHandler({
    autoLoginChecked,
    rememberMeChecked,
  });

  const showOneTimePassword = useMemo(() => {
    return (
      oneTimePasswordSwitch &&
      (currentLoginType === 'LocalAuth' || currentLoginType === 'DomainAuth')
    );
  }, [oneTimePasswordSwitch, currentLoginType]);

  /** 检查用户是否绑定手机，如果绑定手机则打开短信验证弹窗验证 */
  const getLoginSmsLoginInfo = async (req: GetSmsCaptchaReq) => {
    const { loginName, password, domainServerName, ou, corpId, nisId } = req;

    const checkTerminalUserReq: CheckTerminalUserReq = {
      loginName,
      authType: currentLoginType || LoginAuthType.LOCAL,
    };
    const { data } = await bridge.api.checkTerminalUser(checkTerminalUserReq);
    // 用户已绑定手机，走短信验证流程
    if (data.data.phone && sendMsgModalRef.current) {
      const req = {
        title: '短信验证码',
        loginName: loginName,
        password: password,
        authType: currentLoginType || LoginAuthType.LOCAL,
        ...(currentLoginType === LoginAuthType.DOMAIN && { domainServerName, ou }),
        ...(currentLoginType === LoginAuthType.CORP && { corpId }),
        ...(currentLoginType === LoginAuthType.NIS && { nisId }),
      };

      const smsCaptcha = await sendMsgModalRef.current.show(req);

      return smsCaptcha;
    }
  };

  const userLogin = async (values: LoginFormType) => {
    try {
      setLoginLoading(true);
      const { loginName, password, domainServerName, ou, nisId, corpId } = values;
      // 流程 1: 本地用户-手机号登录
      if (isLocalPhoneLogin && currentLoginType === 'LocalAuth') {
        if (!values.phone || !values.smsCaptcha) return;

        // 流程 1.1: 图形滑块验证
        if (terminalGraphAuthenticationSwitch) {
          await sliderVerifyModalRef.current?.show();
        }

        const req: TerminalPhoneLoginReq = {
          authType: LoginAuthType.LOCAL,
          phone: values.phone,
          smsCaptcha: values.smsCaptcha,
        };
        const { data } = await bridge.api.terminalPhoneLogin(req);
        await loginSuccessFun(data.data, req, true);
        return;
      }

      const loginParam: LoginUserReq = {
        authType: currentLoginType || LoginAuthType.LOCAL,
        loginName,
        password,
        ...(currentLoginType === LoginAuthType.DOMAIN && { domainServerName, ou }),
        ...(currentLoginType === LoginAuthType.CORP && { corpId }),
        ...(currentLoginType === LoginAuthType.NIS && { nisId }),
      };

      // 流程 2: 短信验证码验证
      if (terminalMultiFactorAuthenticationSwitch && loginName && password) {
        try {
          const smsCaptcha = await getLoginSmsLoginInfo({
            authType: currentLoginType || LoginAuthType.LOCAL,
            loginName,
            password,
            domainServerName,
            ou,
            corpId,
            nisId,
          });
          loginParam.smsCaptcha = smsCaptcha;
        } catch (error: any) {
          if (error.errorCode !== 'UserNotSetPhoneError') throw error;
        }
      }

      // 流程 3: 动态口令验证
      if (
        loginName &&
        password &&
        showOneTimePassword &&
        (currentLoginType === LoginAuthType.LOCAL || currentLoginType === LoginAuthType.DOMAIN)
      ) {
        const dynamicPwd = await oneTimePwdModalRef.current?.show({
          loginName,
          password,
          authType: currentLoginType,
          domainServerName,
          ou,
        });
        loginParam.dynamicPwd = dynamicPwd;
      }

      // 流程 4: 图形滑块验证
      if (terminalGraphAuthenticationSwitch && currentLoginType !== LoginAuthType.IAM) {
        await sliderVerifyModalRef.current?.show();
      }

      const { data } = await bridge.api.loginUser(loginParam);
      await loginSuccessFun(data.data, loginParam, false);
    } finally {
      setLoginLoading(false);
    }
  };

  return {
    userLogin,
    loginLoading,
    isLocalPhoneLogin,
    setIsLocalPhoneLogin,
    sliderVerifyModalRef,
    sendMsgModalRef,
    oneTimePwdModalRef,
    autoLoginChecked,
    setAutoLoginChecked,
    rememberMeChecked,
    setRememberMeChecked,
  };
};
