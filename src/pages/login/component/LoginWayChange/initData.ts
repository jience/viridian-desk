import { LoginAuthType } from '@/native/interfaces/login_history';
import { useAppSelector } from '@/store';
import { selectLoginTypes } from '@/store/feature/client';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { LoginWayRenderData } from './types';

export const useLoginWay = () => {
  const { t } = useTranslation();
  const loginTypes = useAppSelector(selectLoginTypes);
  // 登录方式 字典
  const loginWays: LoginWayRenderData[] = useMemo(() => {
    return (
      [
        {
          name: t('login_page.login_way.local_user'),
          key: LoginAuthType.LOCAL,
          iconType: 'icon-folde',
        },
        {
          name: t('login_page.login_way.domain_user'),
          key: LoginAuthType.DOMAIN,
          iconType: 'icon-v-machine',
        },
        {
          name: t('login_page.login_way.other_user'),
          key: LoginAuthType.IAM,
          iconType: 'icon-user',
        },
        {
          name: t('login_page.login_way.iam'),
          key: LoginAuthType.IAM,
          iconType: 'icon-pen-rule-filled',
        },
        {
          name: t('login_page.login_way.nis'),
          key: LoginAuthType.NIS,
          iconType: 'icon-role',
        },
      ].filter((item) => loginTypes.includes(item.key)) || []
    );
  }, [loginTypes, t]);

  return { loginWays };
};
