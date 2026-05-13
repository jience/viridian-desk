import { default as Verify } from '@/components/SliderVerify';
import { useAppSelector } from '@/store';
import { selectFullScreen } from '@/store/feature/config';
import { useEffect, useImperativeHandle, useRef, useState, type FC, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import './index.scss';

export interface SliderVerifyModalRef {
  show: () => Promise<void>;
}

export interface SliderVerifyModalProps {
  ref?: Ref<SliderVerifyModalRef>;
}

export const SliderVerifyModal: FC<SliderVerifyModalProps> = (props) => {
  const { ref } = props;
  const { t } = useTranslation();
  const isFullScreen = useAppSelector(selectFullScreen);

  const [visible, setVisible] = useState(false);
  const [slider, setSlider] = useState({ width: 320, height: 160 });

  const promiseHandlesRef = useRef<{
    resolve: () => void;
    reject: () => void;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    show: () => {
      setVisible(true);
      return new Promise<void>((resolve, reject) => {
        promiseHandlesRef.current = { resolve, reject };
      });
    },
  }));

  /** 重置滑块组件大小 */
  const resizeSlider = () => {
    const docEl = window.screen;
    setSlider({
      width: docEl.width / 4,
      height: docEl.height / 4,
    });
  };

  const handleCancel = () => {
    setVisible(false);
    promiseHandlesRef.current?.reject(); // 用户取消
  };

  const handleSubmit = () => {
    promiseHandlesRef.current?.resolve(); // 用户确认
    setVisible(false);
  };

  useEffect(() => {
    resizeSlider();
  }, [isFullScreen]);

  return visible ? (
    <div className="slider-mask">
      <div className="slider-verify">
        <div className="slider-mask-actives">
          <i className={`iconfont icon-error no-drag slider-mask-close`} onClick={handleCancel}></i>
        </div>
        <Verify
          visible={visible}
          width={slider.width}
          height={slider.height}
          text={t('login_page.slider_verify.text')}
          onSuccess={handleSubmit}
        />
      </div>
    </div>
  ) : null;
};
