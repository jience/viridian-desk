import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/feature/app';
import { Modal } from '@/ui';
import { useMessageFormatter } from '@/utils/message-format';
import './index.scss';

interface UserInfoProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const UserInfo = ({ visible, setVisible }: UserInfoProps) => {
  const { formatMessage } = useMessageFormatter();
  const currentUser = useAppSelector(selectCurrentUser);

  const fields = [
    {
      key: 'userName',
      label: formatMessage({ id: 'USERNAME' }),
      value: currentUser?.loginName,
    },
    {
      key: 'realName',
      label: formatMessage({ id: 'REALNAME' }),
      value: currentUser?.userName,
    },
    {
      key: 'phone',
      label: formatMessage({ id: 'PHONE' }),
      value: currentUser?.telephone,
    },
    {
      key: 'email',
      label: formatMessage({ id: 'EMAIL' }),
      value: currentUser?.email,
    },
  ];

  return (
    <Modal
      open={visible}
      keyboard={false}
      className="user-info-modal"
      onCancel={() => {
        setVisible(false);
      }}
      footer={null}
      title={formatMessage({ id: 'USER_INFO' })}
      centered
      destroyOnHidden
    >
      <section className="user-info-modal__profile">
        <div className="user-info-modal__avatar" aria-hidden="true">
          {(currentUser?.userName || currentUser?.loginName || '-').slice(0, 1).toUpperCase()}
        </div>
        <div className="user-info-modal__identity">
          <strong>{currentUser?.userName || currentUser?.loginName || '-'}</strong>
          <span>{currentUser?.loginName || '-'}</span>
        </div>
      </section>

      <dl className="user-info-modal__fields">
        {fields.map((field) => (
          <div className="user-info-modal__field" key={field.key}>
            <dt>{field.label}</dt>
            <dd title={field.value || '-'}>{field.value || '-'}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
};

export default UserInfo;
