# Frontend Redesign Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the new UI infrastructure for the Viridian Desk redesign without replacing existing business pages yet.

**Architecture:** Add the new design system beside the current AntD UI, prove it through an isolated `/redesign-preview` route, and avoid changing existing production routes in this phase. The new stack provides theme tokens, i18n namespaces, base components, shell primitives, and assistant/user-menu foundations for later page migration.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/Radix primitives, TanStack Query/Table/Virtual, React Hook Form, Zod, Framer Motion, i18next.

---

## Scope

This plan implements Phase 1 from the approved design spec:

- New frontend dependencies and Vite/Tailwind wiring.
- New UI token system for `light`, `dark`, and `system`.
- New i18n namespace structure for `zh-CN`, `zh-TW`, and `en-US`.
- Base primitives needed by later pages.
- New shell preview route that demonstrates login shell, app shell, assistant panel, and user menu without touching existing routes.

This plan does not remove AntD from existing pages. Removal happens after replacement pages are ready.

## File Structure

Create:

- `src/ui/lib/cn.ts`: class name merge helper for shadcn-style components.
- `src/ui/theme/types.ts`: theme mode types.
- `src/ui/theme/storage.ts`: local theme persistence helpers.
- `src/ui/theme/theme-provider.tsx`: DOM theme application and React context.
- `src/ui/theme/use-ui-theme.ts`: hook for theme consumers.
- `src/ui/i18n/namespaces.ts`: typed namespace list.
- `src/ui/i18n/locales/zh-CN/common.json`
- `src/ui/i18n/locales/zh-TW/common.json`
- `src/ui/i18n/locales/en-US/common.json`
- `src/ui/i18n/locales/zh-CN/assistant.json`
- `src/ui/i18n/locales/zh-TW/assistant.json`
- `src/ui/i18n/locales/en-US/assistant.json`
- `src/ui/components/button.tsx`
- `src/ui/components/icon-button.tsx`
- `src/ui/components/input.tsx`
- `src/ui/components/switch.tsx`
- `src/ui/components/dialog.tsx`
- `src/ui/components/dropdown-menu.tsx`
- `src/ui/components/tooltip.tsx`
- `src/ui/components/toast.tsx`
- `src/ui/shell/app-shell.tsx`
- `src/ui/shell/login-shell.tsx`
- `src/ui/shell/pre-login-settings-shell.tsx`
- `src/ui/assistant/assistant-panel.tsx`
- `src/ui/user/user-menu.tsx`
- `src/features/redesign-preview/index.tsx`
- `src/features/redesign-preview/index.scss`

Modify:

- `package.json`: add new dependencies.
- `pnpm-lock.yaml`: update after installing dependencies.
- `vite.config.ts`: add Tailwind Vite plugin.
- `src/styles/redesign.css`: new Tailwind v4 import and design tokens.
- `src/main.tsx`: import Tailwind/theme CSS before legacy styles.
- `src/App.tsx`: wrap existing app in `UiThemeProvider`.
- `src/router/index.tsx`: add `/redesign-preview` route.
- `src/utils/i18n.ts`: register new namespace resources while keeping old locale loading.

## Task 1: Add UI Infrastructure Dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Install dependencies**

Run:

```bash
pnpm add @tailwindcss/vite tailwindcss class-variance-authority clsx tailwind-merge framer-motion @tanstack/react-query @tanstack/react-table @tanstack/react-virtual react-hook-form zod @hookform/resolvers sonner @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip @radix-ui/react-switch @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-checkbox
```

Expected: `package.json` and `pnpm-lock.yaml` update successfully.

- [ ] **Step 2: Verify dependency entries**

Run:

```bash
node -e "const p=require('./package.json'); const d=p.dependencies; for (const n of ['tailwindcss','@tailwindcss/vite','@radix-ui/react-dialog','@tanstack/react-query','framer-motion','react-hook-form','zod','sonner']) { if (!d[n]) throw new Error(n + ' missing'); } console.log('ui dependencies present')"
```

