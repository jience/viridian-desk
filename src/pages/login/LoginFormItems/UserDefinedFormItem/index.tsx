import { memo } from 'react';
import { type UsernamePwdProps, UsernamePwd } from '../../UsernamePwd';

export interface UserDefinedFormItemProps extends UsernamePwdProps {}

const UserDefinedFormItemComponent = (props: UserDefinedFormItemProps) => {
  const { formIns } = props;

  return <UsernamePwd formIns={formIns} />;
};

export const UserDefinedFormItem = memo(UserDefinedFormItemComponent);
