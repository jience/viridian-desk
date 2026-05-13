import { SettingItem } from '@/components/SettingItem';
import style from './index.module.scss';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { message, Switch } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store';
import { configFullScreen, selectFullScreen } from '@/store/feature/config';

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
      <SettingItem
        mainTitle={t('config_page.common_setting.full_screen_mode')}
        optionSlot={<Switch size="small" checked={fullscreen} onChange={switchFullScreen} />}
      />
    </div>
  );
};
