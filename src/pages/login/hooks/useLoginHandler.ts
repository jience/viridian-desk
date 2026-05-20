import { bridge } from '@/native';
import type {
  CheckTerminalUserReq,
  GetSmsCaptchaReq,
  LoginUserReq,
  TerminalPhoneLoginReq,
} from '@/native/interfaces/api';
import { LoginAuthType } from '@/native/interfaces/login_auth';
import { useAppSelector } from '@/store';
import { selectCurrentLoginType } from '@/store/feature/app';
import {
  selectOneTimePasswordSwitch,
  selectTerminalGraphAuthenticationSwitch,
  selectTerminalMultiFactorAuthenticationSwitch,
} from '@/store/feature/client';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { OneTimePwdModalRef } from '../OneTimePasswordModal';
import type { SendMsgModalRef } from '../SendMsgModal';
import type { SliderVerifyModalRef } from '../SliderVerifyModal';
import type { LoginFormType } from '../types';
import { useLoginSuccessHandler } from './useLoginSuccessHandler';

export const useLoginHandler = () => {
  const currentLoginType = useAppSelector(selectCurrentLoginType);
  const terminalGraphAuthenticationSwitch = useAppSelector(selectTerminalGraphAuthenticationSwitch);
  const terminalMultiFactorAuthenticationSwitch = useAppSelector(
    selectTerminalMultiFactorAuthenticationSwitch,
  );
  const oneTimePasswordSwitch = useAppSelector(selectOneTimePasswordSwitch);

  const sliderVerifyModalRef = useRef<SliderVerifyModalRef>(null);
  const sendMsgModalRef = useRef<SendMsgModalRef>(null);
  const oneTimePwdModalRef = useRef<OneTimePwdModalRef>(null);
  const sliderVerifyModalResolveRef = useRef<((modal: SliderVerifyModalRef) => void) | null>(null);
  const sendMsgModalResolveRef = useRef<((modal: SendMsgModalRef) => void) | null>(null);
  const oneTimePwdModalResolveRef = useRef<((modal: OneTimePwdModalRef) => void) | null>(null);

  const [loginLoading, setLoginLoading] = useState(false);
  const [isLocalPhoneLogin, setIsLocalPhoneLogin] = useState(false);
  const [sliderVerifyModalMounted, setSliderVerifyModalMounted] = useState(false);
  const [sendMsgModalMounted, setSendMsgModalMounted] = useState(false);
  const [oneTimePwdModalMounted, setOneTimePwdModalMounted] = useState(false);

  const { loginSuccessFun } = useLoginSuccessHandler();

  const showOneTimePassword = useMemo(() => {
    return (
      oneTimePasswordSwitch &&
      (currentLoginType === 'LocalAuth' || currentLoginType === 'DomainAuth')
    );
  }, [oneTimePasswordSwitch, currentLoginType]);

  const setSliderVerifyModalRef = useCallback((modal: SliderVerifyModalRef | null) => {
    sliderVerifyModalRef.current = modal;
    if (modal && sliderVerifyModalResolveRef.current) {
      sliderVerifyModalResolveRef.current(modal);
      sliderVerifyModalResolveRef.current = null;
    }
  }, []);

  const setSendMsgModalRef = useCallback((modal: SendMsgModalRef | null) => {
    sendMsgModalRef.current = modal;
    if (modal && sendMsgModalResolveRef.current) {
      sendMsgModalResolveRef.current(modal);
      sendMsgModalResolveRef.current = null;
    }
  }, []);

  const setOneTimePwdModalRef = useCallback((modal: OneTimePwdModalRef | null) => {
    oneTimePwdModalRef.current = modal;
    if (modal && oneTimePwdModalResolveRef.current) {
      oneTimePwdModalResolveRef.current(modal);
      oneTimePwdModalResolveRef.current = null;
    }
  }, []);

  const waitForSliderVerifyModal = useCallback(() => {
    if (sliderVerifyModalRef.current) return Promise.resolve(sliderVerifyModalRef.current);

    setSliderVerifyModalMounted(true);
    return new Promise<SliderVerifyModalRef>((resolve) => {
      sliderVerifyModalResolveRef.current = resolve;
    });
  }, []);

  const waitForSendMsgModal = useCallback(() => {
    if (sendMsgModalRef.current) return Promise.resolve(sendMsgModalRef.current);

    setSendMsgModalMounted(true);
    return new Promise<SendMsgModalRef>((resolve) => {
      sendMsgModalResolveRef.current = resolve;
    });
  }, []);

  const waitForOneTimePwdModal = useCallback(() => {
    if (oneTimePwdModalRef.current) return Promise.resolve(oneTimePwdModalRef.current);

    setOneTimePwdModalMounted(true);
    return new Promise<OneTimePwdModalRef>((resolve) => {
      oneTimePwdModalResolveRef.current = resolve;
    });
  }, []);

  /** 检查用户是否绑定手机，如果绑定手机则打开短信验证弹窗验证 */
  const getLoginSmsLoginInfo = async (req: GetSmsCaptchaReq) => {
    const { loginName, password, domainServerName, ou, corpId, nisId } = req;

    const checkTerminalUserReq: CheckTerminalUserReq = {
      loginName,
      authType: currentLoginType || LoginAuthType.LOCAL,
    };
    const { data } = await bridge.api.checkTerminalUser(checkTerminalUserReq);
    // 用户已绑定手机，走短信验证流程
    if (data.data.phone) {
      const req = {
        title: '短信验证码',
        loginName: loginName,
        password: password,
        authType: currentLoginType || LoginAuthType.LOCAL,
        ...(currentLoginType === LoginAuthType.DOMAIN && { domainServerName, ou }),
        ...(currentLoginType === LoginAuthType.CORP && { corpId }),
        ...(currentLoginType === LoginAuthType.NIS && { nisId }),
      };

      const sendMsgModal = await waitForSendMsgModal();
      const smsCaptcha = await sendMsgModal.show(req);

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
          const sliderVerifyModal = await waitForSliderVerifyModal();
          await sliderVerifyModal.show();
        }

        const req: TerminalPhoneLoginReq = {
          authType: LoginAuthType.LOCAL,
          phone: values.phone,
          smsCaptcha: values.smsCaptcha,
        };
        const { data } = await bridge.api.terminalPhoneLogin(req);
        await loginSuccessFun(data.data, req);
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
        const oneTimePwdModal = await waitForOneTimePwdModal();
        const dynamicPwd = await oneTimePwdModal.show({
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
        const sliderVerifyModal = await waitForSliderVerifyModal();
        await sliderVerifyModal.show();
      }

      const { data } = await bridge.api.loginUser(loginParam);
      await loginSuccessFun(data.data, loginParam);
    } finally {
      setLoginLoading(false);
    }
  };

  return {
    userLogin,
    loginLoading,
    isLocalPhoneLogin,
    setIsLocalPhoneLogin,
    sliderVerifyModalRef: setSliderVerifyModalRef,
    sendMsgModalRef: setSendMsgModalRef,
    oneTimePwdModalRef: setOneTimePwdModalRef,
    sliderVerifyModalMounted,
    sendMsgModalMounted,
    oneTimePwdModalMounted,
  };
};
