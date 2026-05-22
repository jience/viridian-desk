import { useAppDispatch, useAppSelector } from '@/store';
import { logoutCurrentUser, selectIsLogin } from '@/store/feature/app';
import { selectIsThin } from '@/store/feature/terminal/terminalSlice';
import { bridge } from '@/native';
import { type FC } from 'react';
import { useMessageFormatter } from '@/utils/message-format';
import { Minus, X } from 'lucide-react';
import './index.scss';

export interface ControlWindowProps {
  exist?: boolean;
  hiddenMini?: boolean;
  iconClass?: string;
}

const ControlWindow: FC<ControlWindowProps> = (props) => {
  const { exist, hiddenMini } = props;

  const appDispatch = useAppDispatch();
  const { formatMessage } = useMessageFormatter();
  const isThin = useAppSelector(selectIsThin);
  const isLogin = useAppSelector(selectIsLogin);

  function miniWindow() {
    void bridge.minimizeWindow();
  }

  async function closeWindow() {
    if (isLogin) {
      await appDispatch(logoutCurrentUser(false));
    }
    await bridge.closeWindow();
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
          <Minus aria-hidden="true" />
        </button>
      )}

      <button
        aria-label={formatMessage({ id: 'CLOSE', defaultMessage: 'Close' })}
        className="control-window-content__button control-window-content__button--close"
        type="button"
        onClick={closeWindow}
      >
        <X aria-hidden="true" />
      </button>
    </div>
  ) : null;
};

export default ControlWindow;
