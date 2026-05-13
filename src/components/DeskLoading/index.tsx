import './index.scss';
import { useMemo, type FC } from 'react';
import deskEnterLoading from '@/assets/images/deskEnterLoading.gif';
import app_layout_bg_dark from '@/assets/images/app_layout_bg_dark.png';
import app_layout_bg from '@/assets/images/app_layout_bg.png';
import { useAppSelector } from '@/store';
import { selectBackgroundImage } from '@/store/feature/client';
import { selectTheme } from '@/store/feature/config';

export interface DeskLoadingProps {
  text: string;
}

const DeskLoading: FC<DeskLoadingProps> = (props) => {
  const { text } = props;
  const backgroundImage = useAppSelector(selectBackgroundImage);
  const theme = useAppSelector(selectTheme);

  const bgStyle = useMemo(() => {
    if (backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
      };
    } else {
      return {
        backgroundImage: theme == 'dark' ? `url(${app_layout_bg_dark})})` : `url(${app_layout_bg})`,
      };
    }
  }, [theme, backgroundImage]);

  return (
    <div className="desk-loading-background-mask" style={bgStyle}>
      <div className="desk-loading-mid">
        <div className="image-container">
          <img className="loading-image" src={deskEnterLoading} />
        </div>
        <span>{text}</span>
      </div>
    </div>
  );
};

export default DeskLoading;
