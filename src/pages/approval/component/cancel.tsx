import { forwardRef } from 'react';
import { message, Modal } from 'antd';
import { cancelWorkflow } from '@/services/resource';
import useRequest from '@/hooks/useRequest';
import './index.scss';

const Cancel = (props: any, _ref: any) => {
  const { formatMessage, tips, refresh, visible, setVisible } = props;
  const { label, selectedItemIds, selectedItemName }: any = tips;

  const { run: cancelWorkflowRun, loading: cancelWorkflowLoading } = useRequest(cancelWorkflow, {
    manual: true,
    onSuccess: () => {
      message.success(formatMessage({ id: 'SUCCESS_CANCEL_WORKFLOW' }));
      refresh(1);
      setVisible(false);
    },
  });

  const submit = () => {
    cancelWorkflowRun({
      workflowIds: selectedItemIds,
    });
  };
  return (
    <Modal
      title={formatMessage({ id: 'CancelWorkflow' })}
      open={visible}
      keyboard={false}
      className="cancel-approval-modal-self"
      width={600}
      onCancel={() => setVisible()}
      cancelText={formatMessage({ id: 'Cancel' })}
      onOk={() => submit()}
      okButtonProps={{
        loading: cancelWorkflowLoading,
      }}
      okText={formatMessage({ id: 'Revoke' })}
      centered
    >
      <div className="cancel-approval">
        {label ? <p className="cancel-title">{label}</p> : null}
        <div className="confirm-tag-box">
          {selectedItemName?.map((it: any) => (
            <span className="confirm-tag" key={it.id} title={it.name}>
              {it.name}
            </span>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default forwardRef(Cancel);
