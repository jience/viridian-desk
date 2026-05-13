import { useMemo } from 'react';
import style from './index.module.scss';
import { useAppSelector } from '@/store';
import { selectIntegration } from '@/store/feature/config';
import { selectIsThin } from '@/store/feature/terminal';
import { AutoStart } from './AutoStart';
import { FullScreen } from './FullScreen';
import { AutoUpdate } from './AutoUpdate';
import { LanguageSelect } from './LanguageSelect';
import { ThemeSelect } from './ThemeSelect';

export default function CommonSetting(_props: any) {
  const isIntegrated = useAppSelector(selectIntegration);
  const isThin = useAppSelector(selectIsThin);

  const showFullScreen = useMemo(() => {
    return !isIntegrated || !isThin;
  }, [isIntegrated, isThin]);

  return (
    <div className={style.commonSettingWrapper}>
      <AutoStart />
      {showFullScreen && <FullScreen />}
      <AutoUpdate />
      <LanguageSelect />
      <ThemeSelect />
    </div>
  );
}
