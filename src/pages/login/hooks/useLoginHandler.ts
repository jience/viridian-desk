import { bridge } from '@/native';
import type { LoginUserReq } from '@/native/interfaces/api';
import { LoginAuthType } from '@/native/interfaces/login_auth';
import { useRef, useState } from 'react';
import type { LoginFormType } from '../types';
import { useLoginSuccessHandler } from './useLoginSuccessHandler';

export const useLoginHandler = () => {
  const submitLockRef = useRef(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const { loginSuccessFun } = useLoginSuccessHandler();

  const userLogin = async ({ loginName, password }: LoginFormType) => {
    try {
      setLoginLoading(true);
      const loginParam: LoginUserReq = {
        authType: LoginAuthType.LOCAL,
        loginName,
        password,
      };

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
