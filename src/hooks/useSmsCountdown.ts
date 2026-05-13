import { useEffect, useState, useRef } from 'react';

interface UseSmsCountdownOptions {
  /**
   * 倒计时时长（秒）
   * @default 180
   */
  duration?: number;
  /**
   * 倒计时结束时的回调
   */
  onEnd?: () => void;
}

interface UseSmsCountdownReturn {
  /**
   * 是否正在倒计时
   */
  isCounting: boolean;
  /**
   * 剩余秒数
   */
  countdown: number;
  /**
   * 开始倒计时
   */
  start: () => void;
  /**
   * 停止倒计时
   */
  stop: () => void;
  /**
   * 重置倒计时
   */
  reset: () => void;
}

/**
 * 短信验证码倒计时 Hook
 * @param options 配置项
 * @returns 倒计时相关状态和方法
 */
export const useSmsCountdown = (options: UseSmsCountdownOptions = {}): UseSmsCountdownReturn => {
  const { duration = 180, onEnd } = options;

  const [isCounting, setIsCounting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    if (isCounting && countdown > 0) {
      timerRef.current = window.setInterval(() => {
        setCountdown((n) => {
          if (n <= 1) {
            setIsCounting(false);
            clearInterval(timerRef.current);
            onEnd?.();
            return 0;
          }
          return n - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [isCounting, countdown, onEnd]);

  const start = () => {
    if (isCounting) return;
    setCountdown(duration);
    setIsCounting(true);
  };

  const stop = () => {
    setIsCounting(false);
    clearInterval(timerRef.current);
  };

  const reset = () => {
    setIsCounting(false);
    setCountdown(0);
    clearInterval(timerRef.current);
  };

  return {
    isCounting,
    countdown,
    start,
    stop,
    reset,
  };
};

export default useSmsCountdown;
