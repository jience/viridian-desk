import { useEffect, useState, useRef, useCallback } from 'react';
import { useIntl } from 'react-intl';
import Regex from '@/utils/regex';
import { Form, Input, Button, Modal } from 'antd';
import { formatTel } from '@/utils/utils';
import './index.scss';

const FindPasswordModal = (props: any) => {
  const intl = useIntl();
  const { formatMessage } = intl;
  const { visible, setVisible } = props;

  const [curentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [_errorTips, _setErrorTips] = useState('');
  const [strongPasswordSwitch, _setStrongPasswordSwitch] = useState<any>();
  const [formData, _setFormData] = useState<any>(null);
  //  验证码发送按钮控制
  const [sent, setSent] = useState(false);
  const [number, setNumber] = useState(0);
  const timerID = useRef<any>(null);
  const [_visitorId, _setVisitorId] = useState('');
  const formRules = {
    verifyCode: [
      {
        required: true,
        message: intl.formatMessage(
          { id: 'FORM_ERROR_MSG' },
          { name: intl.formatMessage({ id: 'VERIFY_CODE' }) },
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
      (p: any) => ({
        validator(_rule: any, value: any) {
          const { getFieldValue } = p;
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
   * 校验用户名必填后，进入下一步
   */
  const checkUserAndphone = useCallback(() => {
    form.validateFields().then((_res: any) => {
      // const { loginName } = res;
      // 调用接口校验用户名并获取手机号
      // window.ipcRenderer.send(userAjax.CheckTerminalUser, {
      //   loginName: loginName,
      //   authType: "LocalAuth",
      // })
      // userAjax.checkTerminalUser({
      //   success: (res: any) => {
      //     const { phone, id } = res.data;
      //     setFormData({
      //       loginName,
      //       phone
      //     })
      //     setCurrentStep(1)
      //   },
      //   error: (err: any) => {
      //     //console.log(err)
      //   }
      // })
    });
  }, [form]);

  /**
   * 校验验证码是否正确
   */
  const submitVerifyCode = useCallback(() => {
    form.validateFields().then((_res: any) => {
      // const { verifyCode } = res;
      // 根据当前用户、手机号 、验证码 验证是否输入正确
      // window.ipcRenderer.send(userAjax.CheckSmsCaptcha, {
      //   phone: formData?.phone,
      //   loginName: formData?.loginName,
      //   smsCaptcha: verifyCode,
      //   authType: 'LocalAuth',
      // });
      // userAjax.checkSmsCaptcha({
      //   success: (res: any) => {
      //     //  在这里获取返回的用户ID
      //     setVisitorId(res?.data?.id)
      //     setCurrentStep(2)
      //   },
      // });
    });
  }, [form]);

  // 最后提交新密码
  const sumitNewPwd = useCallback(() => {
    form.validateFields().then((_res: any) => {});
  }, [form]);

  const renderTitle = useCallback(() => {
    let elem: any = null;
    elem = (
      <div className="find-pwd-title">
        <div className={`title-content title-content-one-${curentStep}`}>
          <div className="status">
            <div className="status-inside"></div>
            <i className="iconfont icon-correct-s status-ok" />
          </div>
          <span>请输入账号</span>
        </div>
        <div className={`divider divider-${curentStep}`}></div>
        <div className={`title-content title-content-two-${curentStep}`}>
          <div className="status">
            <div className="status-inside"></div>
            <i className="iconfont icon-correct-s status-ok" />
          </div>
          <span>安全验证</span>
        </div>
        <div className={`divider divider2-${curentStep}`}></div>
        <div className={`title-content title-content-three-${curentStep}`}>
          <div className="status">
            <div className="status-inside"></div>
          </div>
          <span>修改密码</span>
        </div>
      </div>
    );
    return elem;
  }, [curentStep]);

  const cancelModal = useCallback(() => {
    setVisible(false);
    setCurrentStep(0);
    form.resetFields();
  }, [setVisible, form]);

  const renderFooter = useCallback(() => {
    let elem: any = null;
    if (curentStep == 0) {
      elem = (
        <div className="self-footer">
          <Button onClick={() => cancelModal()}>{formatMessage({ id: 'CANCEL' })}</Button>
          <Button
            onClick={() => {
              checkUserAndphone();
            }}
            type="primary"
          >
            {formatMessage({ id: 'NextStep' })}
          </Button>
        </div>
      );
    }
    if (curentStep == 1) {
      elem = (
        <div className="self-footer">
          <Button onClick={() => setCurrentStep(0)}>{formatMessage({ id: 'Previous' })}</Button>
          <Button
            onClick={() => {
              submitVerifyCode();
            }}
            type="primary"
          >
            {formatMessage({ id: 'NextStep' })}
          </Button>
        </div>
      );
    }
    if (curentStep == 2) {
      elem = (
        <div className="self-footer">
          <Button onClick={() => setCurrentStep(1)}>{formatMessage({ id: 'Previous' })}</Button>
          <Button onClick={() => sumitNewPwd()} type="primary">
            {formatMessage({ id: 'SURE' })}
          </Button>
        </div>
      );
    }
    return elem;
  }, [cancelModal, checkUserAndphone, curentStep, formatMessage, submitVerifyCode, sumitNewPwd]);

  useEffect(() => {
    renderFooter();
    renderTitle();
  }, [curentStep, renderFooter, renderTitle]);

  useEffect(() => {
    // window.ipcRenderer.send(resourceAjax.GetLoginConfig);
    // // 监听请求资源列表响应
    // resourceAjax.getLoginConfigRes({
    //   success: (res: any) => {
    //     setStrongPasswordSwitch(
    //       res?.data.terminalStrongPasswordSwitch,
    //     );
    //   },
    // });
  }, []);

  /**
   * 发送验证码
   * @returns
   */
  const send = () => {
    if (sent) return;
    // 根据当前用户、手机号 发送验证码
    // window.ipcRenderer.send(userAjax.SendSmsCaptchaToPhone, {
    //   phone: formData?.phone,
    //   loginName: formData?.loginName,
    //   authType: 'LocalAuth'
    // });
    // userAjax.sendSmsCaptchaToPhone({
    //   success: (res: any) => {
    //     if (number != 0) {
    //       return
    //     } else {
    //       setNumber(60)
    //       setSent(true)
    //     }
    //   },
    // });
  };

  useEffect(() => {
    if (sent && number != 0) {
      timerID.current = setInterval(() => {
        setNumber((n) => {
          if (n == 1) {
            setSent(false);
            clearInterval(timerID.current);
            setNumber(0);
          }
          return n - 1;
        });
      }, 1000);
    }
    return () => {
      // 组件销毁时，清除定时器
      clearInterval(timerID.current);
    };
  }, [number, sent]);

  return (
    <Modal
      open={visible}
      onCancel={() => cancelModal()}
      footer={renderFooter()}
      keyboard={false}
      className="find-pwd-modal"
      // alertSlots={[
      //   errorTips && {
      //     type: 'error',
      //     message: errorTips,
      //   },
      //   curentStep == 1 && {
      //     type: 'warning',
      //     message: formatMessage(
      //       { id: 'ValidPhoneTip' },
      //       { phone: formatTel(formData?.phone) }
      //     ),
      //   },
      // ]}
      centered
      destroyOnHidden={true}
      title={renderTitle()}
    >
      <Form layout="vertical" form={form}>
        {curentStep == 0 && (
          <div>
            <Form.Item
              name="loginName"
              label={formatMessage({ id: 'USERNAME' })}
              rules={[
                {
                  required: true,
                  message: formatMessage(
                    { id: 'FORM_ERROR_MSG' },
                    { name: formatMessage({ id: 'USERNAME' }) },
                  ),
                },
              ]}
            >
              <Input
                placeholder={formatMessage(
                  { id: 'FORM_ERROR_MSG' },
                  { name: formatMessage({ id: 'USERNAME' }) },
                )}
              />
            </Form.Item>
            {/* <Form.Item name='phone' label={formatMessage({ id: 'ResetPasswordForPhone' })}
                rules={[
                  {
                    required: true, message: ''
                  }
                ]}
              >
                <Input.Group compact>
                  <Select style={{ width: '30%' }} defaultValue="+86">
                    <Option value="+86">+86</Option>
                  </Select>
                  <Form.Item
                    style={{ width: '70%' }}
                    name='phone'
                    rules={[
                      { required: true, message: formatMessage({ id: 'FORM_ERROR_MSG' }, { name: formatMessage({ id: 'UserPhone' }) }) },
                      {
                        pattern: Regex.isMobile,
                        message: formatMessage({ id: 'ValidPhoneError' })
                      }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Input.Group>
              </Form.Item> */}
          </div>
        )}
        {curentStep == 1 && (
          <p className="send-title">
            {formatMessage({ id: 'SendPhoneLable' }, { phone: formatTel(formData?.phone) })}
          </p>
        )}
        {curentStep == 1 && (
          <div className="find-pwd-code-row">
            <Form.Item
              name="verifyCode"
              rules={formRules['verifyCode']}
              className="find-pwd-code-item"
            >
              <Input
                placeholder={intl.formatMessage(
                  { id: 'FORM_ERROR_MSG' },
                  {
                    name: intl.formatMessage({
                      id: 'INPUT_TELEPHONE_VERIFY_CODE',
                    }),
                  },
                )}
              />
            </Form.Item>
            <Button type="default" onClick={() => send()}>
              {sent ? `${number}s 后重新获取` : '获取验证码'}
            </Button>
          </div>
        )}
        {curentStep == 2 && (
          <div>
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
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default FindPasswordModal;
