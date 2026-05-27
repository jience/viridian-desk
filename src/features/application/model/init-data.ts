import { VappCategory } from '@/services/api/vapp/types';
import type { DefaultOptionType } from '@/shared/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useInitData = () => {
  const { t } = useTranslation();

  const appCategoryList = useMemo<DefaultOptionType[]>(
    () => [
      {
        value: 'all',
        label: t('application_page.category_all'),
      },
      {
        value: VappCategory.OFFICE,
        label: t('application_page.category_office'),
      },
      {
        value: VappCategory.DESIGN,
        label: t('application_page.category_design'),
      },
      {
        value: VappCategory.GAME,
        label: t('application_page.category_games'),
      },
      {
        value: VappCategory.DEVELOPMENT,
        label: t('application_page.category_development'),
      },
      {
        value: VappCategory.VIDEO,
        label: t('application_page.category_video'),
      },
      {
        value: VappCategory.UTILITIES,
        label: t('application_page.category_tools'),
      },
      {
        value: VappCategory.OTHER,
        label: t('application_page.category_other'),
      },
    ],
    [t],
  );

  const appModeList = useMemo<DefaultOptionType[]>(
    () => [
      {
        value: 'Exclusive',
        label: t('application_page.mode_exclusive'),
      },
      {
        value: 'Share',
        label: t('application_page.mode_shared'),
      },
    ],
    [t],
  );

  return { appCategoryList, appModeList };
};
