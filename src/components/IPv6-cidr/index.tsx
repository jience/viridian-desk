import { Input } from '@/ui';
import IPv6 from '../IPv6';
import './index.scss';

const IPv6Cidr = (props: any) => {
  const {
    onChange,
    value = '/',
    placeholder = '/',
    portRange,
    division,
    size = 'large',
    ...restProps
  } = props;
  const [defaultIpAddress = '', defaultPort = ''] = value?.split('/') || [];
  const [ipaddressPlaceholder = '', portPlaceholder = ''] = placeholder?.split('/') || [];

  const handleChange = ({ ipaddressValue = defaultIpAddress, portValue = defaultPort }) => {
    if (ipaddressValue === '' && portValue === '') {
      onChange('');
    } else {
      if (ipaddressValue.includes('/')) {
        [ipaddressValue, portValue] = ipaddressValue?.split('/') || [];
      }
      onChange(`${ipaddressValue ?? ''}/${portValue ?? ''}`);
    }
  };

  return (
    <div className="customized-ipv6" {...restProps}>
      <div className="customized-ipv6-address">
        <IPv6
          placeholder={ipaddressPlaceholder}
          value={defaultIpAddress}
          onChange={(e: any) => {
            handleChange({ ipaddressValue: e.target.value });
          }}
          size={size}
          {...restProps}
        />
      </div>
      <div className="customized-ipv6-split">{division ?? '/'}</div>
      <div className="customized-ipv6-port">
        <Input
          placeholder={portPlaceholder}
          value={defaultPort}
          {...restProps}
          {...portRange}
          onChange={(e: any) => {
            if (Number.isNaN(Number(e.target.value))) {
              return e.preventDefault();
            }
            handleChange({ portValue: e.target.value });
          }}
          size={size}
        />
      </div>
    </div>
  );
};

export default IPv6Cidr;
