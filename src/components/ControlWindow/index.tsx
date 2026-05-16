import { useAppDispatch, useAppSelector } from '@/store';
import { logoutCurrentUser, selectIsLogin } from '@/store/feature/app';
import { selectIsThin } from '@/store/feature/terminal/terminalSlice';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { type FC } from 'react';
import { useIntl } from 'react-intl';
import './index.scss';

export interface ControlWindowProps {
  exist?: boolean;
  hiddenMini?: boolean;
  iconClass?: string;
}

const ControlWindow: FC<ControlWindowProps> = (props) => {
  const { exist, hiddenMini } = props;

  const appDispatch = useAppDispatch();
  const { formatMessage } = useIntl();
  const isThin = useAppSelector(selectIsThin);
  const isLogin = useAppSelector(selectIsLogin);

  function miniWindow() {
    getCurrentWindow().minimize();
  }

  async function closeWindow() {
    if (isLogin) {
      await appDispatch(logoutCurrentUser(false));
    }
    getCurrentWindow().close();
  }

  return !isThin || exist ? (
    <div className="control-window-content">
      {!hiddenMini && (
        <button
          aria-label={formatMessage({ id: 'MINIMIZE', defaultMessage: 'Minimize' })}
          className="control-window-content__button"
          type="button"
          onClick={miniWindow}
        >
          <i className="iconfont icon-minus" />
        </button>
      )}

      <button
        aria-label={formatMessage({ id: 'CLOSE', defaultMessage: 'Close' })}
        className="control-window-content__button control-window-content__button--close"
        type="button"
        onClick={closeWindow}
      >
        <i className="iconfont icon-error" />
      </button>
    </div>
  ) : null;
};

export default ControlWindow;
