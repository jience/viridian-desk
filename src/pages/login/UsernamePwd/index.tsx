import { Form, Input, type FormInstance } from '@/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { LoginFormType } from '../types';
import { usePreventEnterKeyLongPress } from './usePreventEnterKeyLongPress';

export interface UsernamePwdProps {
  formIns: FormInstance<LoginFormType>;
}

export const UsernamePwd = (_props: UsernamePwdProps) => {
  const { t } = useTranslation();

  const { onKeyDown, onKeyUp } = usePreventEnterKeyLongPress();

  const formRules = useMemo(
    () => ({
      loginName: [
        {
          required: true,
          message: t('login_page.username_placeholder'),
        },
        // 最小长度为2
        {
          min: 2,
          message: t('login_page.username_min_length_tip'),
        },
      ],
      password: [
        {
          required: true,
          message: t('login_page.password_placeholder'),
        },
      ],
    }),
    [t],
  );

  return (
    <>
      <Form.Item
        name="loginName"
        className="basic-form-item username-input-group"
        rules={formRules['loginName']}
      >
        <Input
          autoComplete="off"
          maxLength={60}
          placeholder={t('login_page.username_placeholder')}
          prefix={<i className="iconfont icon-user form-prefix-icon" />}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        />
      </Form.Item>
      <Form.Item name="password" className="basic-form-item" rules={formRules['password']}>
        <Input.Password
          placeholder={t('login_page.password_placeholder')}
          prefix={<i className="iconfont icon-lock form-prefix-icon" />}
          iconRender={(visible) =>
            visible ? (
              <span>
                <i className="iconfont icon-visible"></i>
              </span>
            ) : (
              <span>
                <i className="iconfont icon-invisible"></i>
              </span>
            )
          }
        />
      </Form.Item>
    </>
  );
};
