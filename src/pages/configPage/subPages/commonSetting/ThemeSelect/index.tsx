import style from './index.module.scss';
import { useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { message } from '@/ui';
import { useAppDispatch, useAppSelector } from '@/store';
import { configTheme, selectTheme } from '@/store/feature/config';
import { CheckOutlined } from '@/ui/icons';
import { ThemeType } from '@/native/interfaces/config';
import { SettingsRow } from '../../../components';

export const ThemeSelect: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme);

  const themeList = useMemo(() => {
    return [
      {
        key: ThemeType.LIGHT,
        label: t('config_page.common_setting.theme_light'),
        classNames: [style.themeLight],
      },
      {
        key: ThemeType.DARK,
        label: t('config_page.common_setting.theme_dark'),
        classNames: [style.themeDark],
      },
      {
        key: ThemeType.SYSTEM,
        label: t('config_page.common_setting.theme_system'),
        classNames: [style.themeSystem],
      },
    ];
  }, [t]);

  const switchTheme = async (theme: ThemeType) => {
    await dispatch(configTheme(theme));
    message.success(t('config_page.common_setting.theme_change_success'));
  };

  return (
    <div className={style.themeSelectWrapper}>
      <SettingsRow
        icon={<i className="iconfont icon-stencil" />}
        title={t('config_page.common_setting.theme')}
        description={t('config_page.common_setting.theme_description')}
      >
        <div className={style.themeSelectContent}>
          {themeList.map((i) => {
            const isActive = i.key === currentTheme;
            const itemClass = `${style.themeItem} ${isActive ? style.active : ''}`;
            const topContentClass = `${style.topContent} ${i.classNames.join(' ')}`;
            return (
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => switchTheme(i.key)}
                key={i.key}
                className={itemClass}
              >
                <div className={topContentClass} />
                <div className={style.bottomContent}>
                  <span>{i.label}</span>
                  <div>{isActive && <CheckOutlined className={style.rightIcon} />}</div>
                </div>
              </button>
            );
          })}
        </div>
      </SettingsRow>
    </div>
  );
};
