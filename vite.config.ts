import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

const host = process.env.TAURI_DEV_HOST;

function getNodePackageName(id: string) {
  const segments = id.split('/node_modules/');
  if (segments.length < 2) return null;

  const packagePath = segments.at(-1);
  if (!packagePath) return null;

  const [scopeOrName, name] = packagePath.split('/');
  if (!scopeOrName) return null;

  return scopeOrName.startsWith('@') && name ? `${scopeOrName}/${name}` : scopeOrName;
}

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  // Env variables starting with the item of `envPrefix` will be exposed in tauri's source code through `import.meta.env`.
  envPrefix: [
    'VITE_',
    'TAURI_PLATFORM',
    'TAURI_ARCH',
    'TAURI_FAMILY',
    'TAURI_PLATFORM_VERSION',
    'TAURI_PLATFORM_TYPE',
    'TAURI_DEBUG',
  ],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // 为调试构建生成源代码映射 (sourcemap)
    sourcemap: !!process.env.TAURI_DEBUG,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          const packageName = getNodePackageName(id);

          if (packageName?.startsWith('@tauri-apps/')) {
            return 'vendor-tauri';
          }
          if (
            packageName === 'i18next' ||
            packageName === 'react-i18next' ||
            packageName === 'react-intl' ||
            packageName === 'i18next-browser-languagedetector' ||
            packageName === 'i18next-resources-to-backend'
          ) {
            return 'vendor-i18n';
          }
          if (packageName?.startsWith('@radix-ui/')) {
            return 'vendor-radix';
          }
          if (packageName === 'lucide-react' || packageName === 'lucide') {
            return 'vendor-icons';
          }
          if (packageName === 'react-custom-scrollbars') {
            return 'vendor-scrollbars';
          }
          if (
            packageName === '@reduxjs/toolkit' ||
            packageName === 'react-redux' ||
            packageName === 'redux' ||
            packageName === 'redux-thunk' ||
            packageName === 'reselect' ||
            packageName === 'immer'
          ) {
            return 'vendor-state';
          }
          return 'vendor';
        },
      },
    },
  },
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. Tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    // Tauri expects a fixed port, fail if that port is not available
    strictPort: true,
    // if the host Tauri is expecting is set, use it
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
});
