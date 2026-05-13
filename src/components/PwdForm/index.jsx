import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { Form, Input } from 'antd';
import { useIntl } from 'react-intl';
import Regex from '../../utils/regex';
import { getTerminalLoginConfig } from '@/services/public';
import useRequest from '@/hooks/useRequest';

function PwdForm(props, ref) {
  const intl = useIntl();
  const [strongPasswordSwitch, setStrongPasswordSwitch] = useState();
  /**
   * @author zhoujingjing
   * @description 表单实例
   */
  const [formIns] = Form.useForm();

  // 获取登录配置
  const { run: getTerminalLoginConfigRun } = useRequest(getTerminalLoginConfig, {
    manual: true,
    onSuccess: (res) => {
      setStrongPasswordSwitch(res?.terminalStrongPasswordSwitch);
    },
  });

  /**
   * @author zhoujingjing
   * @description 表单验证规则
   */
  const formRules = {
    oldPassword: [
      {
        required: true,
        message: intl.formatMessage(
          { id: 'FORM_ERROR_MSG' },
          { name: intl.formatMessage({ id: 'OLD_PASSWORD' }) },
        ),
      },
    ],
    newPassword: [
      {
        required: true,
        message: intl.formatMessage(
          { id: 'FORM_ERROR_MSG' },
          { name: intl.formatMessage({ id: 'NEW_PASSWORD' }) },
        ),
      },
      {
        pattern:
          strongPasswordSwitch === 'Disabled' ? Regex.isNotStrongPassword : Regex.isStrongPassword,
        message: intl.formatMessage({
          id: strongPasswordSwitch === 'Disabled' ? 'NotStrongPSW' : 'StrongPSW',
        }),
      },
      ({ getFieldValue }) => ({
        validator(rule, value) {
          if (!value) {
            return Promise.resolve();
          }
          // console.log(getFieldValue('oldPassword'))
          if (getFieldValue('oldPassword') !== value) {
            return Promise.resolve();
          }
          return Promise.reject(intl.formatMessage({ id: 'OLD_NEW_PASSWORD_NOTMATCH' }));
        },
      }),
    ],
    confirmPassword: [
      {
        required: true,
        message: intl.formatMessage(
          { id: 'FORM_ERROR_MSG' },
          { name: intl.formatMessage({ id: 'CONFIRM_PASSWORD' }) },
        ),
      },
      {
        pattern:
          strongPasswordSwitch === 'Disabled' ? Regex.isNotStrongPassword : Regex.isStrongPassword,
        message: intl.formatMessage({
          id: strongPasswordSwitch === 'Disabled' ? 'NotStrongPSW' : 'StrongPSW',
        }),
      },
      ({ getFieldValue }) => ({
        validator(rule, value) {
          if (!value) {
            return Promise.resolve();
          }
          if (getFieldValue('newPassword') === value) {
            return Promise.resolve();
          }
          return Promise.reject(intl.formatMessage({ id: 'TWICE_PASSWORD_NOTMATCH' }));
        },
      }),
    ],
  };

  /**
   * @author zhoujingjing
   * @description 向外暴露的方法(可方便父组件调用子组件方法)
   */
  useImperativeHandle(ref, () => ({
    validateFields: formIns.validateFields,
  }));

  useEffect(() => {
    // 获取密码规则
    getTerminalLoginConfigRun();
  }, []);

  useEffect(() => {
    formIns.setFieldsValue(props.formData);
  }, [props.formData]);

  return (
    <Form form={formIns} className="basic-form" labelCol={{ span: 5 }} labelAlign="left">
      <Form.Item
        name="oldPassword"
        label={intl.formatMessage({ id: 'OLD_PASSWORD' })}
        className="basic-form-item"
        rules={formRules['oldPassword']}
      >
        <Input
          type="password"
          placeholder={intl.formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: intl.formatMessage({ id: 'OLD_PASSWORD' }) },
          )}
        />
      </Form.Item>
      <Form.Item
        name="newPassword"
        label={intl.formatMessage({ id: 'NEW_PASSWORD' })}
        className="basic-form-item"
        rules={formRules['newPassword']}
      >
        <Input
          type="password"
          placeholder={intl.formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: intl.formatMessage({ id: 'NEW_PASSWORD' }) },
          )}
        />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        label={intl.formatMessage({ id: 'CONFIRM_PASSWORD' })}
        className="basic-form-item"
        rules={formRules['confirmPassword']}
      >
        <Input
          type="password"
          placeholder={intl.formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: intl.formatMessage({ id: 'CONFIRM_PASSWORD' }) },
          )}
        />
      </Form.Item>
    </Form>
  );
}

export default forwardRef(PwdForm);
