import { Button, Input, message, Modal, Space, Table } from 'antd';
import { useEffect, useState, type FC } from 'react';
import './index.scss';
// import * as AppAjax from '@/services/application';
import { useLoading } from '@/hooks/useLoading';
import { addVapp, listVapp, VappApi } from '@/services/api/vapp';
import type { ListVappItem, ListVappReq, VappCategory } from '@/services/api/vapp/types';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { Trans, useTranslation } from 'react-i18next';
import { useInitData } from '../../initData';

export interface AddFromSysModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  OnRefresh: () => void;
}

export const AddFromSysModal: FC<AddFromSysModalProps> = (props) => {
  const { visible, setVisible, OnRefresh } = props;
  const { t } = useTranslation();
  const listVappLoading = useLoading(VappApi.LIST_VAPP);
  const addVappLoading = useLoading(VappApi.ADD_VAPP);

  const [appList, setAppList] = useState<ListVappItem[]>([]);
  const [checked, setChecked] = useState([]);

  const [totalPage, setTotalPage] = useState(0);
  const [params, setParams] = useState<ListVappReq>({
    pageNumber: 1,
    pageSize: 5,
    isAdded: false,
    nameLike: '',
  });

  const { appModeList, appCategoryList } = useInitData();

  const addVappToFavorite = async (mIds: string[]) => {
    await addVapp({
      mIds,
    });
    message.success(t('application_page.add_vapp_success'));
    OnRefresh();
    cancelModal();
  };

  const getListVapp = async (req?: Partial<ListVappReq>) => {
    const requestParams = {
      ...params,
      ...req,
    };
    setChecked([]);
    const res = await listVapp(requestParams);
    setParams(requestParams);
    setAppList(res.data.results || []);
    setTotalPage(res.data.totalCount);
  };

  useEffect(() => {
    if (visible) {
      getListVapp();
    }
  }, [visible]);

  const columns: ColumnsType<ListVappItem> = [
    {
      title: t('application_page.vapp_name'),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: '1.2rem',
      ellipsis: true,
      render: (_text: any, row: any) => {
        return row.vapp.name || '-';
      },
    },
    {
      title: t('application_page.vapp_category'),
      dataIndex: 'category',
      key: 'category',
      width: '1.1rem',
      render: (_text: any, row: any) => {
        return appCategoryList.find((val: any) => val.value === row.vapp.category)?.label || '-';
      },
      filterMultiple: false,
      filters: appCategoryList.map((item: any) => ({
        text: item.label,
        value: item.value,
      })),
    },
    {
      title: t('application_page.vapp_mode'),
      dataIndex: 'mode',
      width: '1rem',
      key: 'mode',
      render: (_text: any, row: any) => {
        return appModeList.find((val: any) => val.value === row.vapp.mode)?.label || '-';
      },
    },
    {
      title: t('application_page.vapp_desktop_desk_pool'),
      dataIndex: 'desktop',
      key: 'desktop',
      width: '1.4rem',
      render: (_text: any, row: any) => {
        return row.desktop ? row.desktop.name : row.desktopPool.name || '-';
      },
    },
    {
      title: t('application_page.vapp_description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (_text: any, row: any) => {
        return row.vapp.description || '-';
      },
    },
  ];

  const cancelModal = () => {
    setChecked([]);
    setVisible(false);
  };

  const renderFooter = () => {
    return (
      <div className="add-vapp-footer">
        <Trans
          t={t}
          i18nKey="application_page.vapp_selected"
          values={{ count: checked.length }}
          components={{ 1: <strong />, 2: <span /> }}
        />
        <Space>
          <Button onClick={() => cancelModal()}>{t('application_page.cancel')}</Button>
          <Button
            type="primary"
            disabled={checked.length === 0}
            loading={addVappLoading}
            onClick={() => addVappToFavorite(checked)}
          >
            {t('application_page.confirm')}
          </Button>
        </Space>
      </div>
    );
  };

  const handleTableChange: TableProps<ListVappItem>['onChange'] = async (
    pagination,
    filters,
    _sorter,
  ) => {
    const [category] = (filters.category || []) as (VappCategory | 'all')[];

    await getListVapp({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
      category: category === 'all' ? undefined : category,
    });
  };

  return (
    <Modal
      open={visible}
      destroyOnHidden
      keyboard={false}
      footer={renderFooter()}
      onCancel={() => cancelModal()}
      className="add-favorite-app-modal"
      title={t('application_page.favorite_app')}
      centered={true}
    >
      <Space className="search-bar" size={8}>
        <Button icon={<ReloadOutlined spin={listVappLoading} />} onClick={() => getListVapp()} />
        <Input.Search
          className="search-input"
          placeholder={t('application_page.vapp_name_placeholder')}
          loading={listVappLoading}
          value={params.nameLike}
          onChange={(e) => {
            setParams((prev) => ({ ...prev, nameLike: e.target.value.trim() }));
          }}
          allowClear
          onSearch={(value) => {
            getListVapp({ nameLike: value.trim() });
          }}
        />
      </Space>
      <Table<ListVappItem>
        columns={columns}
        loading={listVappLoading}
        rowKey="id"
        size="middle"
        pagination={{
          pageSize: params.pageSize,
          current: params.pageNumber,
          total: totalPage,
        }}
        dataSource={appList}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: checked,
          onChange: (selectedRowKeys: any) => {
            setChecked(selectedRowKeys);
          },
        }}
        onChange={handleTableChange}
      />
    </Modal>
  );
};
