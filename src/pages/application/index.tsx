import { useEffect, useState } from 'react';
import './index.scss';
import { VirtualApp } from './component/VirtualApp';
import { message, Select, Spin, Tooltip } from 'antd';
import { useInitData } from './initData';
import { Trans, useTranslation } from 'react-i18next';
import { deleteVapp, listVapp, removeVapp, VappApi } from '@/services/api/vapp';
import type {
  DeleteVappReq,
  ListVappItem,
  RemoveVappReq,
  VappCategory,
} from '@/services/api/vapp/types';
import { AddFromSysModal } from './component/AddFromSysModal';
import { AddFromSelfModal } from './component/AddFromSelfModal';
import { useLoading } from '@/hooks/useLoading';
import { connectVapp } from '@/services/invoke/vapp';
import type { ConnectVappReq } from '@/services/invoke/vapp/types';

export const Application = () => {
  const { t } = useTranslation();

  const { appCategoryList } = useInitData();
  const [addFormSysVisible, setAddFromSysVisible] = useState(false);
  const [addFormSelfVisible, setAddFromSelfVisible] = useState(false);
  const listVappLoading = useLoading(VappApi.LIST_VAPP);

  // 分类默认选中全部
  const [category, setCategory] = useState<VappCategory | 'all'>('all');
  const [vappList, setVappList] = useState<ListVappItem[]>([]);

  const getListVapp = async (c: VappCategory | 'all' = category) => {
    const res = await listVapp({
      pageNumber: 1,
      pageSize: 999,
      isAdded: true,
      category: c == 'all' ? undefined : c,
    });
    setCategory(c);
    setVappList(res.data.results || []);
  };

  const handleCustomPublish = () => {
    setAddFromSelfVisible(true);
  };

  const handleFavoriteApp = () => {
    setAddFromSysVisible(true);
  };

  const handleChangeCategory = async (value: VappCategory | 'all') => {
    await getListVapp(value);
  };

  const handleDeleteApp = async (params: DeleteVappReq) => {
    await deleteVapp(params);
    await getListVapp();
    message.success(t('application_page.delete_vapp_success'));
  };

  const handleRemoveApp = async (params: RemoveVappReq) => {
    await removeVapp(params);
    await getListVapp();
    message.success(t('application_page.remove_vapp_success'));
  };

  const handleVappItemClick = async (params: ConnectVappReq) => {
    await connectVapp(params);
  };

  useEffect(() => {
    getListVapp();
  }, []);

  return (
    <div className="application-wrapper">
      <div className="application-header">
        <div className="left-content">
          <Select
            value={category}
            className="page-transparent-select"
            onChange={handleChangeCategory}
            options={appCategoryList}
          />
        </div>
        <Tooltip
          title={<Trans t={t} i18nKey="application_page.virtual_app_minimize_tip" />}
          placement="rightTop"
        >
          <i className="iconfont icon-c_question-s popover-tip-icon" />
        </Tooltip>
      </div>
      <div className="virtual-container">
        <Spin spinning={listVappLoading}>
          <VirtualApp
            dataSource={vappList}
            OnCustomPublish={handleCustomPublish}
            OnFavoriteApp={handleFavoriteApp}
            OnDeleteApp={handleDeleteApp}
            OnRemoveApp={handleRemoveApp}
            OnVappItemClick={handleVappItemClick}
          />
        </Spin>
      </div>
      <AddFromSysModal
        visible={addFormSysVisible}
        setVisible={setAddFromSysVisible}
        OnRefresh={getListVapp}
      />
      <AddFromSelfModal
        visible={addFormSelfVisible}
        setVisible={setAddFromSelfVisible}
        OnRefresh={getListVapp}
      />
    </div>
  );
};
