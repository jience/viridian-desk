import refreshIconPng from '@/assets/images/refreshIcon.png';
import { getRandomNumberByRange, square, sum } from '@/utils/utils';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import './index.css';

type VerifyImageModule = Promise<{ default: string }>;

const verifyImageLoaders: Array<() => VerifyImageModule> = [
  () => import('@/assets/images/verify/0.jpg'),
  () => import('@/assets/images/verify/1.jpg'),
  () => import('@/assets/images/verify/2.jpg'),
  () => import('@/assets/images/verify/3.jpg'),
  () => import('@/assets/images/verify/4.jpg'),
  () => import('@/assets/images/verify/5.jpg'),
  () => import('@/assets/images/verify/6.jpg'),
  () => import('@/assets/images/verify/7.jpg'),
  () => import('@/assets/images/verify/8.jpg'),
  () => import('@/assets/images/verify/9.jpg'),
];

export interface SliderVerifyProps {
  width?: number;
  height?: number;
  l?: number; // 滑块边长
  r?: number; // 滑块圆角半径
  text?: string; // 滑动提示文字
  refreshIcon?: string; // 刷新图标路径
  visible?: boolean; // 是否显示滑动验证
  onSuccess?: () => void; // 验证成功回调
  onFail?: () => void; // 验证失败回调
  onRefresh?: () => void; // 刷新回调
}

