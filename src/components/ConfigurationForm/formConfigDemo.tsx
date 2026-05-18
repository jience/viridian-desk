import { useMemo } from 'react';
// UI
import { Button } from '@/ui';

import { useIntl } from 'react-intl';

const useFormDemoConfig = (_props: any) => {
  const intl = useIntl();
  const { formatMessage } = intl;
  // 更改日志存储路径按钮
  const dirPathButtonAfter = useMemo(
    () => (
      <Button type="default" className="addon-after" name="更改" onClick={() => changeLogDir()} />
    ),
    [],
  );

  const changeLogDir = () => {};

  const formDemoConfigList = useMemo(() => {
    return [
      // 常规表数值输入框表单项
      {
        key: 'logSaveNum',
        name: 'logSaveNum',
        label: intl.formatMessage({ id: 'LogSaveNum' }),
        canLabelClick: '',
        rules: [
          {
            required: true,
            message: `请输入${intl.formatMessage({ id: 'LogSaveNum' })}`,
          },
        ],
        comType: 'input.number',
        comProps: {
          prefix: '',
          suffix: '个',
          addon_before: '',
          addo_after: '',
          placeholder: '',
          min: 10,
          max: 500,
          precision: 0,
        },
      },
      // 带后端插槽的文本输入框 如下是带路径选择按钮的文本输入框
      {
        key: 'dirPath',
        name: 'dirPath',
        label: intl.formatMessage({ id: 'DirPath' }),
        canLabelClick: '',
        rules: [
          {
            required: true,
            message: intl.formatMessage(
              { id: 'FORM_ERROR_SELECT' },
              { name: intl.formatMessage({ id: 'DirPath' }) },
            ),
          },
        ],
        comType: 'input',
        comProps: {
          prefix: '',
          suffix: '',
          addon_before: '',
          addon_after: dirPathButtonAfter,
          addon_tips: intl.formatMessage({ id: 'DirPathTips' }),
          placeholder: '',
        },
      },
      // 组合表单项配置对象 如下 两个数字输入框，控制数值范围
      {
        key: 'port',
        label: formatMessage({ id: 'Port' }),
        required: true,
        canLabelClick: '',
        comType: 'combination',
        separator: true,
        comProps: {},
        combinationComs: [
          {
            key: 'minPort',
            name: 'minPort',
            comType: 'input.number',
            rules: [{ required: true, message: '请输入最小端口号' }],
            required: true,
            comProps: {
              placeholder: '请输入1-65535的端口号',
              prefix: '',
              suffix: '',
              min: 1,
              max: 65535,
            },
            impactProps: [
              {
                keys: ['maxPort'],
                propKey: 'max',
                impactAction: (val: any) => {
                  return val.maxPort ?? 65535;
                },
              },
              {
                keys: ['maxPort'],
                propKey: 'placeholder',
                impactAction: (val: any) => {
                  return `请输入1-${val.maxPort ?? '65535'}的端口号`;
                },
              },
            ],
          },
          {
            key: 'maxPort',
            name: 'maxPort',
            comType: 'input.number',
            rules: [{ required: true, message: '请输入最大端口号' }],
            required: true,
            comProps: {
              placeholder: '请输入1-65535的端口号',
              prefix: '',
              suffix: '',
              min: 1,
              max: 65535,
            },
            impactProps: [
              {
                keys: ['minPort'],
                propKey: 'min',
                impactAction: (val: any) => {
                  return val.minPort ?? 1;
                },
              },
              {
                keys: ['minPort'],
                propKey: 'placeholder',
                impactAction: (val: any) => {
                  return `请输入${val.minPort ?? '1'}-65535的端口号`;
                },
              },
            ],
          },
        ],
        impactHiddenAndOr: false,
        impactHiddenResetField: true, // 触发当前项隐藏时，是否重置当前隐藏项对应的formField值
        impactHidden: [
          {
            key: 'protocol',
            hiddenRule: (val: any) => {
              return !['TCP', 'UDP'].includes(val);
            },
          },
        ],
      },
    ];
  }, [dirPathButtonAfter, formatMessage, intl]);

  return {
    formDemoConfigList,
  };
};

export default useFormDemoConfig;
