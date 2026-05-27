import { useCallback, useRef } from 'react';

/**
 * 防止 Enter 键长按时事件被连续触发的自定义 Hook。
 * @returns {object} 包含 onKeyDown 和 onKeyUp 事件处理函数的对象。
 */
export const usePreventEnterKeyLongPress = () => {
  const isEnterPressedRef = useRef(false);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    if (isEnterPressedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
    isEnterPressedRef.current = true;
  }, []);

  const onKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    isEnterPressedRef.current = false;
    // 阻止冒泡以避免触发表单提交等其他行为
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return { onKeyDown, onKeyUp };
};
