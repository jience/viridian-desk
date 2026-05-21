import { memo } from 'react';
import { UsernamePwd, type UsernamePwdProps } from '../../UsernamePwd';

interface LocalFormItemProps extends UsernamePwdProps {}

const LocalFormItemComponent = (props: LocalFormItemProps) => {
  const { formIns } = props;
  return <UsernamePwd formIns={formIns} />;
};

export const LocalFormItem = memo(LocalFormItemComponent);
