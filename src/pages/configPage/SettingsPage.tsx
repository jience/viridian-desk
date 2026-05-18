import '@/styles/design-system.css';
import { Button } from '@/ui/components/button';
import { PreLoginSettingsShell } from '@/ui/shell/pre-login-settings-shell';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import FormModal from './modalComp/FormModal';
import './SettingsPage.scss';

const SETTINGS_ROOT = '/configPage';

export default function SettingsPage() {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();

  const [formModalVisible, setFormModalVisible] = useState(false);

  const securityPasswordLabel = intl.formatMessage({ id: 'SecurityPassword' });
  const formFeatureDefaults = useMemo(
    () => [
      {
        key: 'securityPassword',
        name: 'securityPassword',
        label: securityPasswordLabel,
        rules: [
          {
            required: true,
            message: intl.formatMessage({ id: 'FORM_ERROR_MSG' }, { name: securityPasswordLabel }),
          },
        ],
        comType: 'input.password',
        comProps: {
          prefix: '',
          suffix: '',
          placeholder: intl.formatMessage(
            { id: 'FORM_ERROR_MSG' },
            { name: securityPasswordLabel },
          ),
        },
      },
    ],
    [intl, securityPasswordLabel],
  );
  const initialValues = useMemo(
    () => ({
      securityPassword: '',
    }),
    [],
  );
  const [defaultFormValues, setDefaultFormValues] = useState(initialValues);
  const [formFeatures, setFormFeatures] = useState(formFeatureDefaults);

  useEffect(() => {
    setFormFeatures(formFeatureDefaults);
  }, [formFeatureDefaults]);

  const tabButtons = useMemo(
    () => [
      {
        name: intl.formatMessage({ id: 'Server' }),
        subtitle: intl.formatMessage({ id: 'SettingsServerSubtitle' }),
        icon: 'icon-net',
        path: `${SETTINGS_ROOT}/serverSetting`,
      },
      {
        name: intl.formatMessage({ id: 'COMMONSETUP' }),
        subtitle: intl.formatMessage({ id: 'SettingsCommonSubtitle' }),
        icon: 'icon-stencil',
        path: `${SETTINGS_ROOT}/commonSetting`,
      },
      {
        name: intl.formatMessage({ id: 'Senior' }),
        subtitle: intl.formatMessage({ id: 'SettingsAdvancedSubtitle' }),
        icon: 'icon-log',
        path: `${SETTINGS_ROOT}/advancedSetting`,
      },
      {
        name: intl.formatMessage({ id: 'ABOUT' }),
        subtitle: intl.formatMessage({ id: 'SettingsAboutSubtitle' }),
        icon: 'icon-info-s',
        path: `${SETTINGS_ROOT}/about`,
      },
    ],
    [intl],
  );

  const activeTabPath = useMemo(() => {
    return (
      tabButtons.find(
        (button) =>
          location.pathname === button.path || location.pathname.startsWith(`${button.path}/`),
      )?.path ?? ''
    );
  }, [location.pathname, tabButtons]);

  const activeTab = tabButtons.find((button) => button.path === activeTabPath);

  const goBack = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const tabChoose = useCallback(
    (path: string) => {
      if (path !== location.pathname) {
        navigate(path);
      }
    },
    [location.pathname, navigate],
  );

  const submitDistributor = useCallback((_params: any, _cb: any) => {
    // Security password verification remains wired for the native bridge path.
  }, []);

  return (
    <div className="settings-page">
      <PreLoginSettingsShell
        header={
          <>
            <div className="settings-page__heading">
              <span className="settings-page__eyebrow">
                {intl.formatMessage({ id: 'SettingsWorkbenchEyebrow' })}
              </span>
              <h1 className="settings-page__title">
                {activeTab?.name || intl.formatMessage({ id: 'SettingsWorkbenchTitle' })}
              </h1>
              {activeTab?.subtitle && (
                <p className="settings-page__subtitle">{activeTab.subtitle}</p>
              )}
            </div>
          </>
        }
        sidebar={
          <div className="settings-page__sidebar">
            <div className="settings-page__brand">
              <span className="settings-page__brand-mark">VD</span>
              <span>{intl.formatMessage({ id: 'SettingsWorkbenchTitle' })}</span>
            </div>

            <nav className="vd-settings-nav" aria-label={intl.formatMessage({ id: 'COMMONSETUP' })}>
              {tabButtons.map((button) => {
                const isActive = activeTabPath === button.path;

                return (
                  <Button
                    key={button.path}
                    aria-current={isActive ? 'page' : undefined}
                    className="vd-settings-nav__button settings-page__nav-button"
                    type="button"
                    variant={isActive ? 'primary' : 'ghost'}
                    onClick={() => tabChoose(button.path)}
                  >
                    <i className={`iconfont ${button.icon}`} aria-hidden="true" />
                    <span>{button.name}</span>
                  </Button>
                );
              })}
            </nav>

            <div className="settings-page__sidebar-footer">
              <Button
                className="settings-page__exit"
                type="button"
                variant="secondary"
                onClick={goBack}
              >
                <i className="iconfont icon-signout" />
                {intl.formatMessage({ id: 'ExitSetting' })}
              </Button>
            </div>
          </div>
        }
      >
        <div className="settings-page__content">
          {location.pathname === SETTINGS_ROOT ? (
            <Navigate to={`${SETTINGS_ROOT}/serverSetting`} replace />
          ) : (
            <Outlet />
          )}
        </div>
      </PreLoginSettingsShell>

      {formModalVisible && (
        <FormModal
          title={`${intl.formatMessage({ id: 'SecurityPassword' })}`}
          visiable={formModalVisible}
          setVisiable={setFormModalVisible}
          formFeatures={formFeatures}
          setFormFeatures={setFormFeatures}
          defaultFormValues={defaultFormValues}
          setDefaultFormValues={setDefaultFormValues}
          initialValues={initialValues}
          onOkRun={submitDistributor}
          onCancelRun={goBack}
          onKeyupEnter={true}
        />
      )}
    </div>
  );
}
