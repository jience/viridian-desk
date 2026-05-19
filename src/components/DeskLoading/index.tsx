import './index.scss';
import { useMemo, type FC } from 'react';
import deskEnterLoading from '@/assets/images/deskEnterLoading.gif';
import { useAppSelector } from '@/store';
import { selectBackgroundImage } from '@/store/feature/client';

export interface DeskLoadingProps {
  text: string;
}

const DeskLoading: FC<DeskLoadingProps> = (props) => {
  const { text } = props;
  const backgroundImage = useAppSelector(selectBackgroundImage);

  const bgStyle = useMemo(() => {
    if (backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
      };
    }
  }, [backgroundImage]);

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
