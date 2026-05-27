import './index.scss';

import { AccountWorkbench } from '@/features/account/components/account-workbench';
import sidebarLogo from '@/assets/images/logo.svg';
import { bridge } from '@/native';
import { useAppDispatch, useAppSelector } from '@/store';
import { logoutCurrentUser, selectCurrentUser } from '@/store/feature/app';
import { selectIntegration } from '@/store/feature/config';
import { selectIsThin } from '@/store/feature/terminal/terminalSlice';
import { cn } from '@/shared/ui/lib/cn';
import { authActionShow } from '@/utils/actionAuth';
import { logger } from '@/utils/logger';
import { Modal, Tooltip } from '@/shared/ui';
import { isEmptyValue } from '@/utils/value';
import { Sparkles } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMessageFormatter } from '@/utils/message-format';
import { useLocation, useNavigate } from 'react-router';
import { initMenus as menus } from './initData';

const DiffLoginTip = lazy(() => import('@/features/account/components/diff-login-tip'));

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

  const [diffLoginTipVisible, setDiffLoginTipVisible] = useState(false);

  /**
   * @author zhoujingjing
   * @description 退出函数
   */
  const logout = useCallback(async () => {
    await appDispatch(logoutCurrentUser(false));
    navigate('/login');
  }, [appDispatch, navigate]);

  const [activeMenu, setActiveMenu] = useState('');
  const forcePasswordChange = useMemo(
    () => !!currentUser && (!currentUser.passwordIsUpdated || currentUser.passwordIsExpire),
    [currentUser],
  );

  useEffect(() => {
    const path = location.pathname;
    let activePath = '';
    for (const index in menus) {
      if (path.indexOf(menus[index].path) === 0) {
        activePath = menus[index].path;
      }
    }
    setActiveMenu(activePath);
  }, [location.pathname]);

  useEffect(() => {
    if (!currentUser) return;

    if (forcePasswordChange) return;

    if (currentUser.loginFromDifferentLocation) {
      setDiffLoginTipVisible(true);
    }
  }, [currentUser, forcePasswordChange]);

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
          void logout();
        });
      } catch (error) {
        logger.debug('user-idle-logout listener unavailable', error);
      }
    };

    setupListeners();

    return () => {
      if (unListenUserIdleLogout) unListenUserIdleLogout();
    };
  }, [logout]);

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
          <AccountWorkbench
            currentUser={currentUser}
            forcePasswordChange={forcePasswordChange}
            onForcedClose={logout}
            onLogout={logout}
          />
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
