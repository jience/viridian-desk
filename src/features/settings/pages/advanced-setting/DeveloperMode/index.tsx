import './index.scss';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/shared/ui';
import { configDeveloperMode, selectDeveloperMode } from '@/store/feature/config';
import { useAppDispatch, useAppSelector } from '@/store';
import { SettingsRow } from '../../../components';

type PendingDeveloperModeKey = 'developer_mode_description';

const advancedSettingKey = <T extends PendingDeveloperModeKey>(key: T) =>
  `config_page.advanced_setting.${key}` as const;

export const DeveloperMode: FC = () => {
  const { t } = useTranslation();
  const tPending = (key: PendingDeveloperModeKey) => t(advancedSettingKey(key));
  const dispatch = useAppDispatch();
  const developerMode = useAppSelector(selectDeveloperMode);

  // 卡片组件中switch开关的执行方法分发器
  const switchHandle = (e: boolean) => {
    dispatch(configDeveloperMode(e));
  };

  return (
    <div className="develop-mode-wrapper">
      <SettingsRow
        icon={<i className="iconfont icon-log" />}
        title={t('config_page.advanced_setting.developer_mode')}
        description={tPending('developer_mode_description')}
        action={
          <Switch size="small" checked={developerMode} onChange={(e: boolean) => switchHandle(e)} />
        }
      />
    </div>
  );
};
