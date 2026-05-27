import { useEffect, useMemo, useState, useImperativeHandle, forwardRef } from 'react';
import './index.scss';

// UI
import {
  Button,
  Input,
  Space,
  Checkbox,
  Radio,
  Select,
  Switch,
  InputNumber,
  DatePicker,
  Form,
  Divider,
  TreeSelect,
} from '@/shared/ui';

import IPv4Cidr from './ipv4-cidr';
import IPv4 from './ipv4';
import IPv6Cidr from './ipv6-cidr';
import IPv6 from './ipv6';
import { IntegerStep, DecimalStep } from './slider-with-input-number';
import FormTable from './form-table';
import { isEmptyValue } from '@/utils/value';

/**
 * formFeatures demo
    {
        key: '',
        name: '',
        label: intl.formatMessage({ id: id }),
        canLabelClick: '', // 控制label是否可以点击触发内部表单项的点击事件效果，要触发则赋值name相同的值，若不希望点击触发则设置为空字符''
        required: true,
        rules: [{ required: true, message: '用户名不能为空' }],
        tooltip: '测试提示info',
        comType: 'input',
        optLine: '', // 操作行可以是其他功能组件或文本
        comProps: {
            prefix: '',// 前缀可以是icon | string
            suffix: '',// 后缀可以是icon | string
            addon_before: '', // 前置组合表单项
            addon_after: '', // 后置组合表单项
            placeholder: ''
        },
        impactHiddenAndOr: false, // impactHidden的控制条件是 && 还是 || 关系: true=&&; false=||
        impactHiddenResetField: true, // 触发当前项隐藏时，是否重置当前隐藏项对应的formField值
        // 受到其他表单项影响联动操作是否隐藏，多项则以impactHiddenAndOr的逻辑配置判断条件关系
        impactHidden: [{
            key: "isPublic",// 影响当前项的其他表单项name
            hiddenRule: (val: any) => {return <Boolean>}, // val是key表单项的当前值 ,返回 true 隐藏当前项，false 显示当前项
        }]
        // 控制当前项指定propKey的属性值，受key值表单项的影响变化
        impactProps: [{
            keys: ['executionCycleType'], // 影响当前prop属性的其他表单项name的列表
            propKey: 'min',// 当前项受影响的prop属性key
            impactAction: (val: any) => { // val是key表单项的当前值，返回值是propKey的影响值
                if (val === 'Minute') {
                    return 15
                } else {
                    return 1
                }
            }
        }]
    }
 */

