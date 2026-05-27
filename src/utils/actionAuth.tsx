/* eslint-disable react-refresh/only-export-components */
import { getStoreState } from '@/store/runtime-access';
import type { ComponentType } from 'react';

export const authActionShow = (actions: string[] = []) => {
  const permissions = getStoreState()?.app.currentUser?.permissions || [];
  for (const validateAction of actions) {
    if (permissions?.indexOf(validateAction) >= 0) {
      return true;
    }
  }
  return false;
};
const ActionAuth = (ComposedComponent: ComponentType<any>) => {
  const Wrapper = (props: any) => {
    const { show, scope: _scope, options, actions, projectId: _projectId, emptyContent, ...others } = props;
    const permissions = getStoreState()?.app.currentUser?.permissions || [];
    let valid = false;
    if (options) {
      const allowOptions = options.filter((item: any) => {
        const subOptions = item.subOptions;
        if (subOptions && subOptions.length > 0) {
          const allowSubOptions = subOptions.filter((subitem: any) => {
            const subAction = subitem.action;
            if (!subAction) {
              return true;
            }
            if (permissions?.indexOf(subAction) > -1) {
              return true;
            }
            return false;
          });
          if (allowSubOptions.length > 0) {
            item.subOptions = allowSubOptions;
            return true;
          } else {
            return false;
          }
        } else {
          const action = item.action;
          if (!action) {
            return true;
          }
          if (permissions?.indexOf(action) > -1) {
            return true;
          }
          return false;
        }
      });
      if (allowOptions.length > 0) {
        return <ComposedComponent {...others} options={allowOptions} />;
      }
    } else if (actions) {
      for (const validateAction of actions) {
        if (permissions?.indexOf(validateAction) > -1) {
          valid = true;
          break;
        }
      }
    }
    if (valid) {
      return <ComposedComponent {...others} />;
    } else {
      if (show) {
        return <ComposedComponent {...others} disabled />;
      } else {
        if (emptyContent) {
          return <span>{emptyContent}</span>;
        }
        return null;
      }
    }
  };

  return Wrapper;
};
export default ActionAuth;
