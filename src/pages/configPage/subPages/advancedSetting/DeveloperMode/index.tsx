import { SettingItem } from '@/components/SettingItem';
import './index.scss';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from 'antd';
import { configDeveloperMode, selectDeveloperMode } from '@/store/feature/config';
import { useAppDispatch, useAppSelector } from '@/store';

export const DeveloperMode: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const developerMode = useAppSelector(selectDeveloperMode);

  // 卡片组件中switch开关的执行方法分发器
  const switchHandle = (e: boolean) => {
    dispatch(configDeveloperMode(e));
  };

  return (
    <div className="develop-mode-wrapper">
      <SettingItem
        mainTitle={t('config_page.advanced_setting.developer_mode')}
        optionSlot={
          <Switch size="small" checked={developerMode} onChange={(e: any) => switchHandle(e)} />
        }
      />
    </div>
  );
};
