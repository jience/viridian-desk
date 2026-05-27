import { Suspense, type ReactNode } from 'react';

import { RouteFallback } from '@/shared/ui/shell/route-fallback';

export const routeElement = (node: ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{node}</Suspense>
);
