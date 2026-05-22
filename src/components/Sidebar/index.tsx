import './index.scss';

import sidebarLogo from '@/assets/images/logo.svg';
import { bridge } from '@/native';
import { LoginUserType } from '@/native/interfaces/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { logoutCurrentUser, selectCurrentUser } from '@/store/feature/app';
import { selectIntegration } from '@/store/feature/config';
import { selectIsThin } from '@/store/feature/terminal/terminalSlice';
import { cn } from '@/ui/lib/cn';
import { authActionShow } from '@/utils/actionAuth';
import { logger } from '@/utils/logger';
import { LEGACY_PASSWORD_PREFIX } from '@/utils/passwordPrefix';
import { Menu, message, Modal, Popover, Tooltip } from '@/ui';
import { isEmptyValue } from '@/utils/value';
import { Sparkles } from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMessageFormatter } from '@/utils/message-format';
import { useLocation, useNavigate } from 'react-router';
import { initMenus as menus } from './initData';

const ChangePhone = lazy(() => import('@/components/ChangePhone'));
const ComModal = lazy(() => import('@/components/ComModal'));
const DiffLoginTip = lazy(() => import('@/components/DiffLoginTip'));
const PwdForm = lazy(() => import('@/components/PwdForm'));
const UserInfo = lazy(() => import('@/components/UserInfo'));

interface SidebarProps {
  assistantOpen?: boolean;
  onAssistantToggle?: () => void;
}

