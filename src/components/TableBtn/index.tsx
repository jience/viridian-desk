import { Button } from 'antd';
import './index.scss';
const TableBtn = (props: any) => {
  const { icon, className, ...rest } = props;
  return (
    <Button
      className={`${className} tableBtnInit`}
      icon={<i className={`iconfont ${icon}`} />}
      style={{ marginRight: 5 }}
      {...rest}
    />
  );
};

export default TableBtn;
