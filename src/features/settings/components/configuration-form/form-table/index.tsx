import { useEffect, useRef, useState, useContext } from 'react';

import { Button, Input, Switch, InputNumber, Table, ConfigProvider } from '@/shared/ui';
import IPv4Cidr from '../ipv4-cidr';
import IPv4 from '../ipv4';
import IPv6Cidr from '../ipv6-cidr';
import IPv6 from '../ipv6';
import cx from 'classnames';
import './index.scss';
const { ConfigContext } = ConfigProvider;

const FormTable = (props: any) => {
  const {
    value = '',
    defaultValue = '',
    disabled,
    loading,
    topLineSlot,
    showBatchAction = false,
    showPagination,
    showSizeChanger,
    columns,
    className,
    onChange,
    ...restProps
  } = props;

  /**
   * @author QL
   * @date 2023-11-08 14:58:55
   * @version V..
   * @description hooks
   */
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('formtable');
  const eventRef = useRef(null);

  /**
   * @author QL
   * @date 2023-11-08 14:59:04
   * @version V..
   * @description statics && states
   */
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
  });

  const [dataSource, setDataSource] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [_selectedRows, setSelectedRows] = useState<any[]>([]);

  /**
   * @author QL
   * @date 2023-11-08 14:59:17
   * @version V..
   * @description requests
   */

  /**
   * @author QL
   * @date 2023-11-08 15:08:24
   * @version V..
   * @description effects && memos
   */
  useEffect(() => {
    if (Array.isArray(value)) {
      setDataSource(value);
    } else if (Array.isArray(defaultValue)) {
      setDataSource(defaultValue);
    } else {
      setDataSource([]);
    }
  }, [value, defaultValue]);

  useEffect(() => {
    setPagination((lt) => {
      return {
        pageNumber: lt.pageNumber,
        pageSize: lt.pageSize,
        totalCount: dataSource.length,
      };
    });
  }, [dataSource]);

  /**
   * @author QL
   * @date 2022-09-13 10:41:36
   * @version V..
   * @param { object } comList 组件映射对象
   * @param { object } formValuesCopy 表单FieldValues 最新值
   * @description useState & memo & static state
   */
  const comList: { [key: string]: any } = {
    //ui baseComponent
    input: (props: any) => <Input {...props} />,
    'input.password': (props: any) => <Input.Password {...props} />,
    'input.textArea': (props: any) => <Input.TextArea {...props} />,
    'input.number': (props: any) => <InputNumber {...props} />,

    switch: (props: any) => <Switch {...props} />,

    //ui selfComponent
    'input.ipv4Cidr': (props: any) => <IPv4Cidr {...props} />, // IPv4输入框，包含port 输入
    'input.ipv4': (props: any) => <IPv4 {...props} />, // IPv4输入框，不包含port 输入
    'input.ipv6Cidr': (props: any) => <IPv6Cidr {...props} />, // IPv6输入框，包含port 输入
    'input.ipv6': (props: any) => <IPv6 {...props} />, // IPv6输入框，不包含port 输入
  };
  /**
   * @author QL
   * @date 2023-11-08 14:59:47
   * @version V..
   * @description function or compoments
   */
  const renderInlineEditType = (
    inputType: any,
    rowId: any,
    editKey: string,
    defaultValue: any,
    comProps: any,
  ) => {
    // inputType: 'input'、'input.password'、'input.number'、'switch'、'input.ipv4'、'input.ipv4Cidr'、'input.ipv6Cidr'
    return comList[inputType]({
      value: defaultValue,
      defaultValue: defaultValue,
      onChange: (val: any) => {
        const changeDataSource = dataSource.map((data: any) => {
          if (data.id == rowId) {
            data[editKey] = val;
          }
          return data;
        });
        setDataSource(changeDataSource);
        onChange?.(changeDataSource);
      },
      ...comProps,
    });
  };

  const getRealColumns = () => {
    const haveOptionColumn =
      columns.find((item: any) => ['operate', 'operation'].includes(item.key.toLowerCase())) ||
      false;

    const treatColumns = columns.map((column: any) => {
      if (column.renderType) {
        column.render = (val: any, row: any, _index: any) => {
          return renderInlineEditType(column.renderType, row.id, column.key, val, column.comProps);
        };
      }
      return column;
    });

    if (haveOptionColumn) {
      return treatColumns;
    } else {
      return [
        ...treatColumns,
        {
          key: 'operation',
          dataIndex: 'operation',
          title: '操作',
          width: 100,
          fixed: 'right',
          align: 'center',
          render: (_item: any, row: any) => (
            <Button
              type="link"
              name="移除"
              disabled={row.disable || disabled}
              onClick={() => {
                const changeDataSource =
                  dataSource.filter(
                    (data: any) => !(data?.id === row?.id) || !(data?.key === row?.key),
                  ) || [];
                setDataSource(changeDataSource);
                onChange?.(changeDataSource);
              }}
            />
          ),
        },
      ];
    }
  };

  // const renderBatchActions = () => {
  //   return (
  //     <>
  //       <Button
  //         type="link"
  //         name="移除"
  //         disabled={selectedRows.some((item) => item.disable) || disabled}
  //         onClick={() => {
  //           const changeDataSource =
  //             dataSource.filter(
  //               (data: any) =>
  //                 !selectedRows.find(
  //                   (row: any) => data?.id === row?.id || data?.key === row?.key
  //                 )
  //             ) || [];
  //           setSelectedRowKeys([]);
  //           setSelectedRows([]);
  //           setDataSource(changeDataSource);
  //           onChange?.(changeDataSource);
  //         }}
  //       />
  //     </>
  //   );
  // };

  const handleTableChange = (type: any, parameter: any) => {
    switch (type) {
      case 'pagination':
        // 前端自行处理列表数据的分页参数变化
        setPagination((lt) => {
          if (lt.pageSize === parameter.pageSize) {
            // 如果没有更改pageSize, 则赋值翻页pageNumber，并继承totalCount
            return {
              pageNumber: parameter.pageNumber,
              pageSize: lt.pageSize,
              totalCount: lt.totalCount,
            };
          } else {
            // 如果更改了pageSize, 则重置页码到第1页，赋值新的pageSize，并继承totalCount
            return {
              pageNumber: 1,
              pageSize: parameter.pageSize,
              totalCount: lt.totalCount,
            };
          }
        });
        break;
      default:
        // 其他参数变化待拓展
        break;
    }
  };

  return (
    <div
      className={cx(prefixCls, { [`${prefixCls}-disabled`]: disabled }, className)}
      ref={eventRef}
      {...restProps}
    >
      {topLineSlot}
      <Table
        // showBatchAction={showBatchAction}
        // renderBatchActions={renderBatchActions}
        rowSelection={
          showBatchAction && {
            onChange: (selectedRowKeys: any, selectedRows: any) => {
              setSelectedRows(selectedRows);
              setSelectedRowKeys(selectedRowKeys);
            },
            selectedRowKeys,
          }
        }
        pagination={
          showPagination && {
            ...pagination,
            showSizeChanger: showSizeChanger,
          }
        }
        columns={getRealColumns()}
        loading={loading || false}
        dataSource={dataSource}
        onChange={handleTableChange}
        sticky={{
          offsetHeader: 0,
          offsetScroll: 0,
          getContainer: () => document.querySelector('.ult-layout-content') as HTMLElement,
        }}
      />
    </div>
  );
};

export default FormTable;
