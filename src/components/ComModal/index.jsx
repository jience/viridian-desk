import React from 'react';
import { Modal } from 'antd';

function ComModal({ modalData, children, onCancel, onOk, afterClose, ...other }) {
  return (
    <Modal
      maskClosable={false}
      keyboard={false}
      destroyOnHidden={true}
      centered={modalData.centered}
      title={modalData.title}
      open={modalData.visible}
      cancelText={modalData.cancelText}
      okText={modalData.okText}
      width={modalData.width}
      onCancel={onCancel}
      onOk={onOk}
      afterClose={afterClose}
      {...other}
    >
      {children}
    </Modal>
  );
}

export default ComModal;
