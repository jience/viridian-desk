import { useCallback, useEffect, useRef } from 'react';
import { Input } from 'antd';
import IPv4 from '../IPv4';
import './index.scss';

const isIpv4Regex =
  /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;

const IPv4Cidr = (props: any) => {
  const {
    onChange,
    value = '',
    defaultValue = '/',
    placeholder = '0-255.0-255.0-255.0-255/0-32',
    portRange,
    division,
    size = 'large',
    disabled, // bool, [bool, bool], [[bool,bool,bool,bool], bool]]
    ...restProps
  } = props;

  const eventRef = useRef<any>(null);

  const [defaultIpAddress = '', defaultPort = ''] = (value || defaultValue)?.split('/') || [];
  const [ipaddressPlaceholder = '', portPlaceholder = ''] = placeholder?.split('/') || [];
  const [ipv4Disabled, cidDisabled] = Array.isArray(disabled) ? disabled : [disabled, disabled];

  /**
   * @author QL
   * @functionName   pastHandler
   * @date 2023-11-03 10:12:04
   * @version V..
   * @description 监听粘贴事件的处理函数
   */
  const pasteHandler = useCallback((e: ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!(clipboardData && clipboardData.items)) {
      //剪切版中是否有内容
      return;
    }
    const content = e.clipboardData.getData('text/plain').replace(/:/g, '/'); //这里是粘贴的内容，自行处理，此处将ip:port形式规范为 ip/port 形式
    if (content.split('/')[0].split('.').length >= 4 && isIpv4Regex.test(content.split('/')[0])) {
      // ipv4包含port输入的上层组件，可直接通过自定义的handleChange事件模拟输入
      handleChange({
        ipaddressValue: content.split('/')[0],
        portValue: content.split('/')[1],
      });
    } else {
      handleChange({
        ipaddressValue: '',
        portValue: '',
      });
    }
  }, []);

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

  const handleChange = ({ ipaddressValue = defaultIpAddress, portValue = defaultPort }) => {
    if (ipaddressValue === '' && portValue === '') {
      onChange?.('');
    } else {
      const getPortNum = () => {
        const { min = 0, max = 32 } = portRange;
        if (Number(portValue) > max) {
          return max;
        }
        if (Number(portValue) < min) {
          return min;
        }
        return portValue;
      };
      onChange?.(`${ipaddressValue ?? ''}/${getPortNum() ?? ''}`);
    }
  };

  return (
    <div className="customized-ipv4-cidr" {...restProps} ref={eventRef}>
      <div className="customized-ipv4-cidr-address">
        <IPv4
          placeholder={ipaddressPlaceholder}
          value={defaultIpAddress}
          onChange={(value: string) => {
            handleChange({ ipaddressValue: value });
          }}
          disabled={ipv4Disabled}
          size={size}
        />
      </div>
      <div className="customized-ipv4-cidr-split">{division ?? '/'}</div>
      <div className="customized-ipv4-cidr-port">
        <Input
          placeholder={portPlaceholder}
          value={defaultPort}
          {...portRange}
          onChange={(e: any) => {
            if (Number.isNaN(Number(e.target.value.replace('.', '')))) {
              return e.preventDefault();
            }
            handleChange({
              portValue: `${Number(e.target.value.replace('.', ''))}`,
            });
          }}
          disabled={cidDisabled}
          size={size}
        />
      </div>
    </div>
  );
};

export default IPv4Cidr;
