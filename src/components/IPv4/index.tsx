import { ConfigProvider, Input } from 'antd';
import cx from 'classnames';
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
    arrayValue[i] = Number.isNaN(val) ? e.target.value : `${val}`;
    if (arrayValue.every((item: any) => item?.trim() === '')) {
      setArrayValue(['', '', '', '']);
      onChange?.('');
    } else {
      setArrayValue(arrayValue.concat());
      onChange?.(arrayValue.join('.'));
    }

    if (`${val}`.length === 3 && i < 3) {
      inputRefs[i + 1]?.current?.focus();
    }

    return undefined;
  };

  // 获取当前的位置
  const getCursorPosition = (el: any) => {
    let cursorPos = 0;
    // @ts-expect-error
    if (document.selection) {
      // @ts-expect-error
      const selectRange = document.selection.createRange();
      selectRange.moveStart('character', -el.value.length);
      cursorPos = selectRange.text.length;
    } else {
      cursorPos = el.selectionStart;
    }
    return cursorPos;
  };

  /**
   * 输入事件
   */
  const handleKeyDown = (e: any, i: number) => {
    /* ArrowLeft = ←, ArrowRight = →, Backspace = backspace, . = . */
    let domId = i;

    // ←/Backspace
    if (
      ['ArrowLeft', 'Backspace'].includes(e.key) &&
      domId > 0 &&
      getCursorPosition(e.target) === 0
    ) {
      e.preventDefault();
      domId = i - 1;
    }

    // →
    if (
      e.key === 'ArrowRight' &&
      domId < 3 &&
      getCursorPosition(e.target) === e.target.value.length
    ) {
      e.preventDefault();
      domId = i + 1;
    }

    // .
    if (['.', '。'].includes(e.key) && domId < 3) {
      if (getCursorPosition(e.target) !== 0) {
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
      className={cx(prefixCls, { [`${prefixCls}-disabled`]: disabled }, className)}
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
              className={cx('ip-split', {
                'ip-split-disabled': Array.isArray(disabled) ? disabled[currentIndex] : disabled,
              })}
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