Expected output:

```text
ui dependencies present
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "Add redesign UI dependencies"
```

## Task 2: Wire Tailwind v4 and Design Tokens

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/main.tsx`
- Create: `src/styles/redesign.css`

- [ ] **Step 1: Add Tailwind Vite plugin**

Update `vite.config.ts` imports:

```ts
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
```

Update the plugin list:

```ts
plugins: [react(), svgr(), tailwindcss()],
```

- [ ] **Step 2: Create design token stylesheet**

Create `src/styles/redesign.css`:

```css
@import "tailwindcss";

:root {
  --vd-color-bg: #f4f0e8;
  --vd-color-panel: #fffdf7;
  --vd-color-panel-subtle: #eee8dc;
  --vd-color-rail: #24251f;
  --vd-color-text: #20221d;
  --vd-color-muted: #6f746b;
  --vd-color-border: rgba(82, 72, 52, 0.14);
  --vd-color-accent: #d9ff5c;
  --vd-color-success: #37b56d;
  --vd-color-warning: #d89f32;
  --vd-color-danger: #cf4f45;
  --vd-shadow-window: 0 28px 80px rgba(50, 45, 34, 0.18);
  --vd-focus-ring: 0 0 0 3px rgba(217, 255, 92, 0.4);
}

:root[data-ui-theme='dark'] {
  --vd-color-bg: #151917;
  --vd-color-panel: #1c211f;
  --vd-color-panel-subtle: #242b27;
  --vd-color-rail: #0f1211;
  --vd-color-text: #e9eee8;
  --vd-color-muted: #8d978e;
  --vd-color-border: rgba(255, 255, 255, 0.08);
  --vd-color-accent: #6ee7b7;
  --vd-color-success: #6ee7b7;
  --vd-color-warning: #f5c76b;
  --vd-color-danger: #f06b63;
  --vd-shadow-window: 0 28px 80px rgba(10, 12, 11, 0.38);
  --vd-focus-ring: 0 0 0 3px rgba(110, 231, 183, 0.32);
}

@theme inline {
  --color-vd-bg: var(--vd-color-bg);
  --color-vd-panel: var(--vd-color-panel);
  --color-vd-panel-subtle: var(--vd-color-panel-subtle);
  --color-vd-rail: var(--vd-color-rail);
  --color-vd-text: var(--vd-color-text);
  --color-vd-muted: var(--vd-color-muted);
  --color-vd-border: var(--vd-color-border);
  --color-vd-accent: var(--vd-color-accent);
  --color-vd-success: var(--vd-color-success);
  --color-vd-warning: var(--vd-color-warning);
  --color-vd-danger: var(--vd-color-danger);
}

.vd-focus-ring {
  outline: none;
}

.vd-focus-ring:focus-visible {
  box-shadow: var(--vd-focus-ring);
}
```

- [ ] **Step 3: Import redesign CSS**

Update the top of `src/main.tsx`:

```ts
import '@/styles/redesign.css';
import '@/styles/index.scss';
import '@/utils/i18n';
```

- [ ] **Step 4: Run lint**

Run:

```bash
pnpm run lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts src/main.tsx src/styles/redesign.css
git commit -m "Wire Tailwind redesign tokens"
```

## Task 3: Add Theme Provider

**Files:**
- Create: `src/ui/theme/types.ts`
- Create: `src/ui/theme/storage.ts`
- Create: `src/ui/theme/theme-provider.tsx`
- Create: `src/ui/theme/use-ui-theme.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create theme types**

Create `src/ui/theme/types.ts`:

```ts
export type UiThemeMode = 'light' | 'dark' | 'system';

export type ResolvedUiTheme = 'light' | 'dark';

export interface UiThemeContextValue {
  mode: UiThemeMode;
  resolvedTheme: ResolvedUiTheme;
  setMode: (mode: UiThemeMode) => void;
}
```

- [ ] **Step 2: Create theme storage**

Create `src/ui/theme/storage.ts`:

