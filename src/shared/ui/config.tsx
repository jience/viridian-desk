import { createContext } from 'react';

import { showConfirm } from './confirm';
import { message } from './message';
import type { ModalProps } from './modal';

const configContextValue = {
  getPrefixCls: (suffix?: string, customizePrefixCls?: string) =>
    customizePrefixCls || (suffix ? `vdui-${suffix}` : 'vdui'),
};

const ConfigContext = createContext(configContextValue);

export const ConfigProvider = Object.assign(({ children }: any) => <>{children}</>, {
  ConfigContext,
});

export const App = Object.assign(({ children }: any) => <>{children}</>, {
  useApp: () => ({
    message,
    modal: {
      confirm: (props: ModalProps) => {
        return showConfirm(props);
      },
    },
  }),
});
