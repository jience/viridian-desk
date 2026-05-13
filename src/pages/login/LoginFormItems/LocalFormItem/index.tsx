import { UsernamePwd, type UsernamePwdProps } from '../../UsernamePwd';

interface LocalFormItemProps extends UsernamePwdProps {}

export const LocalFormItem = (props: LocalFormItemProps) => {
  const { formIns } = props;
  return <UsernamePwd formIns={formIns} />;
};
