import React, { useRef, useState } from 'react';
import { Button, Input } from 'antd';
import { useIntl } from 'react-intl';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { Scrollbars } from 'react-custom-scrollbars';
import { Tag } from 'antd';
import './index.scss';
import { cloneDeep, isArray, isEmpty, isFunction, isNil } from 'lodash-es';

export interface SearchBarProps {
  /**
   * @description       置顶元素, 最左侧
   * @default           null
   */
  sticky?: React.ReactNode;
  /**
   * @description       插槽, 自定义右侧
   * @default           () => {}
   */
  slot?: () => React.ReactNode;
  /**
   * @description       插槽, 自定义左侧
   * @default           () => {}
   */
  slotLeft?: () => React.ReactNode;
  /**
   * @description       需要展示的参数对象
   * @default           {}
   */
  params?: any;
  /**
   * @description       参数别名，用于展示参数的国际化翻译
   * @default           {}
   */
  paramsAlias?: {
    [key: string]: {
      title: string;
      value?: string;
    };
  };
  /**
   * @description       需要过滤的参数key值数组, 不展示也不处理
   * @default           ['pageNumber', 'pageSize', 'sortOrder', 'sortKey', 'logicalZoneId']
   */
  untreatedParamKeys?: Array<string>;
  /**
   * @description       搜索对象
   * @default           {}
   */
  searchOption?: any;
  /**
   * @description       刷新回调
   * @default           {}
   */
  onRefresh?: () => void;
  /**
   * @description       改变回调
   * @default           {}
   */
  onChange?: (type: 'deleteAll' | 'search' | 'delete', target: any) => void;
  className?: string;
  [propName: string]: any;
}

const SearchBar: React.FC<SearchBarProps> = ({
  sticky = null,
  slot = null,
  slotLeft = null,
  params = {},
  paramsAlias = {},
  searchOption = {},
  untreatedParamKeys = ['pageNumber', 'pageSize', 'sortOrder', 'sortKey', 'logicalZoneId'],
  onRefresh,
  onChange,
  className,
  ...resProps
}) => {
  const [searchValue, setSearchValue] = useState('');
  const isInputing = useRef(false);
  const { formatMessage } = useIntl();

  const handleDelete = () => {
    const target = cloneDeep(params);
    Object.keys(target)
      .filter((item) => !untreatedParamKeys.includes(item))
      .map((item) => {
        target[item] = '';
      });
    if (onChange) onChange('deleteAll', target);
  };

  const handleChangeSearch = (v: any) => {
    setSearchValue(v.target.value);
  };

  const handleSearch = () => {
    if (isInputing.current) {
      return;
    }

    if (isEmpty(searchOption)) {
      return;
    }
    const target = cloneDeep(params);
    target[searchOption.key] = searchValue?.trim();
    if (onChange) onChange('search', target);
    setSearchValue('');
  };

  const handleCloseTag = (removeKey = '') => {
    const target = cloneDeep(params);
    target[removeKey] = '';
    if (onChange) onChange('delete', target);
  };

  const renderParams = (item: any) => {
    if (isArray(item)) {
      return item.join('/');
    }
    return `${item}`;
  };

  const renderTags = () => {
    const { disabled = false } = searchOption || {};
    const tags = Object.keys(params)
      .filter((item) => {
        // 撇除pagination、sort参数。他们不需要展示
        return !untreatedParamKeys.includes(item) && !isNil(params[item]) && params[item] !== '';
      })
      .map((item, _index) => {
        const result = isEmpty(paramsAlias[item]?.value)
          ? renderParams(params[item])
          : `${paramsAlias[item]?.value}`;
        return (
          <Tag
            key={item}
            closable={!disabled}
            closeIcon={<i className="iconfont icon-error" />}
            onClose={() => handleCloseTag(item)}
          >
            <span className="tag-title">
              {isEmpty(paramsAlias[item]?.title) ? `${item}` : `${paramsAlias[item]?.title}`}
            </span>
            <span className="tag-value" title={result}>
              {result}
            </span>
          </Tag>
        );
      });

    return (
      <Scrollbars autoHeight style={{ flex: 1 }}>
        <div className="antd-search-bar-tag-container">
          {tags}
          {!disabled && !isEmpty(tags) ? (
            <DeleteOutlined
              // type="icon-delete"
              className="antd-search-bar-tag-delete"
              onClick={handleDelete}
            />
          ) : null}
        </div>
      </Scrollbars>
    );
  };

  const renderSlot = () => {
    if (!isFunction(slot)) {
      return;
    }
    return <div className="antd-search-bar-slot-container">{slot()}</div>;
  };

  const renderSlotLeft = () => {
    if (!isFunction(slotLeft)) {
      return;
    }
    return <div className="antd-search-bar-slot-left-container">{slotLeft()}</div>;
  };

  const renderRefresh = () => {
    return (
      onRefresh && (
        <Button
          // size="middle-s"
          // type="operate"
          icon={<i className="iconfont icon-refresh" />}
          onClick={onRefresh}
        />
      )
    );
  };
  const handleCompsition = (event: any) => {
    const type = event.type;

    if (type === 'compositionend') {
      // 输入法结束输入 safari这个事件比onPressEnter更快，延迟触发
      setTimeout(() => {
        isInputing.current = false;
      }, 50);
    } else {
      // 输入法正在输入
      isInputing.current = true;
    }
  };
  const renderSearch = () => {
    return (
      !isEmpty(searchOption) && (
        <Input
          placeholder={`${formatMessage({ id: 'PleaseInput' })}${searchOption.title}`}
          suffix={
            <SearchOutlined
              style={{
                fontSize: '12px',
                cursor: 'pointer',
                display: searchOption.disabled ? 'none' : 'flex',
              }}
              onClick={handleSearch}
            />
          }
          value={searchValue}
          onChange={handleChangeSearch}
          onCompositionStart={handleCompsition}
          onCompositionUpdate={handleCompsition}
          onCompositionEnd={handleCompsition}
          onPressEnter={handleSearch}
          disabled={!!searchOption.disabled}
        />
      )
    );
  };

  return (
    <div className={`antd-table-search-bar ${className}`} {...resProps}>
      {renderRefresh()}
      {sticky}
      {renderSearch()}
      {renderSlotLeft()}
      {renderTags()}
      {renderSlot()}
    </div>
  );
};

export default SearchBar;