const ConfigurationForm = (props: any, ref: any) => {
  /**
   * @author QL
   * @date 2022-09-13 10:42:13
   * @version V..
   * @description props
   */
  const {
    labelType,
    formFeatures,
    defaultFormValues,
    initialValues,
    enterSubmit = () => {},
  } = props;

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
    input: (props: any) => {
      const { key, ...resProps } = props;
      return <Input key={key} {...resProps} />;
    },
    'input.password': (props: any) => {
      const { key, ...resProps } = props;
      return <Input.Password key={key} {...resProps} />;
    },
    'input.textArea': (props: any) => {
      const { key, ...resProps } = props;
      return <Input.TextArea key={key} {...resProps} />;
    },
    'input.number': (props: any) => {
      const { key, ...resProps } = props;
      return <InputNumber key={key} {...resProps} />;
    },

    'picker.date': (props: any) => {
      const { key, ...resProps } = props;
      return <DatePicker key={key} {...resProps} />;
    },
    'picker.time': (props: any) => {
      const { key, ...resProps } = props;
      return <DatePicker.TimePicker key={key} {...resProps} />;
    },

    select: (props: any) => {
      const { key, ...resProps } = props;
      return <Select key={key} {...resProps} />;
    },
    'select.tree': (props: any) => {
      const { key, ...resProps } = props;
      return <TreeSelect key={key} {...resProps} />;
    },
    'select.customized': (props: any) => {
      const { key, ...resProps } = props;
      return (
        <Select key={key} {...resProps}>
          {props.customizedOptions}
        </Select>
      );
    },

    'checkbox.group': (props: any) => {
      const { key, ...resProps } = props;
      return <Checkbox.Group key={key} {...resProps} />;
    },
    'radio.group': (props: any) => {
      const { key, ...resProps } = props;
      return <Radio.Group key={key} {...resProps} />;
    },
    switch: (props: any) => {
      const { key, ...resProps } = props;
      return <Switch key={key} {...resProps} />;
    },

    button: (props: any) => {
      const { key, ...resProps } = props;
      return <Button key={key} {...resProps} />;
    },

    //ui selfComponent
    'input.ipv4Cidr': (props: any) => {
      const { key, ...resProps } = props;
      return <IPv4Cidr key={key} {...resProps} />;
    },
    'input.ipv4': (props: any) => {
      const { key, ...resProps } = props;
      return <IPv4 key={key} {...resProps} />;
    },
    'input.ipv6Cidr': (props: any) => {
      const { key, ...resProps } = props;
      return <IPv6Cidr key={key} {...resProps} />;
    },
    'input.ipv6': (props: any) => {
      const { key, ...resProps } = props;
      return <IPv6 key={key} {...resProps} />;
    },
    slider: (props: any) => {
      const { key, ...resProps } = props;
      return <IntegerStep key={key} {...resProps} />;
    },
    'slider.decimal': (props: any) => {
      const { key, ...resProps } = props;
      return <DecimalStep key={key} {...resProps} />;
    },
    formTable: (props: any) => {
      const { key, ...resProps } = props;
      return <FormTable key={key} {...resProps} />;
    },
  };

  const [formValuesCopy, setFormValuesCopy] = useState(defaultFormValues);

  const FormFeatures = useMemo(() => {
    return formFeatures;
  }, [formFeatures]);

  /**
   * @author QL
   * @date 2022-09-13 10:41:16
   * @version V..
   * @description hooks
   */
  const [form] = Form.useForm();

  // ref对外暴露组件方法
  useImperativeHandle(ref, () => ({
    runtimeGetFields: form.getFieldsValue,
    submitForm: form.validateFields,
    resetForm: () => {
      form.resetFields();
      setFormValuesCopy(initialValues);
    },
    runtimeSetFields: (fields: any) => {
      form.setFieldsValue(fields);
      setFormValuesCopy({ ...form.getFieldsValue(), ...fields });
    },
    getFormObj: () => {
      return form;
    },
  }));

  // 常规含label样式设置
  const formLayout_right = useMemo(
    () => ({
      labelCol: { span: 4 },
      labelAlign: 'right',
    }),
    [],
  );

  // 常规含label样式设置
  const formLayout_left = useMemo(
    () => ({
      labelCol: { span: 4 },
      labelAlign: 'left',
    }),
    [],
  );

  // 无label样式设置
  const formNolabel = useMemo(
    () => ({
      labelCol: { span: 0 },
      layout: 'vertical',
      labelAlign: 'right',
    }),
    [],
  );

  const defaultModalLayOut = useMemo(
    () => ({
      labelCol: { span: 6 },
      labelAlign: 'left',
    }),
    [],
  );

  // 根据入参赋值表单label预制样式
  const labelStyle = useMemo<any>(() => {
    switch (labelType) {
      case 'left':
        return formLayout_left;
      case 'right':
        return formLayout_right;
      case 'nolabel':
        return formNolabel;
      default:
        return defaultModalLayOut;
    }
  }, [defaultModalLayOut, formLayout_left, formLayout_right, formNolabel, labelType]);

  /**
   * @author QL
   * @date 2022-09-13 10:51:52
   * @version V..
   * @description metods
   */
  // 动态生成表单项不同类型的组件
  const chooseItemCom = (comType: string, comProps: any) => {
    return comList[comType]({ ...comProps });
  };

  // 将表单value赋值给useState状态管理动态更新表单控制状态
  const handleImpact = (_value: any, formValues: any) => {
    setFormValuesCopy(formValues);
  };

  // 表单项获取是否隐藏的条件判断方法
  const getHiddenActive = (itemFeature: any) => {
    let impactHiddenRes = itemFeature.impactHiddenAndOr;
    if (itemFeature.impactHidden && !isEmptyValue(itemFeature.impactHidden)) {
      itemFeature.impactHidden.forEach((impactItem: any) => {
        if (itemFeature.impactHiddenAndOr) {
          if (impactItem.key) {
            impactHiddenRes =
              impactHiddenRes && impactItem.hiddenRule(formValuesCopy[impactItem.key]);
          } else {
            impactHiddenRes = impactHiddenRes && impactItem.hiddenRule();
          }
        } else {
          if (impactItem.key) {
            impactHiddenRes =
              impactHiddenRes || impactItem.hiddenRule(formValuesCopy[impactItem.key]);
          } else {
            impactHiddenRes = impactHiddenRes || impactItem.hiddenRule();
          }
        }
      });
    }

    if (impactHiddenRes && itemFeature.impactHiddenResetField) {
      form.resetFields([itemFeature.key]); // 存在条件隐藏逻辑的组件，计算隐藏逻辑为true时重置自身的表单值

      if (!isEmptyValue(itemFeature.combinationComs)) {
        itemFeature.combinationComs.forEach((subItems: any) => {
          form.resetFields([subItems.key]); // 存在条件隐藏逻辑的组件，计算隐藏逻辑为true时重置自身的表单项的组合表单子项值
        });
      }
    }

    return impactHiddenRes;
  };

  // 表单项获取是否有props属性值变化
  const getImpactProps = (itemFeature: any) => {
    const impactProps = itemFeature.impactProps;
    if (!isEmptyValue(impactProps)) {
      impactProps.forEach((impact: any) => {
        if (!isEmptyValue(impact.keys)) {
          const impactActionParams: {
            [key: string]: any;
          } = {};
          impact.keys.forEach((key: any) => {
            impactActionParams[key] = formValuesCopy[key];
          });
          itemFeature.comProps[impact.propKey] = impact.impactAction(impactActionParams);
        } else {
          itemFeature.comProps[impact.propKey] = impact.impactAction();
        }
      });
    }

    return itemFeature.comProps;
  };

  /**
   * @author QL
   * @date 2022-09-13 15:10:58
   * @version V..
   * @description useEffect
   */
  useEffect(() => {
    form.setFieldsValue(defaultFormValues);
    setFormValuesCopy(defaultFormValues);
  }, [defaultFormValues, form]);

  return (
    <div className="baseForm">
      <Form
        key="baseFrom"
        form={form}
        {...labelStyle}
        initialValues={initialValues}
        onValuesChange={handleImpact}
        colon={false} // 取消非request项的label冒号
        onFinish={enterSubmit()}
      >
        {FormFeatures.map((itemFeature: any) => {
          if (itemFeature.comType === 'button') {
            // 表单内置按钮组
            return (
              <Form.Item
                key={itemFeature.key}
                name={itemFeature.name}
                label={itemFeature.label}
                rules={itemFeature.rules}
                tooltip={itemFeature.tooltip}
                required={
                  itemFeature.required || itemFeature.rules.some((rule: any) => rule.required)
                }
                className="buttonGroups"
                htmlFor={itemFeature.canLabelClick} // htmlFor 用作将 <label> 元素绑定到第一个具有与 for 属性值相同的 id 的可标记元素, 将该属性置空就取消了id绑定, 此处绑定的是name属性值
              >
                {chooseItemCom(itemFeature.comType, {
                  key: itemFeature.key,
                  ...getImpactProps(itemFeature),
                })}
              </Form.Item>
            );
          } else if (itemFeature.comType === 'combination') {
            // 表单项是个组合项
            return (
              <Form.Item
                key={itemFeature.key}
                label={itemFeature.label}
                rules={getHiddenActive(itemFeature) ? [] : itemFeature.rules}
                tooltip={itemFeature.tooltip}
                valuePropName={itemFeature.valuePropName}
                required={
                  itemFeature.required || itemFeature.rules.some((rule: any) => rule.required)
                }
                hidden={getHiddenActive(itemFeature)}
                htmlFor={itemFeature.canLabelClick} // htmlFor 用作将 <label> 元素绑定到第一个具有与 for 属性值相同的 id 的可标记元素, 将该属性置空就取消了id绑定, 此处绑定的是name属性值
              >
                <div className={`item-combination ${!itemFeature.separator && 'noSeparator'}`}>
                  {itemFeature.combinationComs.map((coms: any, index: any) => {
                    return (
                      <>
                        <Form.Item
                          className={`noStyle-form-item combination-sub-item`}
                          key={coms.key}
                          name={coms.name}
                          rules={getHiddenActive(itemFeature) ? [] : coms.rules}
                          tooltip={coms.tooltip}
                          type={coms.type}
                          required={coms.required || coms.rules.some((rule: any) => rule.required)}
                          hidden={getHiddenActive(itemFeature)}
                          valuePropName={coms.valuePropName}
                          htmlFor={coms.canLabelClick} // htmlFor 用作将 <label> 元素绑定到第一个具有与 for 属性值相同的 id 的可标记元素, 将该属性置空就取消了id绑定, 此处绑定的是name属性值
                          {...coms.itemProps}
                        >
                          {chooseItemCom(coms.comType, {
                            key: coms.key,
                            ...getImpactProps(coms),
                          })}
                        </Form.Item>
                        {index != itemFeature.combinationComs.length - 1 &&
                          itemFeature.separator && (
                            <div className="separator">
                              <Divider />
                            </div>
                          )}
                      </>
                    );
                  })}
                </div>
                {itemFeature?.comProps?.addon_tips ? (
                  <div className="item-Info">{itemFeature.comProps.addon_tips}</div>
                ) : null}
              </Form.Item>
            );
          } else if (itemFeature?.comProps?.addon_before || itemFeature?.comProps?.addon_after) {
            // 表单项是个前后插槽拼接的项，存在前后拼接插槽
            return (
              <Form.Item
                key={itemFeature.key}
                label={itemFeature.label}
                name={itemFeature.name}
                tooltip={itemFeature.tooltip}
                required={
                  itemFeature.required || itemFeature.rules.some((rule: any) => rule.required)
                }
                hidden={getHiddenActive(itemFeature)}
                htmlFor={itemFeature.canLabelClick} // htmlFor 用作将 <label> 元素绑定到第一个具有与 for 属性值相同的 id 的可标记元素, 将该属性置空就取消了id绑定, 此处绑定的是name属性值
              >
                <Space.Compact>
                  {itemFeature.comProps.addon_before}
                  <Form.Item
                    name={itemFeature.name}
                    rules={getHiddenActive(itemFeature) ? [] : itemFeature.rules}
                    valuePropName={itemFeature.valuePropName}
                    className="noStyle-form-item"
                    {...itemFeature.itemProps}
                  >
                    {chooseItemCom(itemFeature.comType, {
                      key: itemFeature.key,
                      ...getImpactProps(itemFeature),
                    })}
                  </Form.Item>
                  {itemFeature.comProps.addon_after}
                </Space.Compact>
                {itemFeature?.comProps?.addon_tips ? (
                  <div className="item-Info">{itemFeature.comProps.addon_tips}</div>
                ) : null}
              </Form.Item>
            );
          } else {
            // 常规表单项
            return (
              <Form.Item
                key={itemFeature.key}
                label={itemFeature.label}
                tooltip={itemFeature.tooltip}
                required={
                  itemFeature.required || itemFeature.rules.some((rule: any) => rule.required)
                }
                hidden={getHiddenActive(itemFeature)}
                htmlFor={itemFeature.canLabelClick} // htmlFor 用作将 <label> 元素绑定到第一个具有与 for 属性值相同的 id 的可标记元素, 将该属性置空就取消了id绑定, 此处绑定的是name属性值
              >
                <Space.Compact>
                  <Form.Item
                    name={itemFeature.name}
                    valuePropName={itemFeature.valuePropName}
                    rules={getHiddenActive(itemFeature) ? [] : itemFeature.rules}
                    className="noStyle-form-item-line"
                    {...itemFeature.itemProps}
                  >
                    {chooseItemCom(itemFeature.comType, {
                      key: itemFeature.key,
                      ...getImpactProps(itemFeature),
                    })}
                  </Form.Item>
                </Space.Compact>
                {itemFeature?.optLine && (
                  <div className="item-Info-line">{itemFeature?.optLine}</div>
                )}
              </Form.Item>
            );
          }
        })}
      </Form>
    </div>
  );
};

export default forwardRef(ConfigurationForm);
