import style from './index.module.scss';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { message, Switch } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store';
import { configFullScreen, selectFullScreen } from '@/store/feature/config';
import { SettingsRow } from '../../../components';

export const FullScreen: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const fullscreen = useAppSelector(selectFullScreen);

  const switchFullScreen = async (checked: boolean) => {
    await dispatch(configFullScreen(checked));
    message.success(t('config_page.common_setting.full_screen_change_success'));
  };

  return (
    <div className={style.fullScreenWrapper}>
      <SettingsRow
        icon={<i className="iconfont icon-stencil" />}
        title={t('config_page.common_setting.full_screen_mode')}
        description={t('config_page.common_setting.full_screen_description')}
        action={<Switch size="small" checked={fullscreen} onChange={switchFullScreen} />}
      />
    </div>
  );
};
