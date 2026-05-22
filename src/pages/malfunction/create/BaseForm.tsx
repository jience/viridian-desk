import { useEffect, useMemo, useState, useImperativeHandle, forwardRef } from 'react';
import './index.scss';
// UI
import {
  Button,
  Input,
  Checkbox,
  Radio,
  Select,
  Switch,
  InputNumber,
  DatePicker,
  Form,
} from '@/ui';
import { isEmptyValue } from '@/utils/value';
// other

/**
 * formFeatures demo
    {
        key: '',
        name: '',
        label: intl.formatMessage({ id: id }),
        canLabelClick: '', // 控制label是否可以点击触发内部表单项的点击事件效果，要触发则赋值name相同的值，若不希望点击触发则设置为空字符''
        rules: [{ required: true, message: '用户名不能为空' }],
        tooltip: '测试提示info',
        type: 'input',
        comProps: {
            prefix: '',// 前缀可以是icon | string
            suffix: '',// 后缀可以是icon | string
            addonBefore: '', // 前置组合表单项
            addonAfter: '', // 后置组合表单项
            placeholder: ''
        },
        impactHiddenAndOr: false, // impactHidden的控制条件是 && 还是 || 关系
        // 受到其他表单项影响联动操作是否隐藏，多项则以impactHiddenAndOr的逻辑配置判断条件关系
        impactHidden: [{
            key: "isPublic",// 影响当前项的其他表单项name
            hiddenRule: (val: any) => {return <Boolean>}, // val是key表单项的当前值 ,返回 true 隐藏当前项，false 显示当前项
        }]
        impactProps: [{
            key: 'executionCycleType', // 影响当前prop属性的其他表单项name
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

const BaseForm = (props: any, ref: any) => {
  /**
   * @author QL
   * @date 2022-09-13 10:42:13
   * @version V..
   * @description props
   */
  const { labelType, formFeatures, defaultFormValues, initialValues } = props;
  const withElementKey = (props: any, render: (key: any, props: any) => any) => {
    const { key, ...resProps } = props;
    return render(key, resProps);
  };

  /**
   * @author QL
   * @date 2022-09-13 10:41:36
   * @version V..
   * @description useState & memo & static state
   */
  const comList: { [key: string]: any } = {
    input: (props: any) => withElementKey(props, (key, resProps) => <Input key={key} {...resProps} />),
    'input.password': (props: any) =>
      withElementKey(props, (key, resProps) => <Input.Password key={key} {...resProps} />),
    'input.textArea': (props: any) =>
      withElementKey(props, (key, resProps) => <Input.TextArea key={key} {...resProps} />),
    inputNumber: (props: any) =>
      withElementKey(props, (key, resProps) => <InputNumber key={key} {...resProps} />),
    switch: (props: any) =>
      withElementKey(props, (key, resProps) => <Switch key={key} {...resProps} />),
    select: (props: any) =>
      withElementKey(props, (key, resProps) => <Select key={key} {...resProps} />),
    'picker.date': (props: any) =>
      withElementKey(props, (key, resProps) => <DatePicker key={key} {...resProps} />),
    'picker.time': (props: any) =>
      withElementKey(props, (key, resProps) => <DatePicker.TimePicker key={key} {...resProps} />),
    'checkbox.group': (props: any) =>
      withElementKey(props, (key, resProps) => <Checkbox.Group key={key} {...resProps} />),
    'radio.group': (props: any) =>
      withElementKey(props, (key, resProps) => <Radio.Group key={key} {...resProps} />),

    button: (props: any) =>
      withElementKey(props, (key, resProps) => <Button key={key} {...resProps} />),
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
    submitForm: form.validateFields,
    resetForm: () => {
      form.resetFields();
      setFormValuesCopy(initialValues);
    },
  }));

  // 常规含label样式设置
  const formLayout_right = useMemo(
    () =>
      ({
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
        labelAlign: 'right',
      }) as const,
    [],
  );

  // 常规含label样式设置
  const formLayout_left = useMemo(
    () =>
      ({
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
        labelAlign: 'left',
      }) as const,
    [],
  );

  // 无label样式设置
  const formNolabel = useMemo(
    () =>
      ({
        labelCol: { span: 0 },
        wrapperCol: { span: 240 },
        labelAlign: 'left',
      }) as const,
    [],
  );

  // 根据入参赋值表单label预制样式
  const labelStyle = useMemo(() => {
    switch (labelType) {
      case 'left':
        return formLayout_left;
      case 'right':
        return formLayout_right;
      case 'nolabel':
      default:
        return formNolabel;
    }
  }, [formLayout_left, formLayout_right, formNolabel, labelType]);

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
          impactHiddenRes =
            impactHiddenRes && impactItem.hiddenRule(formValuesCopy[impactItem.key]);
        } else {
          impactHiddenRes =
            impactHiddenRes || impactItem.hiddenRule(formValuesCopy[impactItem.key]);
        }
      });
    }
    return impactHiddenRes;
  };

  // 表单项获取是否有props属性值变化
  const getImpactProps = (itemFeature: any) => {
    const impactProps = itemFeature.impactProps;
    if (!isEmptyValue(impactProps)) {
      impactProps.forEach((impact: any) => {
        itemFeature.comProps[impact.propKey] = impact.impactAction(formValuesCopy[impact.key]);
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
        colon={false}
      >
        {FormFeatures.map((itemFeature: any) => {
          if (itemFeature.type === 'button') {
            return (
              <Form.Item
                key={itemFeature.key}
                name={itemFeature.name}
                label={itemFeature.label}
                rules={itemFeature.rules}
                tooltip={itemFeature.tooltip}
                className="buttonGroups"
                htmlFor={itemFeature.canLabelClick} // htmlFor 用作将 <label> 元素绑定到第一个具有与 for 属性值相同的 id 的可标记元素, 将该属性置空就取消了id绑定, 此处绑定的是name属性值
              >
                {chooseItemCom(itemFeature.type, {
                  key: itemFeature.key,
                  ...getImpactProps(itemFeature),
                })}
              </Form.Item>
            );
          } else if (itemFeature?.comProps?.addon_before || itemFeature?.comProps?.addon_after) {
            return (
              <>
                <Form.Item
                  key={itemFeature.key}
                  label={itemFeature.label}
                  name={itemFeature.name}
                  tooltip={itemFeature.tooltip}
                  hidden={getHiddenActive(itemFeature)}
                  required={itemFeature.rules.find((rule: any) => {
                    return rule.required;
                  })}
                  htmlFor={itemFeature.canLabelClick} // htmlFor 用作将 <label> 元素绑定到第一个具有与 for 属性值相同的 id 的可标记元素, 将该属性置空就取消了id绑定, 此处绑定的是name属性值
                >
                  <Input.Group compact>
                    {itemFeature.comProps.addon_before}
                    <Form.Item
                      name={itemFeature.name}
                      rules={getHiddenActive(itemFeature) ? [] : itemFeature.rules}
                      valuePropName={itemFeature.valuePropName}
                      className="noStyle-form-item"
                    >
                      {chooseItemCom(itemFeature.type, {
                        key: itemFeature.key,
                        ...getImpactProps(itemFeature),
                      })}
                    </Form.Item>
                    {itemFeature.comProps.addon_after}
                  </Input.Group>
                  {itemFeature.comProps.addon_tips ? (
                    <div className="item-Info">{itemFeature.comProps.addon_tips}</div>
                  ) : null}
                </Form.Item>
              </>
            );
          } else {
            return (
              <Form.Item
                key={itemFeature.key}
                name={itemFeature.name}
                label={itemFeature.label}
                rules={getHiddenActive(itemFeature) ? [] : itemFeature.rules}
                tooltip={itemFeature.tooltip}
                hidden={getHiddenActive(itemFeature)}
                valuePropName={itemFeature.valuePropName}
                htmlFor={itemFeature.canLabelClick} // htmlFor 用作将 <label> 元素绑定到第一个具有与 for 属性值相同的 id 的可标记元素, 将该属性置空就取消了id绑定, 此处绑定的是name属性值
              >
                {chooseItemCom(itemFeature.type, {
                  key: itemFeature.key,
                  ...getImpactProps(itemFeature),
                })}
              </Form.Item>
            );
          }
        })}
      </Form>
    </div>
  );
};

export default forwardRef(BaseForm);
