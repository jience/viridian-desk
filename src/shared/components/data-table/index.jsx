import React, { useState, useEffect, useCallback, useMemo, memo, useContext } from 'react';
// eslint-disable-next-line import/named
import { Table, Button, Checkbox, Row, Col, Menu, Dropdown as Dropdown } from '@/shared/ui';
import SearchBar from '../search-bar';
import { clearEmpty } from '@/utils/utils';
import { Divider } from '@/shared/ui';
import { useMessageFormatter } from '@/utils/message-format';
import ActionAuth from '@/utils/actionAuth';
import { clonePlainValue, getPathValue, isEmptyValue } from '@/utils/value';
const AuthDropdown = ActionAuth(Dropdown);
const AuthButton = ActionAuth(Button);

import './index.scss';

/**
 * 列表组件
 * 大部分属性都可直接参考本地 UI
 * @param {*} param0
 */
const TableCommon = ({
  // 列表操作栏刷新按钮跟搜索框中间的部分插槽
  stickySlot = null,
  // 模糊搜索，如不需要可传null
  searchOption = {},
  // 列表接口查询条件
  params = {},
  // 刷新回调
  onRefresh = () => {},
  // 列表参数变化回调
  onTableChange = () => {},
  // 总条目数
  total = 0,
  // 列配置
  columns = [],
  // loading状态
  loading = false,
  // 列表数据源
  data = [],
  // 有checkbox情况下check回调
  onChecked = () => {},
  // 列表checkbox属性控制
  getCheckboxProps = () => {},
  /**
     * 批量操作按钮和表头按钮
        eg: [{
            isBatch: true, // 是否是批量操作按钮（即和checkbox关联）
            icon: 'empty', // 按钮icon
            type: 'default', // 按钮类型
            name: '删除', // 按钮标题（非批量操作按钮时tooltip展示）
            text: '删除', // 按钮标题
            disabled: false, // 按钮是否置灰
            actions: [Action.XXX], // 按钮权限
            onClick: () => { } // 按钮点击回调
            options: [{
                key: '',
                name: '',
                callback: () => {},
                disabled: false,
                action: Action.XXX
            }] // 支持dropdown(仅非批量操作支持isBatch不能为true)
        }]
     */
  operateButtons = [],
  // 按钮批量操作权限列表（会据此判断是否不显示checkbox）
  titleOperationPermissions = [],
  // 列表操作权限列表（会据此判断是否不显示操作列）
  operationPermissions = [],
  // 行点击回调
  onRowClick = () => {},
  // 有详情抽屉时需要传，用来显示选中行高亮
  selectedDrawerKey = '',
  // 列表总宽
  width = null,
  // 不需要显示在表头搜索中的参数，请求仍会带上，只是不显示
  extraParams = [],
  // 默认隐藏的列的key
  defaultHideKey = [],
  /**
     * 需要显示行tooltip时配置
     eg: [{
         rowKey: '', // 需要显示tooltip的行的rowKey(需要与rowKey属性定义一致)
         title: '' // tooltip显示内容
     }]
     */
  rowTips = [],
  // 组件唯一id, 用来处理缓存及推送， 需要确保唯一性，建议使用文件路径层级
  uniqueId = '',
  // searchBar左侧插槽
  slotLeft = '',
  // searchBar右侧插槽
  slotRight = '',
  // searchBar右侧默认setting按钮
  showColumnsSetting = false,
  // 是否需要checkbox
  checkable = true,
  // 是否隐藏分页
  noPage = false,
  // searchBar额外参数，如果默认配置不满足需求，可用此参数自行覆盖
  searchProps = {},
  // 如果行选择参数不满足，可用此参数自行覆盖
  rowSelectionProps = {},
  // url中不需要进入查询参数的参数
  extraURIParams = [],
  // 是否把请求参数拼接到url上
  // 刷新时是否显示loading
  slient = true,
  // 拖拽结束回调
  onSortEnd = () => {},
  // 列表是否支持拖动
  draggable = false,
  onColumnChange,
  // 忽略行点击触发的刷新
  noRowRefresh = false,
  // 其他参数支持本地UI table原生参数
  containerStyle = {},
  ...other
}) => {
  const intl = useMessageFormatter();
  // 不显示的查询参数
  // 不显示的查询参数
  const untreatedParamKeys = [
    'pageNumber',
    'pageSize',
    'sortOrder',
    'sortKey',
    'logicalZoneId',
    'ids',
    ...extraParams,
  ];

  const handleAppendDefaultRender = (columns = []) => {
    return columns.map((item) => ({
      ...item,
      render:
        item.render ||
        function (val, data) {
          return val || '-';
        },
    }));
  };

  /** 列隐藏设置start **/
  const [finalColumns, setFinalColumns] = useState([]);
  const [cacheData, setCacheData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [realColumns, setRealColumns] = useState([]);

  const batchRowOperateButtons = useMemo(
    () => operateButtons.filter((item) => item.isBatch).map(({ isBatch, ...item }) => item),
    [operateButtons],
  );

  const otherOperateButtons = useMemo(
    () => operateButtons.filter((item) => !item.isBatch),
    [operateButtons],
  );

  const handleRefresh = () => {
    onRefresh();
  };

  useEffect(() => {
    if (columns.length) {
      setFinalColumns(handleAppendDefaultRender(columns).map((col) => col));
    }
  }, [columns]);

  // 处理参数与表头筛选的国际化映射
  const getParamsAlias = () => {
    const intl = columns.reduce(
      (prev, curr) => {
        return {
          ...prev,
          [curr.key]: curr.title,
        };
      },
      isEmptyValue(searchOption) ? {} : { [searchOption.key]: searchOption.title },
    );

    const filterOptions = columns
      .filter((item) => item.filter)
      .reduce((prev, curr) => {
        return {
          ...prev,
          [curr.key]: getPathValue(curr, 'filter.options', []),
        };
      }, {});
    const target = clonePlainValue(params);
    return Object.keys(target).reduce((prev, item) => {
      const options = getPathValue(filterOptions, item, []);
      const col = columns.find((c) => c.key === item);
      if (getPathValue(col, 'filter.type') === 'Cascader') {
        const firstItem = options.find((v) => v.value === params[item][0]);
        let secondItem = '';
        let thirdItem = '';
        if (params[item].length > 1) {
          secondItem = getPathValue(firstItem, 'children', []).find(
            (v) => v.value === params[item][1],
          );
          if (params[item].length > 2) {
            thirdItem = getPathValue(secondItem, 'children', []).find(
              (v) => v.value === params[item][2],
            );
          }
        }
        return {
          ...prev,
          [item]: {
            title: intl[item] || '',
            value: `${getPathValue(firstItem, 'label', '')}${secondItem ? '/' : ''}${getPathValue(
              secondItem,
              'label',
              '',
            )}${thirdItem ? '/' : ''}${getPathValue(thirdItem, 'label', '')}`,
          },
        };
      }
      if (getPathValue(col, 'filter.type') === 'Checkbox') {
        return {
          ...prev,
          [item]: {
            title: intl[item] || '',
            value: params[item]
              .map((ch) =>
                getPathValue(
                  options.find((o) => o.value === ch),
                  'title',
                  '',
                ),
              )
              .join('/'),
          },
        };
      }
      return {
        ...prev,
        [item]: {
          title: intl[item] || '',
          value: getPathValue(
            options.find((v) => params[item] === v.value),
            'title',
            '',
          ),
        },
      };
    }, {});
  };

  const handleChange = useCallback(
    (type, newParams) => {
      const queryParams = clearEmpty({ ...params, ...newParams });
      if (!noPage && type !== 'pagination') {
        // 查询列表时页码重置为1
        queryParams.pageNumber = 1;
      }
      onTableChange(queryParams);
    },
    [params],
  );

  // 列隐藏设置
  const getColumnSetting = () => {
    const cols = columns;
    const options = columns.map((item) => ({
      label: item.title,
      value: item.key,
    }));

    const defValue = cols.filter((item) => !item.hide).map((item) => item.key);

    return (
      <div className="table-common-column-setting">
        <Checkbox.Group defaultValue={defValue} onChange={handleColumnChange}>
          <Row gutter={[0, 8]}>
            {options.map((item, i) => (
              <Col key={i} span={24}>
                <Checkbox
                  disabled={defValue.length < 5 && defValue.includes(item.value)}
                  value={item.value}
                >
                  {item.label}
                </Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </div>
    );
  };

  // 勾选列隐藏
  const handleColumnChange = (checkedValues = []) => {
    const tc = columns.map((col) => ({
      key: col.key,
      hide: !checkedValues.includes(col.key),
    }));
    if (typeof onColumnChange === 'function') {
      onColumnChange(tc);
    }
  };

  const handleColumnsChange = (columns) => {
    setFinalColumns(columns.filter(({ hidden }) => !hidden));
  };

  // 批量操作
  const renderBatchActions = () => {
    const result = batchRowOperateButtons.filter(({ actions = [] }) => isEmptyValue(actions));
    const before = result.length > 6 ? result.slice(0, 5) : result.slice(0, 6);
    const after = result.length > 6 ? result.slice(5) : [];

    const menu = (
      <Menu
        onClick={(e) => {
          const { onClick } =
            after.find((item) => item.key === e.key || item.id === e.key || item.name === e.key) ||
            {};
          onClick && onClick();
        }}
      >
        {after.map((item, index) => (
          <Menu.Item
            key={item.key || item.id || item.name || index}
            disabled={item.disabled || selectedDrawerKey}
          >
            <a>{item.name}</a>
          </Menu.Item>
        ))}
      </Menu>
    );
    return (
      <div className="batch-operate-btns">
        {before.map((item, index) => (
          <>
            <Button
              key={index}
              type="text"
              size="small-s"
              {...item}
              icon={item.icon ? <i className={`iconfont icon-${item.icon}`} /> : null}
              disabled={item.disabled || selectedDrawerKey}
            />
            {index !== before.length - 1 ? <Divider type="vertical" /> : null}
          </>
        ))}
        {!isEmptyValue(after) && (
          <>
            <Divider type="vertical" />
            <Dropdown menu={menu} trigger={['click']}>
              <Button type="text" size="small-s">
                {intl.formatMessage({ id: 'MoreAction' })} <i className="iconfont icon-down_t" />
              </Button>
            </Dropdown>
          </>
        )}
      </div>
    );
  };

  const renderSearchBarButton = useMemo(() => {
    return otherOperateButtons.map((btnConfig) => {
      switch (btnConfig.optType) {
        case 'button':
          return (
            <AuthButton
              type="operate"
              size="middle-s"
              {...btnConfig}
              icon={
                btnConfig.icon ? <i className={`iconfont icon-${btnConfig.icon}`} /> : undefined
              }
              onClick={(e) => btnConfig.onClick(finalColumns)}
              name={btnConfig.text}
            />
          );
        case 'dropdown':
          return (
            <AuthDropdown
              options={btnConfig.options}
              disabled={btnConfig.disabled}
              className="other-operate-dropdown"
              showArrow={btnConfig.showArrow}
              dropDownclassName={btnConfig.dropDownclassName}
              btnProps={{
                type: 'operate',
                size: 'middle-s',
                ...btnConfig,
                options: undefined,
                icon: btnConfig.icon ? `icon-${btnConfig.icon}` : undefined,
                onClick: undefined,
                className: undefined,
                name: btnConfig.text,
              }}
            />
          );
      }
    });
  }, [otherOperateButtons]);

  return (
    <div className="table-common-wrapper" style={containerStyle}>
      <SearchBar
        sticky={stickySlot}
        slot={() => (
          <div className="slot-box">
            {slotRight}
            {otherOperateButtons.map((button, index) => {
              return (
                <Tooltip title={button.name} key={index} color="var(--vd-color-panel, #1c211f)">
                  {renderSearchBarButton}
                </Tooltip>
              );
            })}
          </div>
        )}
        searchOption={searchOption}
        params={params}
        paramsAlias={getParamsAlias()}
        untreatedParamKeys={untreatedParamKeys}
        onRefresh={() => handleRefresh()}
        onChange={handleChange}
      />
      <Table
        pagination={
          noPage === true
            ? false
            : {
                pageNumber: params.pageNumber,
                pageSize: params.pageSize,
                totalCount: total,
                size: 'small',
              }
        }
        rowKey={(row) => row.id}
        columns={finalColumns}
        loading={loading ? loading : false}
        dataSource={data}
        rowSelection={
          checkable
            ? {
                selectedRowKeys: selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => {
                  onChecked(selectedRowKeys, selectedRows);
                  setSelectedRowKeys(selectedRowKeys);
                },
                getCheckboxProps: (record) => {
                  const customProps = getCheckboxProps(record) || {};
                  return {
                    ...customProps,
                    disabled: customProps.disabled || !!selectedDrawerKey,
                  };
                },
                ...rowSelectionProps,
              }
            : null
        }
        rowClassName={(record) => {
          if (record.id === selectedDrawerKey) {
            return 'row-detail-selected';
          }
        }}
        showBatchAction={false}
        renderBatchActions={renderBatchActions}
        batchActionDependent={[selectedDrawerKey]}
        onRow={(record, index) => {
          return {
            onClick: () => onRowClick(record),
          };
        }}
        onChange={handleChange}
        {...other}
      />
    </div>
  );
};

const MyTable = memo(TableCommon);
export default MyTable;
