import { useLoading } from '@/hooks/useLoading';
import { listNotice, NoticeApi } from '@/services/api/notice';
import type { NoticeItem, NoticeListRequest } from '@/services/api/notice/types';
import { useState } from 'react';

export const useNotice = () => {
  const [noticeList, setNoticeList] = useState<NoticeItem[]>([]);
  const listNoticeLoading = useLoading(NoticeApi.LIST_NOTICE);
  const [noticeTotal, setNoticeTotal] = useState<number>(0);
  const [noticeReqParams, setNoticeReqParams] = useState<NoticeListRequest>({
    pageNumber: 1,
    pageSize: 5,
    subject: '',
  });

  const fetchNoticeList = async (
    data: Partial<NoticeListRequest> = {
      pageNumber: noticeReqParams.pageNumber || 1,
      pageSize: noticeReqParams.pageSize || 5,
    },
  ) => {
    const req: NoticeListRequest = {
      ...noticeReqParams,
      ...data,
    };

    const res = await listNotice(req);

    setNoticeList(res.data.results || []);
    setNoticeTotal(res.data.totalCount || 0);
    setNoticeReqParams(req);
  };

  return {
    noticeList,
    fetchNoticeList,
    listNoticeLoading,
    noticeTotal,
    noticeReqParams,
    setNoticeReqParams,
  };
};
