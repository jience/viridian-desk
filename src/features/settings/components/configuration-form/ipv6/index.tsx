import { Input } from '@/shared/ui';

const IPv6 = (props: any) => {
  const { value, size = 'large', ...restProps } = props;
  return <Input value={value} size={size} {...restProps} />;
};

export default IPv6;
