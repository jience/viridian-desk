import { appStore } from '@/store';
import type { ReactNode } from 'react';

interface HasPermissionFun {
  (permissionCode: string | string[]): boolean;
  (permissionCode: string | string[], node: ReactNode): ReactNode;
}

export const hasPermission = ((permissionCode, node) => {
  const store = appStore.getState();
  const permissions = store.app.currentUser?.permissions || [];
  let visible = false;
  if (!permissions) return node ? null : false;

  if (typeof permissionCode === 'string') {
    visible = !!permissions.includes(permissionCode);
  } else {
    visible = permissionCode.every((code) => !!permissions.includes(code));
  }

  if (node) {
    return visible ? node : null;
  }

  return visible;
}) as HasPermissionFun;
