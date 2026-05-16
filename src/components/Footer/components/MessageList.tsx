import './messageList.scss';
import { useState, useEffect } from 'react';
import { Button, Empty, Input, Modal, Radio, Table } from 'antd';

import { useInitData } from './initData';

import { useTranslation } from 'react-i18next';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
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
  const isLoading = listHistoryMessageLoading || listNoticeLoading;
  const currentTotal = msgType === 'msg' ? pageTotal : noticeTotal;
  const currentSearchValue =
    msgType === 'msg' ? msgReqParams.msgContentLike : noticeReqParams.subject;
  const searchPlaceholder =
    msgType === 'msg'
      ? t('common.message_modal.please_enter_message_content')
      : t('common.message_modal.please_enter_notice_title');

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
      footer={null}
      centered
      width={860}
    >
      <section className="message-notice-modal__toolbar">
        <Radio.Group
          className="message-notice-modal__tabs"
          optionType="button"
          buttonStyle="solid"
          defaultValue={msgType}
          value={msgType}
          options={radioOptions}
          onChange={(e: any) => {
            setMsgType(e.target.value);
          }}
        />
        <div className="message-notice-modal__tools">
          <Input
            className="message-notice-modal__search"
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined />}
            value={currentSearchValue}
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
            onPressEnter={(event) => {
              const value = event.currentTarget.value;
              if (msgType === 'msg') {
                fetchMsgList({ msgContentLike: value, pageNumber: 1 });
              } else {
                fetchNoticeList({ subject: value, pageNumber: 1 });
              }
            }}
          />
          <Button
            className="message-notice-modal__refresh"
            icon={<ReloadOutlined spin={isLoading} />}
            aria-label={t('application_page.refresh')}
            onClick={refreshDistributor}
          />
        </div>
      </section>
      <div className="message-notice-modal__summary">
        <span>
          {msgType === 'msg' ? t('common.message_modal.msg') : t('common.message_modal.notice')}
        </span>
        <strong>{currentTotal}</strong>
      </div>
      <div className="message-notice-modal__table">
        {msgType === 'msg' ? (
          <Table
            columns={msgColumns}
            dataSource={msgList}
            loading={listHistoryMessageLoading}
            rowKey="id"
            size="middle"
            locale={{
              emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
            }}
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
            locale={{
              emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
            }}
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
      </div>
      {delMsgContextHolder}
    </Modal>
  );
};

export default MessageNoticeModal;
