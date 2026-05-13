import { type UsernamePwdProps, UsernamePwd } from '../../UsernamePwd';

export interface UserDefinedFormItemProps extends UsernamePwdProps {}

export const UserDefinedFormItem = (props: UserDefinedFormItemProps) => {
  const { formIns } = props;

  return <UsernamePwd formIns={formIns} />;
};
