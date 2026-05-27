import { ConfigProvider, Input } from '@/shared/ui';
import { cn } from '@/shared/ui/lib/cn';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import './index.scss';

const { ConfigContext } = ConfigProvider;

const isIpv4Regex =
  /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;

const IPv4 = (props: any) => {
  const {
    id = 'ipv4',
    value = '',
    defaultValue = '',
    placeholder = '0-255.0-255.0-255.0-255',
    disabled,
    className,
    onChange,
    size = 'large',
    ...restProps
  } = props;

  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('ipv4');
  const [arrayValue, setArrayValue] = useState(['', '', '', '']);

  const arrayPlaceholder = `${placeholder}...`.split('.').slice(0, 4);
  const eventRef = useRef<any>(null);
  const inputRefs = [useRef<any>(null), useRef<any>(null), useRef<any>(null), useRef<any>(null)];

  useEffect(() => {
    setArrayValue(`${value || defaultValue}...`.split('.').slice(0, 4));
  }, [value, defaultValue]);

  /**
   * @author QL
   * @functionName   pastHandler
   * @date 2023-11-03 10:12:04
   * @version V..
   * @description 监听粘贴事件的处理函数
   */
  const pasteHandler = useCallback(
    (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData;
      if (!(clipboardData && clipboardData.items)) {
        //剪切版中是否有内容
        return;
      }
      const content = e.clipboardData.getData('text/plain'); //这里是粘贴的内容，可以自行处理
      if (content.split('.').length >= 4 && isIpv4Regex.test(content)) {
        const ipArray = `${content}...`.split('.').slice(0, 4);
        setArrayValue(ipArray);
        onChange?.(`${content}...`.split('.').slice(0, 4).join('.')); // 黏贴值手动触发onChange 上报给formItem 更新formValue
      } else {
        setArrayValue(['', '', '', '']);
        onChange?.('');
      }
    },
    [onChange],
  );

  /**
   * @author QL
   * @date 2023-11-03 10:16:53
   * @version V..
   * @description 添加ipv4组件局部ctl+v 黏贴事件监听
   */
  useEffect(() => {
    const node = eventRef.current;
    node?.addEventListener('paste', pasteHandler);

    return () => {
      node?.removeEventListener('paste', pasteHandler);
    };
  }, [eventRef, pasteHandler]);

  /**
   * 改变事件
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    let val = Number(e.target.value.replace('.', ''));
    if (Number.isNaN(val)) {
      return e.preventDefault();
    }
    if (val > 255) {
      val = 255;
    }
    const nextValue = [...arrayValue];
    nextValue[i] = Number.isNaN(val) ? e.target.value : `${val}`;
    if (nextValue.every((item) => item?.trim() === '')) {
      setArrayValue(['', '', '', '']);
      onChange?.('');
    } else {
      setArrayValue(nextValue);
      onChange?.(nextValue.join('.'));
    }

    if (`${val}`.length === 3 && i < 3) {
      inputRefs[i + 1]?.current?.focus();
    }

    return undefined;
  };

  // 获取当前的位置
  const getCursorPosition = (el: HTMLInputElement) => el.selectionStart ?? 0;

  /**
   * 输入事件
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    /* ArrowLeft = ←, ArrowRight = →, Backspace = backspace, . = . */
    let domId = i;
    const target = e.currentTarget;

    // ←/Backspace
    if (
      ['ArrowLeft', 'Backspace'].includes(e.key) &&
      domId > 0 &&
      getCursorPosition(target) === 0
    ) {
      e.preventDefault();
      domId = i - 1;
    }

    // →
    if (
      e.key === 'ArrowRight' &&
      domId < 3 &&
      getCursorPosition(target) === target.value.length
    ) {
      e.preventDefault();
      domId = i + 1;
    }

    // .
    if (['.', '。'].includes(e.key) && domId < 3) {
      if (getCursorPosition(target) !== 0) {
        e.preventDefault();
        domId = i + 1;
      } else {
        return;
      }
    }

    inputRefs[domId]!.current?.focus();
  };

  return (
    <div
      className={cn(prefixCls, disabled && `${prefixCls}-disabled`, className)}
      ref={eventRef}
      {...restProps}
    >
      {arrayValue
        .map((item: string, index: number) => (
          <Input
            key={`${id}-item-${index}`}
            ref={inputRefs[index]}
            value={Number.isNaN(item) ? '' : item.replace('.', '')}
            size={size}
            placeholder={arrayPlaceholder[index]}
            variant="borderless"
            disabled={Array.isArray(disabled) ? disabled[index] : disabled}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))
        .reduce((previousValue: any, currentValue: any, currentIndex: number) => {
          if (currentIndex === arrayValue.length - 1) {
            return previousValue.concat(currentValue);
          }

          return previousValue.concat(currentValue).concat(
            <Input
              className={cn(
                'ip-split',
                (Array.isArray(disabled) ? disabled[currentIndex] : disabled) &&
                  'ip-split-disabled',
              )}
              size={size}
              placeholder="."
              disabled
            />,
          );
        }, [])}
    </div>
  );
};

export default IPv4;
