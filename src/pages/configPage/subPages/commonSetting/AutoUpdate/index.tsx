import style from './index.module.scss';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { message, Switch } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store';
import { configAutoUpdate, selectAutoUpdate } from '@/store/feature/config';
import { SettingsRow } from '../../../components';

export const AutoUpdate: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const autoUpdate = useAppSelector(selectAutoUpdate);

  const switchAutoUpdate = async (checked: boolean) => {
    await dispatch(configAutoUpdate(checked));
    message.success(t('config_page.common_setting.auto_update_change_success'));
  };

  return (
    <div className={style.autoUpdateWrapper}>
      <SettingsRow
        icon={<i className="iconfont icon-stencil" />}
        title={t('config_page.common_setting.auto_update')}
        description={t('config_page.common_setting.auto_update_description')}
        action={<Switch size="small" checked={autoUpdate} onChange={switchAutoUpdate} />}
      />
    </div>
  );
};
