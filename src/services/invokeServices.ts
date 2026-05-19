const invoke = async (command: string, payload?: any) => {
  const { invoke: tauriInvoke } = await import('@tauri-apps/api/core');
  return tauriInvoke(command, payload);
};

/**
 * @author QL
 * @date 2024-05-29 14:16:42
 * @version V..
 * @description 全局配置类
 */
// 获取终端本地配置
export const _get_app_conf = (payload?: any) => invoke('get_app_conf', { ...payload });

/**
 * @author QL
 * @date 2024-05-29 14:12:29
 * @version V..
 * @description 登录页
 */
// 登录成功提交信息
export const _login = (payload?: any) => invoke('login', { ...payload });
// 登出成功提交信息
export const _logout = (payload?: any) => invoke('logout', { ...payload });

/**
 * @author QL
 * @date 2024-05-29 14:09:22
 * @version V..
 * @description 设置页-服务器
 */
// 获取服务器列表
export const _get_gateway_server = (payload?: any) => invoke('get_gateway_server', { ...payload });

// 添加服务器
export const _add_gateway_server = (payload?: any) => invoke('add_gateway_server', { ...payload });

// 启用服务器
export const _switch_gateway_server = (payload?: any) =>
  invoke('switch_gateway_server', { ...payload });

// 更新服务器
export const _update_gateway_server = (payload?: any) =>
  invoke('update_gateway_server', { ...payload });

// 删除服务器
export const _delete_gateway_server = (payload?: any) =>
  invoke('delete_gateway_server', { ...payload });

/**
 * @author QL
 * @date 2024-05-29 14:09:36
 * @version V..
 * @description 设置页-通用
 */
// 设置开机自启动
export const _set_autostart = (payload?: any) => invoke('set_autostart', { ...payload });

// 设置自动更新
export const _set_fullscreen = (payload?: any) => invoke('set_fullscreen', { ...payload });

// 设置自动更新
export const _set_autoupdate = (payload?: any) => invoke('set_autoupdate', { ...payload });

// 设置主题色
export const _set_theme = (payload?: any) => invoke('set_theme', { ...payload });

// 设置语言
export const _set_language = (payload?: any) => invoke('set_language', { ...payload });

/**
 * @author QL
 * @date 2024-05-29 14:11:33
 * @version V..
 * @description 设置页-高级
 */
// 设置开发者模式
export const _set_developer_mode = (payload?: any) => invoke('set_developer_mode', { ...payload });

/**
 * @author QL
 * @date 2024-05-29 14:40:55
 * @version V..
 * @description 设置页-关于
 */
// 获取关于页面所需的终端配置
export const _get_client_about = (payload?: any) => invoke('get_client_about', { ...payload });

// 手动触发版本校验
export const _check_version_upgrade = (payload?: any) =>
  invoke('fetch_update', { ...payload });

/**
 * @author QL
 * @date 2024-05-29 15:09:46
 * @version V..
 * @description 内页-桌面
 */
// 连接桌面 connect_desktop
export const _connect_desktop = (payload?: any) => invoke('connect_desktop', { ...payload });

/**
 * @author QL
 * @date 2024-05-29 15:08:00
 * @version V..
 * @description 内页-外设
 */
// 获取usb外设列表
export const _list_usb_devices = (payload?: any) => invoke('list_usb_devices', { ...payload });
