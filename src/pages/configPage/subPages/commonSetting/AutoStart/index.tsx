import { SettingItem } from '@/components/SettingItem';
import style from './index.module.scss';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { message, Switch } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store';
import { configAutoStart, selectAutoStart } from '@/store/feature/config';

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
      <SettingItem
        mainTitle={t('config_page.common_setting.auto_start')}
        optionSlot={<Switch size="small" checked={autoStart} onChange={switchAutoStart} />}
      />
    </div>
  );
};
