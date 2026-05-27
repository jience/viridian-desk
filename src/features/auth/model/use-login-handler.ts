import { bridge } from '@/native';
import { LoginAuthType, type LoginUserReq } from '@/native/interfaces/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTerminalInfo, selectId, selectIsThin } from '@/store/feature/terminal';
import { useRef, useState } from 'react';
import type { LoginFormType } from './types';
import { useLoginSuccessHandler } from './use-login-success-handler';

export const useLoginHandler = () => {
  const dispatch = useAppDispatch();
  const terminalId = useAppSelector(selectId);
  const terminalIsThin = useAppSelector(selectIsThin);
  const submitLockRef = useRef(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const { loginSuccessFun } = useLoginSuccessHandler();

  const ensureTerminalReady = async () => {
    if (terminalId) return { isThin: terminalIsThin };

    return dispatch(fetchTerminalInfo()).unwrap();
  };

  const userLogin = async ({ loginName, password }: LoginFormType) => {
    try {
      setLoginLoading(true);
      const loginParam: LoginUserReq = {
        authType: LoginAuthType.LOCAL,
        loginName,
        password,
      };

      const terminalInfo = await ensureTerminalReady();
      const { data } = await bridge.api.loginUser(loginParam);
      await loginSuccessFun(data.data, loginParam, {
        isThin: Boolean(terminalInfo?.isThin),
      });
    } finally {
      setLoginLoading(false);
    }
  };

  return {
    userLogin,
    loginLoading,
    submitLockRef,
  };
};
