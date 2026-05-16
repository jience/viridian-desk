import style from './index.module.scss';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { message, Switch } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store';
import { configAutoStart, selectAutoStart } from '@/store/feature/config';
import { SettingsRow } from '../../../redesign/components';

export const AutoStart: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const autoStart = useAppSelector(selectAutoStart);

  const switchAutoStart = async (checked: boolean) => {
    await dispatch(configAutoStart(checked));
    message.success(t('config_page.common_setting.auto_start_change_success'));
  };

  return (
    <div className={style.autoStartWrapper}>
      <SettingsRow
        icon={<i className="iconfont icon-stencil" />}
        title={t('config_page.common_setting.auto_start')}
        description={t('config_page.common_setting.auto_start_description')}
        action={<Switch size="small" checked={autoStart} onChange={switchAutoStart} />}
      />
    </div>
  );
};
