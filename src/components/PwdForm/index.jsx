import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { Form, Input } from '@/ui';
import { useMessageFormatter } from '@/utils/message-format';
import Regex from '../../utils/regex';
import { getTerminalLoginConfig } from '@/services/public';
import useRequest from '@/hooks/useRequest';
import './index.scss';

function PwdForm(props, ref) {
  const intl = useMessageFormatter();
  const [strongPasswordSwitch, setStrongPasswordSwitch] = useState();
  const [formIns] = Form.useForm();

  const { run: getTerminalLoginConfigRun } = useRequest(getTerminalLoginConfig, {
    manual: true,
    onSuccess: (res) => {
      setStrongPasswordSwitch(res?.terminalStrongPasswordSwitch);
    },
  });

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
        validator(_rule, value) {
          if (!value) {
            return Promise.resolve();
          }
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
        validator(_rule, value) {
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

  useImperativeHandle(ref, () => ({
    validateFields: formIns.validateFields,
  }));

  useEffect(() => {
    getTerminalLoginConfigRun();
  }, []);

  useEffect(() => {
    formIns.setFieldsValue(props.formData);
  }, [props.formData]);

  return (
    <Form form={formIns} className="pwd-form" layout="vertical" requiredMark={false}>
      <Form.Item
        name="oldPassword"
        label={intl.formatMessage({ id: 'OLD_PASSWORD' })}
        className="pwd-form__item"
        rules={formRules['oldPassword']}
      >
        <Input.Password
          autoComplete="current-password"
          placeholder={intl.formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: intl.formatMessage({ id: 'OLD_PASSWORD' }) },
          )}
        />
      </Form.Item>
      <Form.Item
        name="newPassword"
        label={intl.formatMessage({ id: 'NEW_PASSWORD' })}
        className="pwd-form__item"
        rules={formRules['newPassword']}
      >
        <Input.Password
          autoComplete="new-password"
          placeholder={intl.formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: intl.formatMessage({ id: 'NEW_PASSWORD' }) },
          )}
        />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        label={intl.formatMessage({ id: 'CONFIRM_PASSWORD' })}
        className="pwd-form__item"
        rules={formRules['confirmPassword']}
      >
        <Input.Password
          autoComplete="new-password"
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
