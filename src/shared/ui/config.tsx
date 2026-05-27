import { showConfirm } from './confirm';
import { message } from './message';
import type { ModalProps } from './modal';

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
