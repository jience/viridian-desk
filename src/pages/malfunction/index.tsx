import { useLoading } from '@/hooks/useLoading';
import useRequest from '@/hooks/useRequest';
import { FaultApi, listFault, revokeFault } from '@/services/api/fault';
import type { FaultItem, FaultListRequest } from '@/services/api/fault/types';
import { createFault, listResourceUser } from '@/services/resource';
import Actions from '@/utils/actions';
import { hasPermission } from '@/utils/permission';
import type { TablePaginationConfig } from '@/ui/fast';
import { Modal } from '@/ui/fast';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useMessageFormatter } from '@/utils/message-format';
import './index.scss';
import { initQueryParams, useFaultStatus, useFaultType } from './initData';
import { MalfunctionPage } from './MalfunctionPage';
import type { ViewFaultStatus, ViewFaultType } from './types';

const CreatedModal = lazy(() => import('./create'));
const isRecordEmpty = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);

export function Component() {
  const [modal, contextHolder] = Modal.useModal();
  const { formatMessage } = useMessageFormatter();
  const listFaultLoading = useLoading(FaultApi.LIST_FAULT);

  const [queryParams, setQueryParams] = useState(initQueryParams);
  const [faultList, setFaultList] = useState<FaultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [tableChecked, setTableChecked] = useState<FaultItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const listRequestSeqRef = useRef(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const initialValues = {
    faultType: 'desktop',
  };
  const [desktopListOptions, setDesktopListOptions] = useState<Array<any>>([]);
  const [defaultFormValues, setDefaultFormValues] = useState(initialValues);

  const [curFaultType, setCurFaultType] = useState<ViewFaultType>('all');
  const [curFaultStatus, setCurFaultStatus] = useState<ViewFaultStatus>('all');
  const { options: faultStatusOptions, faultStatusKv, faultStatusStatusKv } = useFaultStatus();
  const { options: faultTypeOptions, faultTypeKv } = useFaultType();

  const clearSelection = () => {
    setSelectedRowKeys([]);
    setTableChecked([]);
  };

  // 创建工单
  const { run: createFaultRun, loading: createFaultLoading } = useRequest(createFault, {
    manual: true,
    onSuccess: async () => {
      setCreateModalVisible(false);
      await fetchFaultList();
    },
  });

  // 桌面列表
  const { run: listResourceUserRun, loading: listResourceUserLoading } = useRequest(
    listResourceUser,
    {
      manual: true,
      onSuccess: (res: any) => {
        setDesktopListOptions(
          (res?.results || []).map((desk: any) => {
            return {
              label: desk.name,
              value: desk.id,
            };
          }),
        );
      },
    },
  );

  const formFeatures = useMemo(() => {
    return [
      {
        key: 'faultType',
        name: 'faultType',
        label: formatMessage({ id: 'FaultType' }),
        canLabelClick: '',
        rules: [{ required: true }],
        type: 'select',
        comProps: {
          prefix: '',
          suffix: '',
          options: [
            {
              label: formatMessage({ id: 'Desktop' }),
              value: 'desktop',
            },
            {
              label: formatMessage({ id: 'Terminal' }),
              value: 'terminal',
            },
            {
              label: formatMessage({ id: 'Other' }),
              value: 'other',
            },
          ],
          placeholder: `${formatMessage({
            id: 'PleaseChoose',
          })}${formatMessage({ id: 'FaultType' })}`,
        },
      },
      {
        key: 'desktopId',
        name: 'desktopId',
        label: formatMessage({ id: 'FaultDesktop' }),
        canLabelClick: '',
        rules: [
          {
            required: true,
            message: `${formatMessage({ id: 'PleaseChoose' })}${formatMessage({
              id: 'FaultDesktop',
            })}`,
          },
        ],
        type: 'select',
        comProps: {
          prefix: '',
          suffix: '',
          options: desktopListOptions,
          loading: listResourceUserLoading,
          placeholder: `${formatMessage({
            id: 'PleaseChoose',
          })}${formatMessage({ id: 'FaultDesktop' })}`,
        },
        impactHiddenAndOr: false,
        impactHidden: [
          {
            key: 'faultType',
            hiddenRule: (val: any) => {
              return val !== 'desktop';
            },
          },
        ],
      },
      {
        key: 'description',
        name: 'description',
        label: formatMessage({ id: 'FaultContent' }),
        canLabelClick: '',
        rules: [
          {
            required: true,
            validator: (_rule: any, val: any, callback: any) => {
              if (!val || val.trim().length < 1) {
                callback(
                  `${formatMessage({ id: 'PleaseInput' })} ${formatMessage({
                    id: 'FaultContent',
                  })}`,
                );
              } else {
                callback();
              }
            },
          },
        ],
        type: 'input.textArea',
        comProps: {
          prefix: '',
          suffix: '',
          placeholder: `${formatMessage({
            id: 'PleaseInput',
          })} ${formatMessage({ id: 'FaultContent' })}`,
          maxLength: 200,
          showCount: true,
          autoSize: {
            minRows: 6,
            maxRows: 8,
          },
        },
      },
    ];
  }, [desktopListOptions, formatMessage, listResourceUserLoading]);

  const handleCancel = async (row?: FaultItem) => {
    let tips;
    let rows: string[] = [];
    if (row && !isRecordEmpty(row)) {
      tips = {
        label: formatMessage({ id: 'CancedFaultMsg' }, { title: row.description }),
        selectedItemIds: [row.id],
        selectedItemName: [],
      };
      rows = [row.id];
    } else {
      if (tableChecked.length > 1) {
        tips = {
          label: formatMessage({ id: 'CancedFaultBatchMsg' }, { count: tableChecked.length }),
          selectedItemIds: selectedRowKeys,
          selectedItemName: tableChecked.map((item: any) => {
            return item.description;
          }),
        };
      } else {
        tips = {
          label: formatMessage({ id: 'CancedFaultMsg' }, { title: tableChecked[0].description }),
          selectedItemIds: selectedRowKeys,
          selectedItemName: [],
        };
      }
      rows = selectedRowKeys;
    }

    const res = await modal.confirm({
      title: formatMessage({ id: 'FaultCancel' }),
      content: tips.label,
      okText: formatMessage({ id: 'Confirm' }),
      cancelText: formatMessage({ id: 'Cancel' }),
    });
    if (res) {
      await revokeFault({ ids: rows });
      clearSelection();
      await fetchFaultList();
    }
  };

  const handlePageChange = async (page: any) => {
    await fetchFaultList({ pageNumber: page });
  };

  // 获取工单列表
  const fetchFaultList = async (params?: Partial<FaultListRequest>) => {
    const req: FaultListRequest = {
      sortKey: queryParams.sortKey,
      sortOrder: queryParams.sortOrder,
      pageNumber: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
      faultType: curFaultType === 'all' ? '' : curFaultType,
      status: curFaultStatus === 'all' ? '' : curFaultStatus,
      ...params,
    };
    const requestSeq = ++listRequestSeqRef.current;
    const resp = await listFault(req);
    if (requestSeq !== listRequestSeqRef.current) {
      return;
    }
    setQueryParams(req);
    setFaultList(resp.data.results || []);
    setTotal(resp.data.totalCount || 0);
  };

  const resetFaultList = async () => {
    clearSelection();
    await fetchFaultList(initQueryParams);
  };

  // 获取桌面数据
  const getDeskList = () => {
    const queryData = {
      pageSize: 9999,
      pageNumber: 1,
      reverseStatusList: ['Unknown'],
    };

    if (!listResourceUserLoading) {
      listResourceUserRun(queryData);
    }
  };

  const submitDistributor = (params: any) => {
    // 处理description，替换所有换行符
    params.description = params.description.replace(/[\r\n]/g, ' ');
    if (!params.desktopId) {
      delete params.desktopId;
    }
    createFaultRun(params);
  };

  useEffect(() => {
    resetFaultList();
  }, []);

  useEffect(() => {
    return () => {
      setCreateModalVisible(false);
    };
  }, []);

  const handleFaultTypeChange = async (value: ViewFaultType) => {
    setCurFaultType(value);
    clearSelection();
    const req: Partial<FaultListRequest> = {
      pageNumber: 1,
      faultType: value === 'all' ? '' : value,
    };
    await fetchFaultList(req);
  };

  const handleFaultStatusChange = async (value: ViewFaultStatus) => {
    setCurFaultStatus(value);
    clearSelection();
    const req: Partial<FaultListRequest> = {
      pageNumber: 1,
      status: value === 'all' ? '' : value,
    };
    await fetchFaultList(req);
  };

  const paginationProps = useMemo<false | TablePaginationConfig>(() => {
    const { pageNumber, pageSize } = queryParams;
    if (total > 0 && hasPermission([Actions.TerminalROMalfunctionRead])) {
      return {
        current: pageNumber,
        pageSize: pageSize,
        total: total,
        showSizeChanger: false,
        showQuickJumper: false,
        onChange: handlePageChange,
        disabled: listFaultLoading,
        simple: true,
        size: 'small',
      };
    }
    return false;
  }, [queryParams, listFaultLoading, total]);

  return (
    <div className="malfunction-list">
      <MalfunctionPage
        currentType={curFaultType}
        currentStatus={curFaultStatus}
        faultTypeOptions={faultTypeOptions}
        faultStatusOptions={faultStatusOptions}
        faultTypeLabels={faultTypeKv}
        faultStatusLabels={faultStatusKv}
        faultStatusColors={faultStatusStatusKv}
        rows={faultList}
        total={total}
        loading={listFaultLoading}
        selectedRowKeys={selectedRowKeys}
        selectedRows={tableChecked}
        pagination={paginationProps}
        canCancel={hasPermission([Actions.TerminalRWMalfunctionCancel])}
        canCreate={hasPermission(Actions.TerminalRWMalfunctionReport)}
        onRefresh={() => fetchFaultList()}
        onTypeChange={handleFaultTypeChange}
        onStatusChange={handleFaultStatusChange}
        onCancel={handleCancel}
        onCreate={() => {
          getDeskList();
          setCreateModalVisible(true);
        }}
        onSelectionChange={(keys, rows) => {
          setSelectedRowKeys(keys);
          setTableChecked(rows);
        }}
        formatMessage={formatMessage}
      />
      {createModalVisible && (
        <Suspense fallback={null}>
          <CreatedModal
            title={formatMessage({ id: 'FaultCreate' })}
            visiable={createModalVisible}
            setVisiable={setCreateModalVisible}
            formFeatures={formFeatures}
            defaultFormValues={defaultFormValues}
            setDefaultFormValues={setDefaultFormValues}
            initialValues={initialValues}
            onOkRun={submitDistributor}
            createFaultLoading={createFaultLoading}
            formatMessage={formatMessage}
          />
        </Suspense>
      )}
      {contextHolder}
    </div>
  );
}
