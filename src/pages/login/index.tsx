import logoBlue from '@/assets/images/logoBlue1.png';
import { LoginAuthType } from '@/native/interfaces/login_history';
import { useAppSelector } from '@/store';
import { selectCurrentLoginType } from '@/store/feature/app';
import {
  selectLoginTypes,
  selectSmsResetPasswordSwitch,
  selectTerminalRememberPasswordSwitch,
} from '@/store/feature/client';
import { selectConnected, selectNetwork } from '@/store/feature/gateway';
import { QrcodeOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import Footer from '../../components/Footer';
import FindPasswordModal from './component/FindPasswordModal';
import LoginWayChange from './component/LoginWayChange';
import { useLoginHandler } from './hooks/useLoginHandler';
import './index.scss';
import { useLoginWayData } from './initData';
import { LoginFormItems } from './LoginFormItems';
import { OneTimePwdModal } from './OneTimePasswordModal';
import { OrgScanLoginModal, type OrgScanLoginModalRef } from './OrgScanLoginModal';
import { SendMsgModal } from './SendMsgModal';
import { SliderVerifyModal } from './SliderVerifyModal';
import type { LoginFormType } from './types';

const Login = () => {
  const { formatMessage } = useIntl();
  const [form] = Form.useForm<LoginFormType>();

  const connected = useAppSelector(selectConnected);
  const network = useAppSelector(selectNetwork);
  const terminalRememberPasswordSwitch = useAppSelector(selectTerminalRememberPasswordSwitch);
  const loginTypes = useAppSelector(selectLoginTypes);
  const smsResetPasswordSwitch = useAppSelector(selectSmsResetPasswordSwitch);
  const currentLoginWay = useAppSelector(selectCurrentLoginType);

  const orgScanLoginModalRef = useRef<OrgScanLoginModalRef>(null);

  const { loginWayKv } = useLoginWayData();
  const {
    userLogin,
    loginLoading,
    isLocalPhoneLogin,
    setIsLocalPhoneLogin,
    sliderVerifyModalRef,
    sendMsgModalRef,
    oneTimePwdModalRef,
    autoLoginChecked,
    setAutoLoginChecked,
    rememberMeChecked,
    setRememberMeChecked,
  } = useLoginHandler();

  // 扫码登录
  const [canScan, _setCanScan] = useState(false);
  const [threeChannel, setThreeChannel] = useState('');
  // 切换登录方式
  const [changeLoginWayVisible, setChangeLoginWayVisible] = useState(false);
  // 找回密码
  const [findPwdVisible, setFindPwdVisible] = useState(false);

  const onLoginWayChange = () => {
    setChangeLoginWayVisible(false);
  };

  const handleSubmit = async () => {
    const res = await form.validateFields();
    await userLogin(res);
  };

  const handleChangeLocalLoginType = () => {
    setIsLocalPhoneLogin(!isLocalPhoneLogin);
  };

  const handleChangeRememberMe = (e: any) => {
    const checked = !!e.target.checked;
    setRememberMeChecked(checked);
  };

  const handleChangeAuto = (e: any) => {
    setAutoLoginChecked(!!e.target.checked);
  };

  useEffect(() => {
    // 监听回车键，按下回车键登录
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };
    // 监听回车键
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSubmit]);

  return (
    <div className="login-wrapper">
      <div></div>
      {/* 登录内容 - start */}
      <div className="login-form-content">
        {/* LOGO start */}
        <div className="login-logo-content">
          <img
            src={logoBlue}
            className="login-logo"
            alt="ArcherDT"
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
        <div className="form-content">
          {changeLoginWayVisible && <LoginWayChange onChange={onLoginWayChange} />}
          {!changeLoginWayVisible && (
            <>
              <div className="cur-login-way">
                <div
                  className="cen"
                  onClick={() => {
                    if (loginTypes && loginTypes.length > 1) {
                      setChangeLoginWayVisible(true);
                    }
                  }}
                >
                  {loginTypes && loginTypes.length > 1 && (
                    <div className="span icons">
                      <i className="iconfont icon-left"></i>
                      <i className="iconfont icon-minus"></i>
                    </div>
                  )}
                  <p>{loginWayKv[currentLoginWay]}</p>
                </div>
              </div>
              <Form form={form} layout="vertical" className="basic-form" requiredMark={false}>
                <LoginFormItems
                  formIns={form}
                  isLocalPhoneLogin={isLocalPhoneLogin}
                  setThreeChannel={setThreeChannel}
                />
              </Form>
              {/* 本地用户 手机号码登录和用户密码登录切换 和 找回密码 - start */}
              {currentLoginWay == LoginAuthType.LOCAL ? (
                <div className="form-other-option local-option">
                  {/* 手机号码登录和用户密码登录切换 */}
                  <span onClick={() => handleChangeLocalLoginType()}>
                    <i className="iconfont icon-icon_phone"></i>
                    {formatMessage({
                      id: !isLocalPhoneLogin ? 'loginByphone' : 'loginByUser',
                    })}
                  </span>
                  {/* 找回密码 */}
                  {smsResetPasswordSwitch === 'Enabled' && (
                    <span
                      className={`${!connected || !network ? 'diabledType' : ''}`}
                      onClick={() => {
                        if (!connected || !network) return;
                        setFindPwdVisible(true);
                      }}
                    >
                      {/* <Icon type='icon-c_question-o' className='forget-icon' /> */}
                      {formatMessage({ id: 'ForgetPassword' })}
                    </span>
                  )}
                </div>
              ) : (
                <div className="form-other-option empty"></div>
              )}
              {/* 本地用户 手机号码登录和用户密码登录切换 和 找回密码 - end */}
              {/* 登录按钮 */}
              <div className="login-form-submit">
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={handleSubmit}
                  size="large"
                  block
                  disabled={!connected || !network}
                  loading={loginLoading}
                >
                  {formatMessage({
                    id: loginLoading ? 'LOGING' : 'LOGIN',
                  })}
                </Button>
              </div>

              {/* 记住密码 和 自动登录 */}
              <div className="remember-auto">
                {/* 扫码登录 -start */}
                {currentLoginWay == LoginAuthType.CORP && (
                  <div>
                    <QrcodeOutlined
                      className="qr-code-icon"
                      style={{
                        fontSize: 24,
                        color: canScan
                          ? 'var(--login-textBtn-color)'
                          : 'var(--login-textBtn-disable-color)',
                        float: 'right',
                        cursor: 'pointer',
                      }}
                      onClick={() =>
                        canScan
                          ? orgScanLoginModalRef.current?.show({
                              corpId: form.getFieldValue('corpId'),
                              threeChannel,
                            })
                          : null
                      }
                    />
                  </div>
                )}
                {/* 扫码登录 -end */}
                {/* 记住密码 */}
                {(!isLocalPhoneLogin || currentLoginWay !== LoginAuthType.LOCAL) &&
                terminalRememberPasswordSwitch ? (
                  <Checkbox
                    className="f12 remember-password"
                    checked={rememberMeChecked}
                    onChange={handleChangeRememberMe}
                  >
                    {formatMessage({ id: 'REMEMBER_PASSWORD' })}
                  </Checkbox>
                ) : (
                  <div></div>
                )}
                {/* 自动登录 */}
                {(!isLocalPhoneLogin || currentLoginWay !== LoginAuthType.LOCAL) &&
                currentLoginWay !== LoginAuthType.IAM ? (
                  <Checkbox
                    className="f12 auto-login"
                    checked={autoLoginChecked}
                    onChange={handleChangeAuto}
                  >
                    {formatMessage({ id: 'AUTOLOGIN' })}
                  </Checkbox>
                ) : (
                  <div></div>
                )}
              </div>
            </>
          )}
        </div>
        {/* 登录表单 - end */}
      </div>
      {/* 登录内容 - end */}
      <div className="footer-container">
        <Footer />
      </div>

      {/* 找回密码 弹框 */}
      <FindPasswordModal visible={findPwdVisible} setVisible={setFindPwdVisible} />

      {/* sliderVerifyModalRef sendMsgModalRef oneTimePwdModalRef */}
      <SliderVerifyModal ref={sliderVerifyModalRef} />
      <SendMsgModal ref={sendMsgModalRef} />
      <OneTimePwdModal ref={oneTimePwdModalRef} />
      <OrgScanLoginModal ref={orgScanLoginModalRef} />

      {/* 自动登录loading */}
      {/* {submitting ? <LoginLoading /> : null} */}
    </div>
  );
};

export default Login;