function Sidebar({ assistantOpen = false, onAssistantToggle }: SidebarProps) {
  const intl = useMessageFormatter();
  const { t } = useTranslation();
  const { t: commonT } = useTranslation('common');
  const { t: assistantT } = useTranslation('assistant');
  const appDispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [modal, contextHolder] = Modal.useModal();

  const isThin = useAppSelector(selectIsThin);
  const isIntegratedMode = useAppSelector(selectIntegration);
  const currentUser = useAppSelector(selectCurrentUser);

  const [userBtnOpen, setUserBtnOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userInfoVisible, setUserInfoVisible] = useState(false);
  const [changePhoneVisible, setChangePhoneVisible] = useState(false);
  const [diffLoginTipVisible, setDiffLoginTipVisible] = useState(false);
  const [isBindLogin, _setBindLogin] = useState(true);

  // 判断当前登录方式下，是否可以修改密码
  const canModifyMod = useMemo(() => {
    return currentUser?.type === LoginUserType.LOCAL;
  }, [currentUser]);

  /**
   * @author zhoujingjing
   * @description 退出函数
   */
  const logout = async () => {
    await appDispatch(logoutCurrentUser(false));
    navigate('/login');
  };

  const userMenus = useMemo(() => {
    return (
      <Menu onClick={() => setUserBtnOpen(false)}>
        <Menu.Item
          // actions={[Actions.TerminalROUserRead]}
          key="info"
          onClick={() => {
            setUserInfoVisible(true);
          }}
        >
          <i className="iconfont icon-role"></i>
          {intl.formatMessage({ id: 'USER_INFO' })}
        </Menu.Item>
        {canModifyMod && (
          <Menu.Item
            // actions={[Actions.TerminalRWUserUpdatePassword]}
            key="pwd"
            onClick={modifyPwd}
          >
            <i className="iconfont icon-authority"></i>
            {intl.formatMessage({ id: 'MODIFY_PASSWORD' })}
          </Menu.Item>
        )}
        {/* 修改手机号 */}
        {currentUser?.type === LoginUserType.LOCAL && (
          <Menu.Item
            // actions={[Actions.TerminalRWUserUpdatePhone]}
            key="changePhone"
            onClick={() => setChangePhoneVisible(true)}
          >
            <i className="iconfont icon-icon_phone"></i>
            {intl.formatMessage({ id: 'ChangePhone' })}
          </Menu.Item>
        )}
        <Menu.Item
          // actions={[Actions.TerminalRWUserLoginOrLogout]}
          onClick={logout}
          disabled={!isBindLogin}
        >
          <i className="iconfont icon-signout"></i>
          {intl.formatMessage({ id: 'LOGOUT' })}
        </Menu.Item>
      </Menu>
    );
  }, [canModifyMod, intl, isBindLogin, currentUser]);

  const [activeMenu, setActiveMenu] = useState('');

  /**
   * @author zhoujingjing
   * @description 弹出框配置项
   */
  const [modalData, setModalData] = useState({
    title: intl.formatMessage({ id: 'MODIFY_PASSWORD' }),
    visible: false,
    cancelText: intl.formatMessage({ id: 'CANCEL' }),
    okText: intl.formatMessage({ id: 'SAVE' }),
    width: 520,
    centered: true,
  });

  /**
   * @author zhoujingjing
   * @description 引用表单ref
   */
  const formRef = useRef<any>(null);

  /**
   * @author zhoujingjing
   * @description 表单数据
   */
  const [formData, setFormData] = useState({});

  /**
   * @author zhoujingjing
   * @description 打开修改密码弹窗
   */
  function modifyPwd() {
    setModalData((data) => ({
      ...data,
      visible: true,
    }));
  }

  /**
   * @author zhoujingjing
   * @description 关闭弹窗
   */
  function closeModal() {
    if (!currentUser?.passwordIsUpdated || currentUser?.passwordIsExpire) {
      logout();
    }
    setModalData((data) => ({
      ...data,
      visible: false,
    }));
    closeModalCallback();
  }

  /**
   * @author zhoujingjing
   * @description 关闭弹窗回调方法
   */
  function closeModalCallback() {
    setFormData({});
  }

  // 修改密码时，密码加密传参方式
  const decodePwd = async (str: any) => {
    const { Buffer } = await import('buffer');
    const localDate = new Date().getTime();
    return Buffer.from(LEGACY_PASSWORD_PREFIX + str + '_' + localDate).toString('base64');
  };

  const submitForm = () => {
    formRef.current
      .validateFields()
      .then(async (values: any) => {
        const { oldPassword, newPassword, confirmPassword } = values;
        setIsSubmitting(true);
        try {
          const { changePasswordUser } = await import('@/services/user');
          await changePasswordUser({
            oldPassword: await decodePwd(oldPassword),
            newPassword: await decodePwd(newPassword),
            confirmPassword: await decodePwd(confirmPassword),
          });
          closeModal();
          message.success({
            content: intl.formatMessage({ id: 'SUCCESS_CHANGE_PASSWORD' }),
          });
          logout();
        } finally {
          setIsSubmitting(false);
        }
      })
      .catch();
  };

  useEffect(() => {
    const path = location.pathname;
    let activePath = '';
    for (const index in menus) {
      if (path.indexOf(menus[index].path) === 0) {
        activePath = menus[index].path;
      }
    }
    setActiveMenu(activePath);
  }, [location, menus]);

  useEffect(() => {
    if (!currentUser) return;

    if (!currentUser?.passwordIsUpdated || currentUser?.passwordIsExpire) {
      modifyPwd();
    } else if (currentUser?.loginFromDifferentLocation) {
      setDiffLoginTipVisible(true);
    }
  }, [currentUser]);

  const onPersonalVisibleChange = (val: boolean) => {
    setUserBtnOpen(val);
    if (val) {
      // res 是null 则不是绑定并自动登录， res不为空，则是绑定并自动登录
      // window.ipcRenderer.send(globalAjax.GetBindUser, {});
      // globalAjax.GetBindUserRes({
      //   success: (res: any) => {
      //     setBindLogin(isEmpty(res));
      //   },
      //   error: (err: any) => {},
      // });
    }
  };

  const shutdown = async () => {
    const confirmed = await modal.confirm({
      title: t('common.warning'),
      content: t('common.warning_shutdown_msg'),
    });
    if (confirmed) {
      await bridge.cmd.shutdownLocalDevice();
    }
  };

  useEffect(() => {
    let unListenUserIdleLogout: (() => void) | null = null;

    const setupListeners = async () => {
      try {
        unListenUserIdleLogout = await bridge.onEvent('user-idle-logout', () => {
          logout();
        });
      } catch (error) {
        logger.debug('user-idle-logout listener unavailable', error);
      }
    };

    setupListeners();

    return () => {
      if (unListenUserIdleLogout) unListenUserIdleLogout();
    };
  }, []);

  return (
    <nav className="sidebar nav-drag" aria-label={commonT('appName')}>
      <div className="sidebar__top">
        <Tooltip title={commonT('appName')} placement="right">
          <button
            aria-label={commonT('appName')}
            className="sidebar__brand"
            type="button"
            onClick={() => navigate('/app/desk')}
          >
            <img src={sidebarLogo} alt="" draggable={false} />
          </button>
        </Tooltip>
        <ul className="sidebar__menus" aria-label={commonT('appName')}>
          {menus.map((item) => {
            const visible = isEmptyValue(item.actions) || authActionShow(item.actions);
            if (!visible) return null;

            const label = commonT(item.labelKey);
            const active = activeMenu === item.path;

            return (
              <li className="sidebar__item" key={item.name}>
                <Tooltip title={label} placement="right">
                  <button
                    aria-current={active ? 'page' : undefined}
                    aria-label={label}
                    className={cn('sidebar__button', active && 'sidebar__button--active')}
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                    }}
                  >
                    <i className={`iconfont ${item.icon}`} />
                    <span className="sidebar__label">{label}</span>
                  </button>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </div>
      <ul className="sidebar__actions" aria-label={commonT('user.personalInformation')}>
        {onAssistantToggle && (
          <li className="sidebar__item">
            <Tooltip title={assistantT('title')} placement="right">
              <button
                aria-label={assistantT('title')}
                aria-pressed={assistantOpen}
                className={cn('sidebar__button', assistantOpen && 'sidebar__button--active')}
                type="button"
                onClick={onAssistantToggle}
              >
                <Sparkles aria-hidden="true" />
              </button>
            </Tooltip>
          </li>
        )}
        <li className="sidebar__item">
          <Popover
            content={userMenus}
            placement="rightBottom"
            trigger="click"
            open={userBtnOpen}
            onOpenChange={(e) => onPersonalVisibleChange(e)}
            classNames={{ root: 'slider-user-menus' }}
          >
            <Tooltip title={commonT('user.personalInformation')} placement="right">
              <button
                aria-expanded={userBtnOpen}
                aria-label={commonT('user.personalInformation')}
                className={cn('sidebar__button', userBtnOpen && 'sidebar__button--active')}
                type="button"
                onClick={() => setUserBtnOpen(true)}
              >
                <i className="iconfont icon-user" />
              </button>
            </Tooltip>
          </Popover>
        </li>
        {/* )} */}
        {(isIntegratedMode || isThin) && (
          <li className="sidebar__item">
            <Tooltip title={intl.formatMessage({ id: 'SHUTDOWNDESTOP' })} placement="right">
              <button
                aria-label={intl.formatMessage({ id: 'SHUTDOWNDESTOP' })}
                className="sidebar__button sidebar__button--danger"
                type="button"
                onClick={shutdown}
              >
                <i className="iconfont icon-power-off-filled" />
              </button>
            </Tooltip>
          </li>
        )}
      </ul>
      {modalData.visible && (
        <Suspense fallback={null}>
          <ComModal
            modalData={modalData}
            onCancel={closeModal}
            onOk={submitForm}
            afterClose={closeModalCallback}
            okButtonProps={{ disabled: isSubmitting }}
          >
            <PwdForm ref={formRef} formData={formData} />
          </ComModal>
        </Suspense>
      )}
      {userInfoVisible && (
        <Suspense fallback={null}>
          <UserInfo visible={userInfoVisible} setVisible={setUserInfoVisible} />
        </Suspense>
      )}
      {changePhoneVisible && (
        <Suspense fallback={null}>
          <ChangePhone visible={changePhoneVisible} setVisible={setChangePhoneVisible} />
        </Suspense>
      )}
      {diffLoginTipVisible && (
        <Suspense fallback={null}>
          <DiffLoginTip visible={diffLoginTipVisible} setVisible={setDiffLoginTipVisible} />
        </Suspense>
      )}
      <>{contextHolder}</>
    </nav>
  );
}

export default Sidebar;
