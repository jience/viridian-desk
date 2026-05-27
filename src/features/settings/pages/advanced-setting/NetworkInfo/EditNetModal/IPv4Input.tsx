import { Input } from '@/shared/ui';
import { useEffect, useState, type FC } from 'react';

export interface IPv4InputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  prefix?: string;
  suffix?: string;
}

export const IPv4Input: FC<IPv4InputProps> = ({
  value = '',
  onChange,
  placeholder = '0-255.0-255.0-255.0-255',
  disabled = false,
  prefix,
  suffix,
}) => {
  const [inputValues, setInputValues] = useState<string[]>(['', '', '', '']);

  // 初始化输入值
  useEffect(() => {
    if (value) {
      const parts = value.split('.');
      if (parts.length === 4) {
        setInputValues(parts);
      }
    } else {
      setInputValues(['', '', '', '']);
    }
  }, [value]);

  // 验证输入值是否为有效数字
  const isValidNumber = (val: string): boolean => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && val === num.toString();
  };

  // 处理单个输入框的值变化
  const handleInputChange = (index: number, val: string) => {
    // 只允许数字输入
    if (val && !/^\d+$/.test(val)) {
      return;
    }

    // 限制最大值为255
    if (val && parseInt(val, 10) > 255) {
      return;
    }

    const newValues = [...inputValues];
    newValues[index] = val;
    setInputValues(newValues);

    // 组合完整的IP地址
    const fullValue = newValues.join('.');
    onChange?.(fullValue);
  };

  // 处理键盘事件，支持自动跳转到下一个输入框
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '.' && index < 3) {
      e.preventDefault();
      const nextInput = document.querySelector(
        `input[data-ipv4-index="${index + 1}"]`,
      ) as HTMLInputElement;
      nextInput?.focus();
    } else if (e.key === 'Backspace' && inputValues[index] === '' && index > 0) {
      const prevInput = document.querySelector(
        `input[data-ipv4-index="${index - 1}"]`,
      ) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  // 处理粘贴事件
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = pastedText.match(ipPattern);

    if (match) {
      const parts = [match[1], match[2], match[3], match[4]];
      const validParts = parts.every((part) => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });

      if (validParts) {
        setInputValues(parts);
        onChange?.(pastedText);
      }
    }
  };

  return (
    <div className="ipv4-input-wrapper">
      {prefix && <span className="ipv4-input-affix ipv4-input-affix-prefix">{prefix}</span>}
      <div className="ipv4-input-segments">
        {inputValues.map((val, index) => (
          <div key={index} className="ipv4-input-segment">
            <Input
              data-ipv4-index={index}
              className={`ipv4-segment-input ${val && !isValidNumber(val) ? 'is-invalid' : ''}`}
              value={val}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              placeholder={placeholder.split('.')[index] || '0-255'}
              disabled={disabled}
              maxLength={3}
            />
            {index < 3 && <span className="ipv4-input-separator">.</span>}
          </div>
        ))}
      </div>
      {suffix && <span className="ipv4-input-affix ipv4-input-affix-suffix">{suffix}</span>}
    </div>
  );
};
