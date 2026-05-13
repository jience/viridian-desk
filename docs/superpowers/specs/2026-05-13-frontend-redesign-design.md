# Viridian Desk Frontend Redesign Design

## Summary

Viridian Desk will be redesigned as a simpler, more human desktop application while preserving the existing product capabilities. The redesign will replace the AntD-based UI with a new design system and a staged migration path, so the product can move to a new experience without dropping core workflows.

The default visual direction is a "quiet operations workspace": a warm light interface, dark compact navigation rail, restrained accent color, clear hierarchy, and low-friction desktop interactions. A dark professional console theme will be supported as a secondary theme, not the default product mood.

## Goals

- Preserve existing functional coverage: login flows, cloud desktops, applications, peripherals, approvals, faults, messages, gateways, settings, updates, diagnostics, and user account actions.
- Replace AntD in the redesigned frontend rather than retheming it.
- Improve usability through clearer navigation, better window sizing, consistent states, and simpler task flows.
- Support light, dark, and system themes.
- Keep internationalization for Simplified Chinese, Traditional Chinese, and English.
- Add a first-phase local assistant for guidance, diagnostics entry points, and contextual help.

## Non-Goals

- Do not connect the assistant to a cloud AI model in phase one.
- Do not rewrite Tauri/Rust business capabilities unless required by the new UI.
- Do not keep AntD as a long-term dependency in the redesigned UI.

## Technical Stack

The redesigned frontend will use:

- React, Vite, and TypeScript as the application base.
- shadcn/ui and Radix UI for accessible, source-owned UI primitives.
- Tailwind CSS v4 and CSS variables for design tokens and theming.
- TanStack Query, Table, and Virtual for data loading, tables, lists, and virtualization.
- React Hook Form and Zod for form state and validation.
- Framer Motion for controlled micro-interactions and panel transitions.
- i18next for three-language internationalization.

Redux Toolkit can remain temporarily for existing shared state, but new feature state should be smaller and colocated where possible.

## Information Architecture

### Before Login

The login page remains independent from the main app shell. It contains login method selection, account inputs, password/phone/domain/IAM/third-party authentication flows, remember password, auto login, QR login, verification, SMS, one-time password, and password recovery.

Login settings are opened from the login page and use a lightweight two-column settings shell, not the main three-column app layout. This area includes server and gateway configuration, language, theme, network settings, security-password verification when enabled, diagnostics, and about/version information.

### After Login

The main app uses a three-zone desktop layout:

- Left compact navigation rail for global modules and the user menu.
- Center workspace for the active task.
- Right assistant panel for status, guidance, shortcuts, and diagnostics.

Primary navigation modules are:

- Workspace: overview, recent connections, resource health, gateway state, quick diagnostics.
- Desktops: desktop list, connection actions, detail entry points.
- Applications: virtual and remote application list, launch, search, filters.
- Peripherals: USB and device settings.
- Approvals: approval list, detail, create/cancel/approval actions.
- Faults: fault list, create fault, diagnostics and log assistance.
- Settings: server, common, advanced, and about sections.

The user account entry is the avatar at the bottom of the left rail. It opens a menu for personal information, password change, message center, preferences, lock client, and logout. This entry must not depend on the assistant panel because the assistant can collapse.

## Layout Behavior

The recommended default window size is approximately `1240x780`. The minimum usable width should be no lower than about `1040px`.

The assistant has three states:

- Expanded: default for workspace, desktops, applications, and diagnostics.
- Collapsed: default for approvals, faults, settings, details, and dense table/form pages.
- Hidden: used when the window is too narrow or the user explicitly closes it, while keeping an obvious reopen control.

Login settings do not show the main navigation rail or assistant panel.

## Design System

The design system should be implemented under new UI-focused modules such as `src/ui`, `src/app-shell`, and `src/features`.

Core components:

- Button, IconButton, Input, PasswordInput, Select, Checkbox, Switch, Tabs.
- Dialog, Sheet, Dropdown, Tooltip, Toast.
- DataTable, Pagination, EmptyState, Skeleton, StatusBadge.
- ResourceCard, SettingsRow, AppShell, LoginShell, SettingsShell.
- AssistantPanel and UserMenu.

All components must define hover, active, focus, disabled, loading, empty, and error states where applicable. Icon-only controls need `aria-label` or tooltip text. Motion should be restrained, typically 150-240 ms, and used for page transitions, dialogs, sheets, assistant collapse/expand, and list entry.

## Theme Design

Theme modes are `light`, `dark`, and `system`.

The light theme is the default: warm neutral surfaces, dark navigation rail, high legibility, and a small amount of accent color for current navigation, primary actions, and important status.

The dark theme keeps the same information architecture but uses a professional console treatment: low-saturation dark surfaces, stronger status contrast, and careful readability for forms and settings.

Theme tokens should include background, panel, text, muted text, border, accent, success, warning, error, shadow, and focus ring. Login, settings, app shell, dialogs, tables, toasts, and assistant content all consume the same tokens.

## Internationalization

The redesign keeps `zh-CN`, `zh-TW`, and `en-US`.

New UI copy must go through i18next and should not hardcode Chinese or English. Locale content should be organized into namespaces such as:

- `common`
- `auth`
- `workspace`
- `resources`
- `settings`
- `assistant`
- `errors`

Language switching is available before login and after login through preferences. Changes apply immediately to visible UI, dialogs, toasts, and validation messages.

## Local Assistant

Phase one assistant is local-only. It does not call OpenAI, private models, or any cloud AI endpoint.

The assistant provides:

- Gateway, network, certificate, and client-service status explanations.
- Connection failure troubleshooting steps.
- Shortcuts to logs, diagnostics, fault submission, and related settings.
- Page-aware suggestions, such as pinning frequent desktops or opening diagnostics from a failed connection state.
- A local knowledge structure that can later be replaced or augmented by an AI provider.

The assistant architecture should reserve an interface for future AI providers, but provider integration is out of scope for phase one.

## Migration Plan

### Phase 1: UI Infrastructure

Install and configure the new UI stack. Create the design system, theme tokens, i18n namespaces, base components, shell components, dialogs, sheets, dropdowns, toasts, and assistant foundation. Remove AntD global theme entry points from the redesigned shell.

### Phase 2: Login and Pre-Login Settings

Replace the login page and login-related dialogs. Build the independent pre-login settings shell for server, gateway, language, theme, diagnostics, and about information.

### Phase 3: Main Shell and Core Resources

Build the new app shell, left navigation, window controls, user menu, workspace, desktop list, application list, gateway status, message entry, and local assistant.

### Phase 4: Complex Business Modules

Replace remaining complex modules with the new component system: peripherals, approvals, faults, desktop details, message center, settings subpages, tables, filters, detail panels, and create/edit flows.

## Testing and Verification

Each phase must run:

- `pnpm run lint`
- `cd src-tauri && cargo test` when Tauri/Rust behavior is touched

Manual regression must cover login, gateway selection, desktop connection, application launch, logout, theme switching, language switching, assistant expand/collapse, user menu, and window resizing.

For each migrated module, keep a functional checklist against the current implementation to confirm no entry point or critical operation was lost.
