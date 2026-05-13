import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/feature/app';
import { Form, Modal } from 'antd';
import { useIntl } from 'react-intl';
import './index.scss';

const UserInfo = ({ visible, setVisible }: any) => {
  const intl = useIntl();
  const currentUser = useAppSelector(selectCurrentUser);

  const handleSubmit = () => {
    setVisible(false);
  };

  return (
    <Modal
      open={visible}
      keyboard={false}
      className="sendmsg-modal"
      onCancel={() => {
        setVisible(false);
      }}
      cancelButtonProps={{
        style: {
          display: 'none',
        },
      }}
      onOk={() => handleSubmit()}
      title={intl.formatMessage({ id: 'USER_INFO' })}
      centered={true}
      destroyOnHidden={true}
    >
      <Form colon={false} labelCol={{ span: 5, offset: 0 }} labelAlign="left">
        <Form.Item
          name="userName"
          label={intl.formatMessage({ id: 'USERNAME' })}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <div className="infoBox">{currentUser?.loginName || '-'}</div>
        </Form.Item>
        <Form.Item
          name="realName"
          label={intl.formatMessage({ id: 'REALNAME' })}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <div className="infoBox">{currentUser?.userName || '-'}</div>
        </Form.Item>
        <Form.Item
          name="phone"
          label={intl.formatMessage({ id: 'PHONE' })}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <div className="infoBox">{currentUser?.telephone || '-'}</div>
        </Form.Item>
        <Form.Item
          name="email"
          label={intl.formatMessage({ id: 'EMAIL' })}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <div className="infoBox">{currentUser?.email || '-'}</div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserInfo;
