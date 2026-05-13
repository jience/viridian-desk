import './messageList.scss';
import { useState, useEffect } from 'react';
import { Button, Input, Modal, Radio, Space, Table } from 'antd';

import { useInitData } from './initData';

import { useTranslation } from 'react-i18next';
import { ReloadOutlined } from '@ant-design/icons';
import { useMsg } from './useMsg';
import { useNotice } from './useNotice';

const MessageNoticeModal = (props: any) => {
  const { visible, setVisible } = props;

  const { t } = useTranslation();

  const [msgType, setMsgType] = useState<'msg' | 'notice'>('msg');

  const {
    delMsgContextHolder,
    handleMsgDelete,
    msgList,
    fetchMsgList,
    listHistoryMessageLoading,
    msgReqParams,
    pageTotal,
    setMsgReqParams,
  } = useMsg();
  const {
    noticeList,
    fetchNoticeList,
    listNoticeLoading,
    noticeReqParams,
    noticeTotal,
    setNoticeReqParams,
  } = useNotice();

  const { msgColumns, noticeColumns, radioOptions } = useInitData({
    onMsgDelete: handleMsgDelete,
  });

  const refreshDistributor = () => {
    switch (msgType) {
      case 'msg':
        fetchMsgList();
        break;
      case 'notice':
        fetchNoticeList();
        break;
    }
  };

  useEffect(() => {
    if (visible) {
      refreshDistributor();
    }
  }, [visible, msgType]);

  const cancelModal = () => {
    setVisible(false);
  };

  return (
    <Modal
      open={visible}
      destroyOnHidden={true}
      keyboard={false}
      onOk={cancelModal}
      onCancel={() => cancelModal()}
      className="message-notice-modal"
      maskClosable={false}
      title={t('common.message_modal.msg_notice')}
      cancelButtonProps={{
        style: { display: 'none' },
      }}
      centered={true}
    >
      <Space className="search-bar" size={8}>
        <Button
          icon={<ReloadOutlined spin={listHistoryMessageLoading || listNoticeLoading} />}
          onClick={refreshDistributor}
        />
        <Radio.Group
          className="radio-group"
          optionType="button"
          buttonStyle="solid"
          defaultValue={msgType}
          value={msgType}
          options={radioOptions}
          onChange={(e: any) => {
            setMsgType(e.target.value);
          }}
        />
        <Input.Search
          className="search-input"
          placeholder={
            msgType === 'msg'
              ? t('common.message_modal.please_enter_message_content')
              : t('common.message_modal.please_enter_notice_title')
          }
          loading={listHistoryMessageLoading || listNoticeLoading}
          value={msgType === 'msg' ? msgReqParams.msgContentLike : noticeReqParams.subject}
          onChange={(e) => {
            if (msgType === 'msg') {
              setMsgReqParams((prev) => ({
                ...prev,
                msgContentLike: e.target.value,
              }));
            } else {
              setNoticeReqParams((prev) => ({
                ...prev,
                subject: e.target.value,
              }));
            }
          }}
          allowClear
          onSearch={(value) => {
            if (msgType === 'msg') {
              fetchMsgList({ msgContentLike: value });
            } else {
              fetchNoticeList({ subject: value });
            }
          }}
        />
      </Space>
      {msgType === 'msg' ? (
        <Table
          columns={msgColumns}
          dataSource={msgList}
          loading={listHistoryMessageLoading}
          rowKey="id"
          size="middle"
          pagination={{
            pageSize: msgReqParams.pageSize,
            current: msgReqParams.pageNumber,
            total: pageTotal,
            onChange: (page, pageSize) => {
              fetchMsgList({ pageNumber: page, pageSize });
            },
          }}
        />
      ) : (
        <Table
          columns={noticeColumns}
          dataSource={noticeList}
          loading={listNoticeLoading}
          rowKey="id"
          size="middle"
          pagination={{
            pageSize: noticeReqParams.pageSize,
            current: noticeReqParams.pageNumber,
            total: noticeTotal,
            onChange: (page, pageSize) => {
              fetchNoticeList({ pageNumber: page, pageSize });
            },
          }}
        />
      )}
      {delMsgContextHolder}
    </Modal>
  );
};

export default MessageNoticeModal;
