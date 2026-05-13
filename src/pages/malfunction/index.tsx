import { useLoading } from '@/hooks/useLoading';
import useRequest from '@/hooks/useRequest';
import { FaultApi, listFault, revokeFault } from '@/services/api/fault';
import type {
  FaultItem,
  FaultListRequest,
  FaultStatus,
  FaultType,
} from '@/services/api/fault/types';
import { createFault, listResourceUser } from '@/services/resource';
import { authActionShow } from '@/utils/actionAuth';
import Actions from '@/utils/actions';
import { hasPermission } from '@/utils/permission';
import type { TableColumnProps, TablePaginationConfig } from 'antd';
import { Button, Modal, Popover, Select, Space, Table, Tag, Tooltip } from 'antd';
import { isEmpty } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import CreatedModal from './create';
import './index.scss';
import { initQueryParams, useFaultStatus, useFaultType } from './initData';
import type { ViewFaultStatus, ViewFaultType } from './types';

export function Component() {
  const [modal, contextHolder] = Modal.useModal();
  const { formatMessage } = useIntl();
  const listFaultLoading = useLoading(FaultApi.LIST_FAULT);

  const [queryParams, setQueryParams] = useState(initQueryParams);
  const [faultList, setFaultList] = useState<FaultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [tableChecked, setTableChecked] = useState<FaultItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
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

  const columns: TableColumnProps<FaultItem>[] = [
    {
      title: formatMessage({ id: 'FaultContent' }),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: formatMessage({ id: 'FaultType' }),
      dataIndex: 'faultType',
      key: 'faultType',
      width: '1rem',
      render: (val: FaultType, row) => {
        if (val === 'desktop') {
          return (
            <Tooltip placement="right" title={`工单桌面：${row.desktop?.name || '-'}`}>
              {faultTypeKv[val]}
              <i
                style={{ fontSize: '10px', transform: 'rotate(90deg)' }}
                className="iconfont 'icon-more'"
              />
            </Tooltip>
          );
        } else {
          return faultTypeKv[val] || '-';
        }
      },
    },
    {
      title: formatMessage({ id: 'STATUS' }),
      dataIndex: 'status',
      key: 'status',
      width: '1rem',
      render: (val: FaultStatus, row: any) => {
        if (['solved', 'reject'].includes(val)) {
          const title = (
            <div className="poptitle">
              {formatMessage({
                id: val === 'solved' ? 'SolveFaultSuggest' : 'RejectFaultReason',
              })}
            </div>
          );
          const content = (
            <div className="contentbox">
              <div className="popreply popoverStatic">{row.reply}</div>
              <div className="poptime">{row.updateTime}</div>
            </div>
          );
          return (
            <Popover
              placement="right"
              title={title}
              content={content}
              getPopupContainer={(node: any) => node.parentNode}
              trigger="hover"
            >
              <Tag color={faultStatusStatusKv[val]}>{faultStatusKv[val]}</Tag>
            </Popover>
          );
        } else {
          return <Tag color={faultStatusStatusKv[val]}>{faultStatusKv[val]}</Tag>;
        }
      },
    },
    {
      title: formatMessage({ id: 'FaultProcessor' }),
      dataIndex: ['approveUser', 'loginName'],
      key: 'userName',
      width: '1rem',
      render: (val: any) => {
        return isEmpty(val) ? (
          '-'
        ) : (
          <span title={`${val}`} className="malfunction-name-text">{`${val}`}</span>
        );
      },
    },
    {
      title: formatMessage({ id: 'FaultReportTime' }),
      dataIndex: 'createTime',
      key: 'createTime',
      width: '1.6rem',
      render: (val: any) => {
        return val || '-';
      },
    },
    ...(authActionShow([Actions.TerminalRWMalfunctionCancel])
      ? ([
          {
            title: formatMessage({ id: 'ACTION' }),
            dataIndex: 'action',
            key: 'action',
            width: '1rem',
            render: (_value, row) => {
              return (
                <Button
                  type="text"
                  disabled={['solved', 'reject', 'revoke'].includes(row.status)}
                  onClick={() => {
                    handleCancel(row);
                  }}
                >
                  {formatMessage({ id: 'FaultCancel' })}
                </Button>
              );
            },
          },
        ] as TableColumnProps<FaultItem>[])
      : []),
  ];

  const handleCancel = async (row?: FaultItem) => {
    let tips;
    let rows: string[] = [];
    if (!isEmpty(row)) {
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
      fetchFaultList();
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setTableChecked(selectedRows);
    },
  };

  const cancelDisable = useMemo(() => {
    if (tableChecked?.length > 0) {
      return tableChecked.some((item: any) => ['solved', 'reject', 'revoke'].includes(item.status));
    } else {
      return true;
    }
  }, [tableChecked]);

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
    const resp = await listFault(req);
    setQueryParams(req);
    setFaultList(resp.data.results || []);
    setTotal(resp.data.totalCount || 0);
  };

  const resetFaultList = async () => {
    setSelectedRowKeys([]);
    setTableChecked([]);
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
    const req: Partial<FaultListRequest> = {
      pageNumber: 1,
      faultType: value === 'all' ? '' : value,
    };
    await fetchFaultList(req);
  };

  const handleFaultStatusChange = async (value: ViewFaultStatus) => {
    setCurFaultStatus(value);
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
      <div className="panel-header malfunction-header">
        <Space>
          {hasPermission(
            [Actions.TerminalRWMalfunctionCancel],
            <Tooltip title={formatMessage({ id: 'FaultCancel' })}>
              <Button
                icon={<i className="iconfont icon-file-cancel"></i>}
                disabled={cancelDisable || listFaultLoading}
                onClick={() => handleCancel()}
              />
            </Tooltip>,
          )}
          <Button
            icon={<i className="iconfont icon-refresh" />}
            onClick={() => fetchFaultList()}
          ></Button>
          <Select
            className="page-transparent-select"
            defaultValue={curFaultType}
            options={faultTypeOptions}
            onChange={handleFaultTypeChange}
          ></Select>
          <Select
            className="page-transparent-select"
            defaultValue={curFaultStatus}
            options={faultStatusOptions}
            onChange={handleFaultStatusChange}
          ></Select>
        </Space>
        {hasPermission(
          Actions.TerminalRWMalfunctionReport,
          <Button
            type="primary"
            icon={<i className="iconfont icon-add" />}
            onClick={() => {
              getDeskList();
              setCreateModalVisible(true);
            }}
          />,
        )}
      </div>
      <Table<FaultItem>
        rowKey="id"
        rowSelection={rowSelection}
        className="pretty-large-table"
        columns={columns}
        dataSource={faultList}
        pagination={paginationProps}
        loading={listFaultLoading}
      />
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
      {contextHolder}
    </div>
  );
}
