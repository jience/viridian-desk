import { Button } from 'antd';
import './index.scss';
const TableBtn = (props: any) => {
  const { icon, className, ...rest } = props;
  return (
    <Button
      className={[className, 'tableBtnInit'].filter(Boolean).join(' ')}
      icon={<i className={`iconfont ${icon}`} />}
      {...rest}
    />
  );
};

export default TableBtn;
