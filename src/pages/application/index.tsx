import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { message } from '@/ui';
import { useInitData } from './initData';
import { useTranslation } from 'react-i18next';
import { deleteVapp, listVapp, removeVapp } from '@/services/api/vapp';
import type {
  DeleteVappReq,
  ListVappItem,
  RemoveVappReq,
  VappCategory,
} from '@/services/api/vapp/types';
import { connectVapp } from '@/services/invoke/vapp';
import type { ConnectVappReq } from '@/services/invoke/vapp/types';
import { ApplicationPage } from './ApplicationPage';

const AddFromSysModal = lazy(() =>
  import('./component/AddFromSysModal').then((module) => ({ default: module.AddFromSysModal })),
);
const AddFromSelfModal = lazy(() =>
  import('./component/AddFromSelfModal').then((module) => ({ default: module.AddFromSelfModal })),
);

export const Application = () => {
  const { t } = useTranslation();

  const { appCategoryList } = useInitData();
  const [addFormSysVisible, setAddFromSysVisible] = useState(false);
  const [addFormSelfVisible, setAddFromSelfVisible] = useState(false);
  const [listVappLoading, setListVappLoading] = useState(false);

  // 分类默认选中全部
  const [category, setCategory] = useState<VappCategory | 'all'>('all');
  const [vappList, setVappList] = useState<ListVappItem[]>([]);
  const listRequestSeqRef = useRef(0);

  const getListVapp = async (c: VappCategory | 'all' = category) => {
    const requestSeq = ++listRequestSeqRef.current;
    setListVappLoading(true);
    try {
      const res = await listVapp({
        pageNumber: 1,
        pageSize: 999,
        isAdded: true,
        category: c === 'all' ? undefined : c,
      });
      if (requestSeq !== listRequestSeqRef.current) {
        return;
      }
      setCategory(c);
      setVappList(res.data.results || []);
    } finally {
      if (requestSeq === listRequestSeqRef.current) {
        setListVappLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    await getListVapp(category);
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
    <>
      <ApplicationPage
        category={category}
        categories={appCategoryList}
        dataSource={vappList}
        loading={listVappLoading}
        onCategoryChange={handleChangeCategory}
        onRefresh={handleRefresh}
        onCustomPublish={handleCustomPublish}
        onFavoriteApp={handleFavoriteApp}
        onDeleteApp={handleDeleteApp}
        onRemoveApp={handleRemoveApp}
        onVappItemClick={handleVappItemClick}
      />
      {addFormSysVisible && (
        <Suspense fallback={null}>
          <AddFromSysModal
            visible={addFormSysVisible}
            setVisible={setAddFromSysVisible}
            OnRefresh={getListVapp}
          />
        </Suspense>
      )}
      {addFormSelfVisible && (
        <Suspense fallback={null}>
          <AddFromSelfModal
            visible={addFormSelfVisible}
            setVisible={setAddFromSelfVisible}
            OnRefresh={getListVapp}
          />
        </Suspense>
      )}
    </>
  );
};
