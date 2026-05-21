import { useAppSelector } from '@/store';
import { selectCurrentLoginType } from '@/store/feature/app';
import type { FormInstance } from '@/ui';
import { memo } from 'react';
import type { LoginFormType } from '../types';
import { DomainFormItem } from './DomainFormItem';
import { LocalFormItem } from './LocalFormItem';
import { NisFormItem } from './NisFormItem';
import { OtherFormItem } from './OtherFormItem';
import { PhoneFormItem } from './PhoneFormItem';
import { UserDefinedFormItem } from './UserDefinedFormItem';

interface LoginFormItemsProps {
  formIns: FormInstance<LoginFormType>;
  isLocalPhoneLogin: boolean;
  setThreeChannel: (channel: string) => void;
}

const LoginFormItemsComponent = ({
  formIns,
  isLocalPhoneLogin,
  setThreeChannel,
}: LoginFormItemsProps) => {
  const currentLoginType = useAppSelector(selectCurrentLoginType);

  // 本地用户 - 账号密码登录
  if (!isLocalPhoneLogin && currentLoginType === 'LocalAuth') {
    return <LocalFormItem formIns={formIns} />;
  }

  // 本地用户 - 手机号登录
  if (isLocalPhoneLogin && currentLoginType === 'LocalAuth') {
    return <PhoneFormItem formIns={formIns} />;
  }

  // 域登录
  if (currentLoginType === 'DomainAuth') {
    return <DomainFormItem formIns={formIns} />;
  }

  // Nis 登录
  if (currentLoginType === 'NisAuth') {
    return <NisFormItem formIns={formIns} />;
  }

  // 企业登录
  if (currentLoginType === 'CorpAuth') {
    return <OtherFormItem formIns={formIns} setThreeChannel={setThreeChannel} />;
  }

  // Iam 登录
  if (currentLoginType === 'IamAuth') {
    return <UserDefinedFormItem formIns={formIns} />;
  }

  return null;
};

export const LoginFormItems = memo(LoginFormItemsComponent);
