import { useLoading } from '@/hooks/useLoading';
import { MsgApi, deleteTerminalMsg, listHistoryMessage } from '@/services/api/msg';
import type { HistoryMessageItem, HistoryMessageListRequest } from '@/services/api/msg/types';
import { Modal } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useMsg = () => {
  const { t } = useTranslation();
  const [modal, delMsgContextHolder] = Modal.useModal();
  const deleteTerminalMsgLoading = useLoading(MsgApi.DELETE_TERMINAL_MSG);
  const listHistoryMessageLoading = useLoading(MsgApi.LIST_HISTORY_MESSAGE);
  const [msgList, setMsgList] = useState<HistoryMessageItem[]>([]);

  const [pageTotal, setPageTotal] = useState<number>(0);
  const [msgReqParams, setMsgReqParams] = useState<HistoryMessageListRequest>({
    pageNumber: 1,
    pageSize: 5,
    msgContentLike: '',
  });

  const handleMsgDelete = async (rowData: HistoryMessageItem) => {
    const res = await modal.confirm({
      title: t('common.message_modal.delete_msg'),
      content: t('common.message_modal.confirm_delete_msg'),
      okText: t('common.delete'),
      okButtonProps: {
        loading: deleteTerminalMsgLoading,
      },
    });

    if (res) {
      await deleteTerminalMsg({
        ids: [rowData.id],
      });
      fetchMsgList({
        pageNumber: 1,
        pageSize: 5,
      });
    }
  };
  const fetchMsgList = async (
    data: Partial<HistoryMessageListRequest> = {
      pageNumber: msgReqParams.pageNumber || 1,
      pageSize: msgReqParams.pageSize || 5,
    },
  ) => {
    const req: HistoryMessageListRequest = {
      ...msgReqParams,
      ...data,
    };
    const res = await listHistoryMessage(req);

    setMsgList(res.data.results || []);
    setPageTotal(res.data.totalCount || 0);
    setMsgReqParams(req);
  };

  return {
    delMsgContextHolder,
    msgList,
    handleMsgDelete,
    fetchMsgList,
    pageTotal,
    msgReqParams,
    listHistoryMessageLoading,
    setMsgReqParams,
  };
};