```ts
import type { UiThemeMode } from './types';

const STORAGE_KEY = 'viridian.ui.theme';

export function readStoredUiTheme(): UiThemeMode {
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }
  return 'system';
}

export function writeStoredUiTheme(mode: UiThemeMode) {
  window.localStorage.setItem(STORAGE_KEY, mode);
}
```

- [ ] **Step 3: Create provider**

Create `src/ui/theme/theme-provider.tsx`:

```tsx
import { createContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { readStoredUiTheme, writeStoredUiTheme } from './storage';
import type { ResolvedUiTheme, UiThemeContextValue, UiThemeMode } from './types';

export const UiThemeContext = createContext<UiThemeContextValue | null>(null);

function resolveTheme(mode: UiThemeMode, systemDark: boolean): ResolvedUiTheme {
  if (mode === 'system') return systemDark ? 'dark' : 'light';
  return mode;
}

export function UiThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<UiThemeMode>(() => readStoredUiTheme());
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  const resolvedTheme = useMemo(() => resolveTheme(mode, systemDark), [mode, systemDark]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.uiTheme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo<UiThemeContextValue>(() => {
    return {
      mode,
      resolvedTheme,
      setMode: (nextMode) => {
        writeStoredUiTheme(nextMode);
        setModeState(nextMode);
      },
    };
  }, [mode, resolvedTheme]);

  return <UiThemeContext.Provider value={value}>{children}</UiThemeContext.Provider>;
}
```

- [ ] **Step 4: Create hook**

Create `src/ui/theme/use-ui-theme.ts`:

```ts
import { useContext } from 'react';
import { UiThemeContext } from './theme-provider';

export function useUiTheme() {
  const value = useContext(UiThemeContext);
  if (!value) {
    throw new Error('useUiTheme must be used inside UiThemeProvider');
  }
  return value;
}
```

- [ ] **Step 5: Wrap the app**

Modify `src/App.tsx` imports:

```tsx
import { UiThemeProvider } from '@/ui/theme/theme-provider';
```

Wrap the current return content:

```tsx
return (
  <UiThemeProvider>
    <ConfigProvider
      locale={lang}
      theme={{ ...antdTheme, zeroRuntime: true, hashed: false, cssVar: { key: 'client-css-var' } }}
      button={{ autoInsertSpace: false }}
      modal={{ centered: true }}
      form={{ colon: false }}
    >
      <ClientApp component={false}>
        <IntlProvider locale={'zh-CN'} messages={window.LanguageData['zh-CN']}>
          <RouterProvider router={router} />
        </IntlProvider>
      </ClientApp>
    </ConfigProvider>
  </UiThemeProvider>
);
```

- [ ] **Step 6: Run lint**

Run:

```bash
pnpm run lint
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/ui/theme
git commit -m "Add redesign theme provider"
```

## Task 4: Add Redesign i18n Namespaces

**Files:**
- Create: `src/ui/i18n/namespaces.ts`
- Create: `src/ui/i18n/locales/zh-CN/common.json`
- Create: `src/ui/i18n/locales/zh-TW/common.json`
- Create: `src/ui/i18n/locales/en-US/common.json`
- Create: `src/ui/i18n/locales/zh-CN/assistant.json`
- Create: `src/ui/i18n/locales/zh-TW/assistant.json`
- Create: `src/ui/i18n/locales/en-US/assistant.json`
- Modify: `src/utils/i18n.ts`

- [ ] **Step 1: Create namespace list**

Create `src/ui/i18n/namespaces.ts`:

```ts
export const redesignNamespaces = ['common', 'assistant'] as const;

export type RedesignNamespace = (typeof redesignNamespaces)[number];
```

- [ ] **Step 2: Create common locale files**

Create `src/ui/i18n/locales/zh-CN/common.json`:

```json
{
  "appName": "Viridian Desk",
  "theme.light": "浅色",
  "theme.dark": "深色",
  "theme.system": "跟随系统",
  "actions.open": "打开",
  "actions.close": "关闭",
  "actions.cancel": "取消",
  "actions.confirm": "确认",
  "actions.save": "保存",
  "actions.search": "搜索",
  "status.online": "在线",
  "status.offline": "离线"
}
```

