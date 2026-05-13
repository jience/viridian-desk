import { appStore } from '@/store';

export const authActionShow = (actions) => {
  const store = appStore.getState();
  const permissions = store.app.currentUser?.permissions || [];
  for (var index in actions) {
    let validateAction = actions[index];
    if (permissions?.indexOf(validateAction) >= 0) {
      return true;
    }
  }
  return false;
};
const ActionAuth = (ComposedComponent, props) => {
  const Wrapper = (props) => {
    const { show, scope, options, actions, projectId, emptyContent, ...others } = props;
    const store = appStore.getState();
    const permissions = store.app.currentUser?.permissions || [];
    let valid = false;
    if (options) {
      let allowOptions = options.filter((item) => {
        let subOptions = item.subOptions;
        if (subOptions && subOptions.length > 0) {
          let allowSubOptions = subOptions.filter((subitem) => {
            let subAction = subitem.action;
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
          let action = item.action;
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
      for (var index in actions) {
        let validateAction = actions[index];
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
