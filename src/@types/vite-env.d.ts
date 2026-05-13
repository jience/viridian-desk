/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  /** 测试变量 */
  readonly VITE_APP_TEST: string;
  /** 默认的API地址 */
  readonly VITE_BASE_DEFAULT_URL: string;
  /** API请求超时时间 */
  readonly VITE_API_TIMEOUT: string;
  /** API请求前缀 */
  readonly VITE_API_PREFIX: string;
}