Create `src/ui/i18n/locales/zh-TW/common.json`:

```json
{
  "appName": "Viridian Desk",
  "theme.light": "淺色",
  "theme.dark": "深色",
  "theme.system": "跟隨系統",
  "actions.open": "開啟",
  "actions.close": "關閉",
  "actions.cancel": "取消",
  "actions.confirm": "確認",
  "actions.save": "儲存",
  "actions.search": "搜尋",
  "status.online": "線上",
  "status.offline": "離線"
}
```

Create `src/ui/i18n/locales/en-US/common.json`:

```json
{
  "appName": "Viridian Desk",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.system": "System",
  "actions.open": "Open",
  "actions.close": "Close",
  "actions.cancel": "Cancel",
  "actions.confirm": "Confirm",
  "actions.save": "Save",
  "actions.search": "Search",
  "status.online": "Online",
  "status.offline": "Offline"
}
```

- [ ] **Step 3: Create assistant locale files**

Create `src/ui/i18n/locales/zh-CN/assistant.json`:

```json
{
  "title": "助手",
  "subtitle": "状态解释、快捷诊断和固定知识入口。",
  "quick.connectionHelp": "连接失败怎么办",
  "quick.openLogs": "查看诊断日志",
  "quick.reportFault": "提交故障报告"
}
```

Create `src/ui/i18n/locales/zh-TW/assistant.json`:

```json
{
  "title": "助手",
  "subtitle": "狀態解釋、快捷診斷和固定知識入口。",
  "quick.connectionHelp": "連線失敗怎麼辦",
  "quick.openLogs": "查看診斷日誌",
  "quick.reportFault": "提交故障報告"
}
```

Create `src/ui/i18n/locales/en-US/assistant.json`:

```json
{
  "title": "Assistant",
  "subtitle": "Status explanations, quick diagnostics, and local guidance.",
  "quick.connectionHelp": "Connection troubleshooting",
  "quick.openLogs": "Open diagnostic logs",
  "quick.reportFault": "Submit a fault report"
}
```

- [ ] **Step 4: Register namespace backend**

Update `src/utils/i18n.ts` dynamic backend with this branch before the existing `Object.values(LanguageType)` branch:

```ts
      if (namespace === 'common' || namespace === 'assistant') {
        return import(`@/ui/i18n/locales/${language}/${namespace}.json`);
      }
```

The callback currently accepts one parameter. Change it to:

```ts
    resourcesToBackend((language: string, namespace: string) => {
```

Keep the existing legacy locale fallback logic after the namespace branch.

- [ ] **Step 5: Run i18n generation and lint**

Run:

```bash
pnpm run update-i18n
pnpm run lint
```

Expected: both commands PASS.

- [ ] **Step 6: Commit**

```bash
git add src/utils/i18n.ts src/ui/i18n src/@types/i18next-resource.d.ts
git commit -m "Add redesign i18n namespaces"
```

## Task 5: Add Base UI Utilities and Components

**Files:**
- Create: `src/ui/lib/cn.ts`
- Create: `src/ui/components/button.tsx`
- Create: `src/ui/components/icon-button.tsx`
- Create: `src/ui/components/input.tsx`
- Create: `src/ui/components/switch.tsx`
- Create: `src/ui/components/tooltip.tsx`
- Create: `src/ui/components/dropdown-menu.tsx`
- Create: `src/ui/components/dialog.tsx`
- Create: `src/ui/components/toast.tsx`

- [ ] **Step 1: Create class helper**

Create `src/ui/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create button components**

Create `src/ui/components/button.tsx`:

```tsx
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/ui/lib/cn';

