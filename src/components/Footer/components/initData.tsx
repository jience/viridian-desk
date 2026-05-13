import { HistoryMessageLevel, type HistoryMessageItem } from '@/services/api/msg/types';
import type { NoticeItem } from '@/services/api/notice/types';
import { useAppSelector } from '@/store';
import { selectIsLogin } from '@/store/feature/app';
import { Button, Tooltip, type CheckboxOptionType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

export const useInitData = (opt: {
  onMsgDelete: (rowData: HistoryMessageItem) => Promise<void>;
}) => {
  const isLogin = useAppSelector(selectIsLogin);
  const { t } = useTranslation();

  const radioOptions: CheckboxOptionType[] = [
    { label: t('common.message_modal.notice'), value: 'notice' },
    { label: t('common.message_modal.msg'), value: 'msg' },
  ];

  const levelMap: Record<HistoryMessageLevel, string> = {
    [HistoryMessageLevel.EMERGENCY]: t('common.message_modal.important_message'),
    [HistoryMessageLevel.NORMAL]: t('common.message_modal.normal_message'),
  };

  const msgColumns: ColumnsType<HistoryMessageItem> = [
    {
      title: t('common.message_modal.msg_content'),
      dataIndex: 'msgContent',
      key: 'msgContent',
      ellipsis: true,
      render: (text: any) => {
        return text || '-';
      },
    },
    {
      title: t('common.message_modal.msg_type'),
      dataIndex: 'level',
      key: 'level',
      width: '1rem',
      render: (text: HistoryMessageLevel) => {
        return levelMap[text] || '-';
      },
    },
    {
      title: t('common.message_modal.send_time'),
      dataIndex: 'createTime',
      key: 'createTime',
      width: '1.6rem',
      render: (text: any) => {
        return text || '-';
      },
    },
    {
      title: t('common.message_modal.sender'),
      dataIndex: 'userName',
      key: 'userName',
      fixed: 'left',
      width: '1rem',
      render: (text: any) => {
        return text ? <span title={`${text}`}>{`${text}`}</span> : '-';
      },
    },
    {
      dataIndex: 'operate',
      key: 'operate',
      fixed: 'right',
      width: '1rem',
      title: t('common.operate'),
      render: (_value, row) => {
        return (
          <Button type="text" disabled={!isLogin} onClick={() => opt.onMsgDelete(row)}>
            {t('common.delete')}
          </Button>
        );
      },
    },
  ];

  const noticeColumns: ColumnsType<NoticeItem> = [
    {
      title: t('common.message_modal.notice_title'),
      dataIndex: 'subject',
      key: 'subject',
      width: '1.8rem',
      ellipsis: true,
      render: (text: any) => {
        return (
          <Tooltip title={text || '-'} trigger={['hover']} placement="left">
            <p className="footer-title">{text || '-'}</p>
          </Tooltip>
        );
      },
    },
    {
      title: t('common.message_modal.notice_content'),
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text: any) => {
        return (
          <Tooltip title={text || '-'} trigger={['hover']} placement="left">
            {text || '-'}
          </Tooltip>
        );
      },
    },
    {
      title: t('common.message_modal.published_time'),
      dataIndex: 'publishedTime',
      key: 'publishedTime',
      width: '1.5rem',
      render: (text: any) => {
        return text || '-';
      },
    },
    {
      title: t('common.message_modal.notice_publisher'),
      dataIndex: 'publisher',
      key: 'publisher',
      width: '1rem',
      fixed: 'left',
      render: (text: any) => {
        return text ? <span title={`${text?.loginName}`}>{`${text?.loginName}`}</span> : '-';
      },
    },
  ];

  return { msgColumns, noticeColumns, radioOptions };
};
