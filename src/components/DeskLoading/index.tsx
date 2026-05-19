import './index.scss';
import type { FC } from 'react';
import deskEnterLoading from '@/assets/images/deskEnterLoading.gif';

export interface DeskLoadingProps {
  text: string;
}

const DeskLoading: FC<DeskLoadingProps> = (props) => {
  const { text } = props;

  return (
    <div className="desk-loading-background-mask">
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