const buttonVariants = cva(
  'vd-focus-ring inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-vd-rail text-vd-accent hover:brightness-110',
        secondary: 'bg-vd-panel-subtle text-vd-text hover:brightness-95',
        ghost: 'bg-transparent text-vd-text hover:bg-vd-panel-subtle',
        danger: 'bg-vd-danger text-white hover:brightness-110',
      },
      size: {
        sm: 'h-8 rounded-lg px-3 text-xs',
        md: 'h-10',
        lg: 'h-12 rounded-2xl px-5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ asChild, className, variant, size, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

Create `src/ui/components/icon-button.tsx`:

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/ui/lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
}

export function IconButton({ label, icon, className, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cn(
        'vd-focus-ring inline-grid size-10 place-items-center rounded-xl bg-vd-panel text-vd-text transition hover:bg-vd-panel-subtle active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      type="button"
      {...props}
    >
      {icon}
    </button>
  );
}
```

- [ ] **Step 3: Create input and switch**

Create `src/ui/components/input.tsx`:

```tsx
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/ui/lib/cn';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'vd-focus-ring h-10 w-full rounded-xl border border-vd-border bg-vd-panel px-3 text-sm text-vd-text placeholder:text-vd-muted disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
```

Create `src/ui/components/switch.tsx`:

```tsx
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/ui/lib/cn';

export function Switch({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'vd-focus-ring relative h-6 w-11 rounded-full bg-vd-panel-subtle transition data-[state=checked]:bg-vd-rail',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-0.5 rounded-full bg-vd-panel shadow transition data-[state=checked]:translate-x-5 data-[state=checked]:bg-vd-accent" />
    </SwitchPrimitive.Root>
  );
}
```

- [ ] **Step 4: Create Radix wrapper exports**

Create `src/ui/components/tooltip.tsx`:

```tsx
export * from '@radix-ui/react-tooltip';
```

Create `src/ui/components/dropdown-menu.tsx`:

```tsx
export * from '@radix-ui/react-dropdown-menu';
```

Create `src/ui/components/dialog.tsx`:

```tsx
export * from '@radix-ui/react-dialog';
```

Create `src/ui/components/toast.tsx`:

```tsx
export { Toaster, toast } from 'sonner';
```

- [ ] **Step 5: Run lint**

Run:

```bash
pnpm run lint
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/ui/lib src/ui/components
git commit -m "Add redesign base components"
```

## Task 6: Add Shell and Assistant Foundations

**Files:**
- Create: `src/ui/shell/app-shell.tsx`
- Create: `src/ui/shell/login-shell.tsx`
- Create: `src/ui/shell/pre-login-settings-shell.tsx`
- Create: `src/ui/assistant/assistant-panel.tsx`
- Create: `src/ui/user/user-menu.tsx`

- [ ] **Step 1: Create app shell**

Create `src/ui/shell/app-shell.tsx`:

```tsx
import type { ReactNode } from 'react';
import { cn } from '@/ui/lib/cn';

export type AssistantState = 'expanded' | 'collapsed' | 'hidden';

interface AppShellProps {
  nav: ReactNode;
  userMenu: ReactNode;
  children: ReactNode;
  assistant?: ReactNode;
  assistantState?: AssistantState;
}

export function AppShell({
  nav,
  userMenu,
  children,
  assistant,
  assistantState = 'expanded',
}: AppShellProps) {
  return (
    <div
      className={cn(
        'grid h-full min-h-0 bg-vd-bg text-vd-text',
        assistantState === 'expanded' && 'grid-cols-[76px_minmax(0,1fr)_314px]',
        assistantState === 'collapsed' && 'grid-cols-[76px_minmax(0,1fr)_64px]',
        assistantState === 'hidden' && 'grid-cols-[76px_minmax(0,1fr)]',
      )}
    >
      <aside className="flex min-h-0 flex-col items-center gap-3 bg-vd-rail px-2 py-3 text-vd-panel">
        {nav}
        <div className="flex-1" />
        {userMenu}
      </aside>
      <main className="min-w-0 overflow-hidden p-5">{children}</main>
      {assistantState !== 'hidden' && (
        <aside className="min-w-0 border-l border-vd-border bg-vd-panel/70">{assistant}</aside>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create login shell**

Create `src/ui/shell/login-shell.tsx`:

```tsx
import type { ReactNode } from 'react';

interface LoginShellProps {
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

export function LoginShell({ header, children, footer }: LoginShellProps) {
  return (
    <div className="grid h-full min-h-[560px] grid-rows-[auto_1fr_auto] gap-5 bg-vd-bg p-6 text-vd-text">
      <header>{header}</header>
      <main className="flex min-h-0 flex-col justify-center">{children}</main>
      <footer>{footer}</footer>
    </div>
  );
}
```

- [ ] **Step 3: Create pre-login settings shell**

Create `src/ui/shell/pre-login-settings-shell.tsx`:

```tsx
import type { ReactNode } from 'react';

interface PreLoginSettingsShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function PreLoginSettingsShell({ sidebar, children }: PreLoginSettingsShellProps) {
  return (
    <div className="grid h-full min-h-[560px] grid-cols-[236px_minmax(0,1fr)] bg-vd-bg text-vd-text">
      <aside className="border-r border-vd-border bg-vd-panel p-5">{sidebar}</aside>
      <main className="min-w-0 overflow-hidden p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Create assistant panel**

Create `src/ui/assistant/assistant-panel.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/components/button';

interface AssistantPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AssistantPanel({ collapsed = false, onToggle }: AssistantPanelProps) {
  const { t } = useTranslation('assistant');

  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center gap-3 p-3">
        <Button aria-label={t('title')} onClick={onToggle} size="sm" variant="secondary">
          ?
        </Button>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-rows-[auto_auto_1fr_auto] gap-4 p-4">
      <div>
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <p className="mt-1 text-xs leading-5 text-vd-muted">{t('subtitle')}</p>
      </div>
      <div className="grid gap-2 text-xs">
        <div className="rounded-xl border border-vd-border bg-vd-panel p-3">{t('quick.connectionHelp')}</div>
        <div className="rounded-xl border border-vd-border bg-vd-panel p-3">{t('quick.openLogs')}</div>
        <div className="rounded-xl border border-vd-border bg-vd-panel p-3">{t('quick.reportFault')}</div>
      </div>
      <div />
      <Button onClick={onToggle} size="sm" variant="secondary">
        {t('actions.close', { ns: 'common' })}
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: Create user menu**

Create `src/ui/user/user-menu.tsx`:

```tsx
import * as DropdownMenu from '@/ui/components/dropdown-menu';

interface UserMenuProps {
  initials: string;
  name: string;
  email: string;
}

export function UserMenu({ initials, name, email }: UserMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={name}
          className="vd-focus-ring grid size-12 place-items-center rounded-2xl bg-vd-panel text-sm font-bold text-vd-rail"
          type="button"
        >
          {initials}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          className="z-50 w-72 rounded-2xl border border-vd-border bg-vd-panel p-2 text-vd-text shadow-xl"
          side="right"
          sideOffset={12}
        >
          <div className="border-b border-vd-border p-3">
            <div className="font-semibold">{name}</div>
            <div className="text-xs text-vd-muted">{email}</div>
          </div>
          <DropdownMenu.Item className="rounded-xl px-3 py-2 text-sm outline-none hover:bg-vd-panel-subtle">
            Personal information
          </DropdownMenu.Item>
          <DropdownMenu.Item className="rounded-xl px-3 py-2 text-sm outline-none hover:bg-vd-panel-subtle">
            Preferences
          </DropdownMenu.Item>
          <DropdownMenu.Item className="rounded-xl px-3 py-2 text-sm text-vd-danger outline-none hover:bg-vd-panel-subtle">
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

- [ ] **Step 6: Run lint**

Run:

```bash
pnpm run lint
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/ui/shell src/ui/assistant src/ui/user
git commit -m "Add redesign shell foundations"
```

## Task 7: Add Isolated Redesign Preview Route

**Files:**
- Create: `src/features/redesign-preview/index.tsx`
- Create: `src/features/redesign-preview/index.scss`
- Modify: `src/router/index.tsx`

- [ ] **Step 1: Create preview page**

Create `src/features/redesign-preview/index.tsx`:

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/components/button';
import { Input } from '@/ui/components/input';
import { Switch } from '@/ui/components/switch';
import { AssistantPanel } from '@/ui/assistant/assistant-panel';
import { AppShell } from '@/ui/shell/app-shell';
import { LoginShell } from '@/ui/shell/login-shell';
import { PreLoginSettingsShell } from '@/ui/shell/pre-login-settings-shell';
import { UserMenu } from '@/ui/user/user-menu';
import { useUiTheme } from '@/ui/theme/use-ui-theme';
import './index.scss';

function NavButton({ active, children }: { active?: boolean; children: string }) {
  return (
    <button
      className={active ? 'preview-nav-button preview-nav-button-active' : 'preview-nav-button'}
      type="button"
    >
      {children}
    </button>
  );
}

export function RedesignPreview() {
  const { t, i18n } = useTranslation(['common', 'assistant']);
  const { mode, setMode } = useUiTheme();
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);

  return (
    <div className="redesign-preview">
      <section className="preview-window preview-login">
        <LoginShell
          footer={
            <div className="preview-row">
              <span>{i18n.language}</span>
              <span>Hangzhou gateway · {t('status.online')}</span>
            </div>
          }
          header={
            <div className="preview-row">
              <div className="preview-logo">V</div>
              <Button
                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                size="sm"
                variant="secondary"
              >
                {mode}
              </Button>
            </div>
          }
        >
          <h1>Viridian Desk</h1>
          <p>{t('assistant:subtitle')}</p>
          <div className="preview-form-card">
            <Input placeholder="alex@example.com" />
            <Input placeholder="Password" type="password" />
            <Button>{t('actions.open')}</Button>
          </div>
        </LoginShell>
      </section>

      <section className="preview-window preview-settings">
        <PreLoginSettingsShell
          sidebar={
            <div className="preview-stack">
              <Button size="sm" variant="secondary">
                Back to login
              </Button>
              <h2>Settings</h2>
              <NavButton active>Gateway</NavButton>
              <NavButton>Language</NavButton>
              <NavButton>Theme</NavButton>
            </div>
          }
        >
          <h2>Server and gateway</h2>
          <p className="preview-muted">Pre-login settings use a separate two-column shell.</p>
          <div className="preview-card">
            <div className="preview-row">
              <span>Auto gateway</span>
              <Switch defaultChecked />
            </div>
            <div className="preview-row">
              <span>Default server</span>
              <span>desk.viridian.local</span>
            </div>
          </div>
        </PreLoginSettingsShell>
      </section>

      <section className="preview-window preview-app">
        <AppShell
          assistant={
            <AssistantPanel
              collapsed={assistantCollapsed}
              onToggle={() => setAssistantCollapsed((value) => !value)}
            />
          }
          assistantState={assistantCollapsed ? 'collapsed' : 'expanded'}
          nav={
            <>
              <div className="preview-logo">V</div>
              <NavButton active>桌</NavButton>
              <NavButton>用</NavButton>
              <NavButton>设</NavButton>
            </>
          }
          userMenu={<UserMenu email="alex@example.com" initials="AZ" name="Alex Zhang" />}
        >
          <div className="preview-row">
            <div>
              <h2>Workspace</h2>
              <p className="preview-muted">Three-column app shell with collapsible assistant.</p>
            </div>
            <Button onClick={() => setAssistantCollapsed((value) => !value)} variant="secondary">
              Toggle assistant
            </Button>
          </div>
          <div className="preview-hero">
            <h3>Research desktop is ready</h3>
            <p>Gateway latency is 12 ms. Certificate and client services are healthy.</p>
            <Button>Connect</Button>
          </div>
        </AppShell>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Create preview styles**

Create `src/features/redesign-preview/index.scss`:

```scss
.redesign-preview {
  display: grid;
  gap: 24px;
  height: 100%;
  overflow: auto;
  padding: 32px;
  background: var(--vd-color-bg);
  color: var(--vd-color-text);
}

.preview-window {
  overflow: hidden;
  border: 1px solid var(--vd-color-border);
  border-radius: 24px;
  background: var(--vd-color-panel);
  box-shadow: var(--vd-shadow-window);
}

.preview-login {
  max-width: 440px;
}

.preview-settings {
  min-height: 560px;
}

.preview-app {
  height: 700px;
}

.preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.preview-stack {
  display: grid;
  gap: 10px;
}

.preview-logo {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 14px;
  background: var(--vd-color-accent);
  color: var(--vd-color-rail);
  font-weight: 900;
}

.preview-form-card,
.preview-card,
.preview-hero {
  display: grid;
  gap: 12px;
  margin-top: 18px;
  border: 1px solid var(--vd-color-border);
  border-radius: 18px;
  background: var(--vd-color-panel);
  padding: 16px;
}

.preview-muted {
  color: var(--vd-color-muted);
}

.preview-nav-button {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: inherit;
  font-weight: 800;
}

.preview-nav-button-active {
  background: color-mix(in srgb, var(--vd-color-accent) 16%, transparent);
  color: var(--vd-color-accent);
}
```

- [ ] **Step 3: Add route**

Modify `src/router/index.tsx` imports:

```tsx
import { RedesignPreview } from '@/features/redesign-preview';
```

Add this route as a child of the root route, beside `login`:

```tsx
      {
        path: 'redesign-preview',
        element: <RedesignPreview />,
      },
```

- [ ] **Step 4: Run lint**

Run:

```bash
pnpm run lint
```

Expected: PASS.

- [ ] **Step 5: Run dev server and manually verify**

Run:

```bash
pnpm run dev
```

Open:

```text
http://localhost:1420/redesign-preview
```

Expected:

- Preview route renders.
- Theme toggle changes `document.documentElement.dataset.uiTheme`.
- Assistant toggle switches between expanded and collapsed layouts.
- User menu opens from the left rail avatar.

- [ ] **Step 6: Commit**

```bash
git add src/features/redesign-preview src/router/index.tsx
git commit -m "Add redesign preview route"
```

## Task 8: Final Phase 1 Verification

**Files:**
- Modify only files required by lint fixes discovered during verification.

- [ ] **Step 1: Run production build**

Run:

```bash
pnpm run build
```

Expected: PASS and `dist/` is produced.

- [ ] **Step 2: Run frontend lint again**

Run:

```bash
pnpm run lint
```

Expected: PASS.

- [ ] **Step 3: Check git status**

Run:

```bash
git status --short
```

Expected: no unstaged source changes except generated files intentionally ignored by `.gitignore`.

- [ ] **Step 4: Commit verification fixes if any**

If Step 1 or Step 2 required source fixes, stage the specific modified source files shown by `git status --short` and commit them. For this phase, expected source paths are under `src/`, `vite.config.ts`, `package.json`, or `pnpm-lock.yaml`.

```bash
git status --short
git add src vite.config.ts package.json pnpm-lock.yaml
git commit -m "Stabilize redesign UI infrastructure"
```

If no fixes were needed, do not create an empty commit.

## Self-Review

- Spec coverage: Phase 1 covers new dependencies, theme tokens, light/dark/system provider, i18n namespaces, base components, shells, assistant foundation, user menu foundation, and an isolated route for visual verification.
- Deferred spec items: login replacement, pre-login settings functionality, workspace resources, desktop/application lists, approvals, faults, peripherals, and message center remain in later phases by design.
- Type consistency: `UiThemeMode`, `AssistantState`, `Button`, `Input`, `Switch`, `AppShell`, `LoginShell`, `PreLoginSettingsShell`, `AssistantPanel`, and `UserMenu` are defined before they are used by the preview route.
- Verification: every implementation task ends with `pnpm run lint`; final verification includes `pnpm run build`.
