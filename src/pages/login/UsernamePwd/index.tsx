import { useAppDispatch, useAppSelector } from '@/store';
import {
  clearLoginHistory,
  deleteLoginEntry,
  selectCurrentLoginType,
  selectLastLoginEntry,
  selectLoginHistory,
} from '@/store/feature/app';
import { AutoComplete, Form, Input, type FormInstance } from 'antd';
import { debounce } from 'lodash-es';
import { useEffect, useMemo, useState, type MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import type { LoginFormType } from '../types';
import { usePreventEnterKeyLongPress } from './usePreventEnterKeyLongPress';

export interface UsernamePwdProps {
  formIns: FormInstance<LoginFormType>;
}

export const UsernamePwd = (props: UsernamePwdProps) => {
  const { formIns } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const currentLoginType = useAppSelector(selectCurrentLoginType);
  const loginHistory = useAppSelector(selectLoginHistory);
  const lastLoginInfo = useAppSelector(selectLastLoginEntry);

  const { onKeyDown, onKeyUp } = usePreventEnterKeyLongPress();

  const [usernameSearch, setUsernameSearch] = useState('');

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

  /** [记住账号] AutoComplete 输入回调  */
  const onUsernameSearch = useMemo(
    () =>
      debounce((search: string) => {
        setUsernameSearch(search);
      }, 300),
    [],
  );

  /** [记住账号] 用户名 AutoComplete 下拉选择触发 */
  const onUsernameSelect = (_username: string) => {
    //TODO 查询对应的登录Token,看看是否需要隐藏password表单
  };

  const handleRemoveAccountPwd = async (loginName: string) => {
    await dispatch(deleteLoginEntry(loginName));
    const currentLoginName = formIns?.getFieldValue('loginName');
    if (currentLoginName === loginName) {
      formIns?.setFieldsValue({
        password: '',
        loginName: '',
      });
    }
  };

  const handleClearAllHistory: MouseEventHandler<HTMLSpanElement> = async (e) => {
    e.stopPropagation();
    await dispatch(clearLoginHistory());
    formIns?.setFieldsValue({
      password: '',
      loginName: '',
    });
  };

  /** [记住账号] 渲染记住账号 Select Option 选项 */
  const renderUsernameOption = (title: string) => (
    <div className="username-option-title">
      <span className="name">{title}</span>
      <span
        className="remove"
        onClick={(e) => {
          e.stopPropagation();
          handleRemoveAccountPwd(title);
        }}
      >
        <i className="iconfont icon-delete2" />
      </span>
    </div>
  );

  const usernameOptions = useMemo(() => {
    const list = !usernameSearch
      ? loginHistory
      : loginHistory.filter((item) => {
          return item.username.includes(usernameSearch);
        });

    const options = list.map((item) => {
      return {
        label: renderUsernameOption(item.username),
        value: item.username,
        key: item.username,
      };
    });
    if (options.length)
      options.push({
        label: (
          <span className="username-clear-all" onClick={handleClearAllHistory}>
            {t('login_page.clear_account')}
          </span>
        ),
        value: '',
        key: '',
      });
    return options;
  }, [loginHistory, usernameSearch]);

  useEffect(() => {
    if (!formIns) return;
    if (currentLoginType === lastLoginInfo?.loginType) {
      const loginName = lastLoginInfo?.username;
      const resFormData: Partial<LoginFormType> = {
        loginName: loginName,
      };
      formIns.setFieldsValue(resFormData);
    } else {
      formIns.resetFields(['loginName', 'password']);
    }
  }, [formIns, currentLoginType, lastLoginInfo]);

  return (
    <>
      <Form.Item
        name="loginName"
        className="basic-form-item username-input-group"
        rules={formRules['loginName']}
      >
        <AutoComplete
          getPopupContainer={(triggerNode: any) => triggerNode.parentElement}
          options={usernameOptions}
          onSelect={onUsernameSelect}
          showSearch={{ onSearch: onUsernameSearch }}
          maxLength={60}
        >
          <Input
            placeholder={t('login_page.username_placeholder')}
            prefix={<i className="iconfont icon-user form-prefix-icon" />}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
          />
        </AutoComplete>
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
