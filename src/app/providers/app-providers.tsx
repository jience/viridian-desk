import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { appStore } from '@/store';

export function AppProviders({ children }: PropsWithChildren) {
  return <Provider store={appStore}>{children}</Provider>;
}
