import { bridge } from '@/native';
import { LoginAuthType, type LoginUserReq } from '@/native/interfaces/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTerminalInfo, selectId } from '@/store/feature/terminal';
import { useRef, useState } from 'react';
import type { LoginFormType } from '../types';
import { useLoginSuccessHandler } from './useLoginSuccessHandler';

export const useLoginHandler = () => {
  const dispatch = useAppDispatch();
  const terminalId = useAppSelector(selectId);
  const submitLockRef = useRef(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const { loginSuccessFun } = useLoginSuccessHandler();

  const ensureTerminalReady = async () => {
    if (terminalId) return;

    await dispatch(fetchTerminalInfo()).unwrap();
  };

  const userLogin = async ({ loginName, password }: LoginFormType) => {
    try {
      setLoginLoading(true);
      const loginParam: LoginUserReq = {
        authType: LoginAuthType.LOCAL,
        loginName,
        password,
      };

      await ensureTerminalReady();
      const { data } = await bridge.api.loginUser(loginParam);
      await loginSuccessFun(data.data, loginParam);
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
