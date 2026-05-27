import diffLoginImg from '@/assets/images/difflogin.png';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/feature/app';
import { Modal } from '@/shared/ui';
import dayjs from 'dayjs';
import { useMessageFormatter } from '@/utils/message-format';
import './index.scss';

const DiffLoginTip = (props: any) => {
  const intl = useMessageFormatter();
  const { formatMessage } = intl;
  const { visible = false, setVisible } = props;

  const currentUser = useAppSelector(selectCurrentUser);

  const submitChangePhone = () => {
    setVisible(false);
  };

  const cancelModal = () => {
    setVisible(false);
  };

  return (
    <Modal
      open={visible}
      keyboard={false}
      onCancel={() => cancelModal()}
      okText={formatMessage({ id: 'SURE' })}
      cancelButtonProps={{
        style: {
          display: 'none',
        },
      }}
      onOk={() => submitChangePhone()}
      title={formatMessage({ id: 'DiffLoginTitle' })}
      centered
    >
      <div className="diffloginModal">
        <img src={diffLoginImg} alt="" />
        <p>上一次登录的IP地址与当前不一致</p>
        <p>客户端IP：{currentUser?.lastLoginIp}</p>
        <p>
          登录时间：
          {dayjs(currentUser?.lastLoginTime).format('YYYY年MM月DD日 HH时mm分ss秒')}
        </p>
      </div>
    </Modal>
  );
};

export default DiffLoginTip;
