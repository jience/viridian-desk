import { LoginAuthType } from '@/native/interfaces/login_history';
import { useTranslation } from 'react-i18next';

export const useLoginWayData = () => {
  const { t } = useTranslation();

  const loginWayKv: Record<LoginAuthType, string> = {
    [LoginAuthType.LOCAL]: t('login_page.login_way.local_user'),
    [LoginAuthType.DOMAIN]: t('login_page.login_way.domain_user'),
    [LoginAuthType.CORP]: t('login_page.login_way.other_user'),
    [LoginAuthType.IAM]: t('login_page.login_way.iam'),
    [LoginAuthType.NIS]: t('login_page.login_way.nis'),
  };

  return { loginWayKv };
};