const SliderVerify = memo<SliderVerifyProps>(function ({
  width = 320,
  height = 160,
  l = 42,
  r = 9,
  text,
  refreshIcon = refreshIconPng,
  visible = true,
  onSuccess,
  onFail,
  onRefresh,
}) {
  const [isLoading, setLoading] = useState(false);
  const [sliderLeft, setSliderLeft] = useState(0);
  const [sliderClass, setSliderClass] = useState('sliderContainer');
  const [textTip, setTextTip] = useState(text);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blockRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const isMouseDownRef = useRef(false);
  const trailRef = useRef<number[]>([]);
  const originXRef = useRef(0);
  const originYRef = useRef(0);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const PI = Math.PI;
  const L = l + r * 2 + 3; // 滑块实际边长

  const drawPath = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, operation: 'fill' | 'clip') => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI);
      ctx.lineTo(x + l, y);
      ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI);
      ctx.lineTo(x + l, y + l);
      ctx.lineTo(x, y + l);
      ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true);
      ctx.lineTo(x, y);
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.stroke();
      ctx.globalCompositeOperation = 'destination-over';

      if (operation === 'fill') {
        ctx.fill();
      } else {
        ctx.clip();
      }
    },
    [PI, l, r],
  );

  const getRandomImgSrc = useCallback(async () => {
    const index = getRandomNumberByRange(0, verifyImageLoaders.length - 1);
    const module = await verifyImageLoaders[index]();
    return module.default;
  }, []);

  const loadRandomImage = useCallback(
    async (img: HTMLImageElement) => {
      try {
        img.src = await getRandomImgSrc();
      } catch {
        setLoading(false);
      }
    },
    [getRandomImgSrc],
  );

  const retryRandomImage = useCallback(
    (img: HTMLImageElement) => {
      void loadRandomImage(img);
    },
    [loadRandomImage],
  );

  const resetImage = useCallback(
    (img: HTMLImageElement) => {
      setLoading(true);
      void loadRandomImage(img);
    },
    [loadRandomImage],
  );

  const reloadImage = useCallback(() => {
    if (imgRef.current) {
      resetImage(imgRef.current);
    }
  }, [resetImage]);

  const createImg = useCallback(
    (onload: (this: GlobalEventHandlers, ev: Event) => any) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = onload;

      img.onerror = function () {
        retryRandomImage(img); // 图片加载失败的时候重新加载其他图片
      };
      resetImage(img);
      return img;
    },
    [resetImage, retryRandomImage],
  );

  const draw = useCallback(
    (img: HTMLImageElement) => {
      const canvasCtx = canvasRef.current?.getContext('2d');
      const blockCtx = blockRef.current?.getContext('2d'); // 随机位置创建拼图形状
      if (!canvasCtx || !blockCtx) return;

      xRef.current = getRandomNumberByRange(L + 10, width - (L + 10));
      yRef.current = getRandomNumberByRange(10 + r * 2, height - (L + 10));
      drawPath(canvasCtx, xRef.current, yRef.current, 'fill');
      drawPath(blockCtx, xRef.current, yRef.current, 'clip'); // 画入图片

      canvasCtx?.drawImage(img, 0, 0, width, height);
      blockCtx?.drawImage(img, 0, 0, width, height); // 提取滑块并放到最左边

      const y1 = yRef.current - r * 2 - 1;
      const ImageData = blockCtx?.getImageData(xRef.current - 3, y1, L, L);
      if (blockRef.current) blockRef.current.width = L;
      if (ImageData) blockCtx?.putImageData(ImageData, 0, y1);
    },
    [L, width, r, height, drawPath],
  );

  const initImg = useCallback(() => {
    const img = createImg(function () {
      setLoading(false);
      draw(img);
    });
    imgRef.current = img;
  }, [createImg, draw]);

  const reset = useCallback(() => {
    if (!canvasRef.current || !blockRef.current) return;
    const canvasCtx = canvasRef.current.getContext('2d');
    const blockCtx = blockRef.current.getContext('2d'); // 重置样式
    if (!canvasCtx || !blockCtx) return;

    setSliderLeft(0);
    setSliderClass('sliderContainer');
    blockRef.current.width = width;
    blockRef.current.style.left = 0 + 'px'; // 清空画布

    canvasCtx.clearRect(0, 0, width, height);
    blockCtx.clearRect(0, 0, width, height); // 重新加载图片

    setLoading(true);
    reloadImage();
  }, [width, height, reloadImage]);

  function handleRefresh() {
    reset();
    if (typeof onRefresh === 'function') onRefresh();
  }

  function verify() {
    const arr = trailRef.current; // 拖动时y轴的移动距离

    const average = arr.reduce(sum as (x: number, y: number) => number) / arr.length;
    const deviations = arr.map(function (x) {
      return x - average;
    });
    const stddev = Math.sqrt(deviations.map(square).reduce(sum) / arr.length);
    if (!blockRef.current) return;
    const left = parseInt(blockRef.current.style.left);
    return {
      spliced: Math.abs(left - xRef.current) < 10,
      verified: stddev !== 0, // 简单验证拖动轨迹，为零时表示Y轴上下没有波动，可能非人为操作
    };
  }

  function handleDragStart(e: any) {
    originXRef.current = e.clientX || e.touches[0].clientX;
    originYRef.current = e.clientY || e.touches[0].clientY;
    isMouseDownRef.current = true;
  }

  function handleDragMove(e: any) {
    if (!isMouseDownRef.current) return false;
    e.preventDefault();
    const eventX = e.clientX || e.touches[0].clientX;
    const eventY = e.clientY || e.touches[0].clientY;
    const moveX = eventX - originXRef.current;
    const moveY = eventY - originYRef.current;
    if (moveX < 0 || moveX + 38 >= width) return false;
    setSliderLeft(moveX);
    const blockLeft = ((width - 40 - 20) / (width - 40)) * moveX;
    if (!blockRef.current) return;
    blockRef.current.style.left = blockLeft + 'px';
    setSliderClass('sliderContainer sliderContainer_active');
    trailRef.current.push(moveY);
  }

  function handleDragEnd(e: any) {
    if (!isMouseDownRef.current) return false;
    isMouseDownRef.current = false;
    const eventX = e.clientX || e.changedTouches[0].clientX;
    if (eventX === originXRef.current) return false;
    setSliderClass('sliderContainer');
    const { spliced, verified } = verify()!;
    if (spliced) {
      if (verified) {
        setSliderClass('sliderContainer sliderContainer_success');
        if (typeof onSuccess === 'function') onSuccess();
      } else {
        setSliderClass('sliderContainer sliderContainer_fail');
        setTextTip('请再试一次');
        reset();
      }
    } else {
      setSliderClass('sliderContainer sliderContainer_fail');
      if (typeof onFail === 'function') onFail();
      setTimeout(() => {
        reset();
      }, 1000);
    }
  }

  useEffect(
    function () {
      if (visible) {
        if (imgRef.current) {
          reset();
        } else {
          initImg();
        }
      }
    },
    [initImg, reset, visible],
  );
  return (
    <div
      className="vertifyWrap"
      style={{
        width: width + 'px',
        margin: '0 auto',
        display: visible ? '' : 'none',
      }}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      <div className="canvasArea">
        <canvas ref={canvasRef} width={width} height={height}></canvas>
        <canvas
          ref={blockRef}
          className="block"
          width={width}
          height={height}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        ></canvas>
      </div>
      <div className="tipInfo">请正确拼合图形</div>
      <div
        className={sliderClass}
        style={{
          pointerEvents: isLoading ? 'none' : 'auto',
          width: width + 'px',
        }}
      >
        <div className="sliderMask" style={{ width: sliderLeft + 'px' }}>
          <div
            className="slider"
            style={{ left: sliderLeft + 'px' }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="sliderIcon">&rarr;</div>
          </div>
        </div>
        <div className="sliderText">{textTip}</div>
      </div>
      <div
        className="refreshIcon"
        onClick={handleRefresh}
        style={{ backgroundImage: `url(${refreshIcon})` }}
      ></div>
      <div
        className="loadingContainer"
        style={{
          width: width + 'px',
          height: height + 'px',
          display: isLoading ? '' : 'none',
        }}
      >
        <div className="loadingIcon"></div>
        <span>加载中...</span>
      </div>
    </div>
  );
});

export default SliderVerify;
