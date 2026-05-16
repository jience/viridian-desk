# Frontend Redesign Phase 3F Settings Design

## Goal

Phase 3F redesigns `/configPage` as the login-time settings center for Viridian Desk. The approved direction is a section workbench: persistent left navigation, focused right-side settings content, and a restrained desktop control-console visual language.

The redesign must preserve current settings behavior and native service calls while making server, common, advanced, and about settings feel like one coherent product surface.

## Scope

This phase covers the pre-login settings experience only:

- Keep `/configPage` as the active redesigned settings route.
- Keep `legacy-configPage` available as the fallback route.
- Redesign the settings shell, navigation, and page header.
- Redesign the visible presentation of `serverSetting`, `commonSetting`, `advancedSetting`, and `about`.
- Preserve current gateway, language, theme, auto-start, full-screen, auto-update, diagnosis, network, developer mode, logs, version, update, license, and copyright behavior.

Logged-in user profile management, an app-wide assistant rail, new settings search, new backend APIs, and deep rewrites of native bridge logic are out of scope.

## Approved Layout

Use layout option A: left settings navigation plus right workbench.

- Sidebar: compact settings brand, four primary entries, active state, and stable icon/text alignment.
- Header: current section title, short contextual subtitle or status, and the existing exit/back action.
- Content: each section uses dense setting groups, readable rows, and clear actions. Avoid large marketing heroes and nested card stacks.
- Server: gateway list workbench with add gateway action, current gateway status, address visibility behavior, and edit/default/delete actions.
- Common: grouped preference rows for auto-start, full screen, auto update, language, and theme.
- Advanced: grouped operational rows for diagnosis, network info, developer mode, and logs when developer mode is enabled.
- About: version information, update action, license content, and copyright in a calmer information layout.

The visual direction remains dark professional console with a readable light theme. Use scoped variables, restrained borders, compact spacing, consistent focus states, and no decorative orb/radial backgrounds.

## Component Design

Reuse existing business logic and native integrations. The change should primarily introduce or update presentation components.

Recommended boundaries:

- `src/pages/configPage/redesign/`: settings shell, navigation metadata, header composition, and route outlet frame.
- Shared settings presentation helpers under `src/pages/configPage/redesign/` or a small local `components/` folder if needed.
- Existing subpage modules remain responsible for their behavior, but their markup and styles may be refactored into the new workbench pattern.
- Existing modals such as `FormModal` and `ServerEditModal` should remain functionally compatible.

Do not replace gateway Redux flows, native bridge calls, update checks, diagnosis calls, or existing language/theme mechanisms unless a compile or integration issue requires a narrow fix.

## Data And State

The settings shell should derive active section from the current route instead of maintaining a separate tab state that can drift. Route navigation must continue to support:

- `/configPage/serverSetting`
- `/configPage/commonSetting`
- `/configPage/advancedSetting`
- `/configPage/about`

The exit action should preserve the current pre-login behavior and navigate back to `/login`. Future source-aware return behavior is out of scope for this phase.

Each subpage should keep its current selectors, dispatches, refs, and native calls. Visual wrappers should receive explicit data and callbacks where extraction is useful, rather than reaching into unrelated global state.

## Theme And I18n

All new labels must use existing `react-intl` or `react-i18next` keys where practical. Add entries to `src/locales/zh-CN.js`, `src/locales/en-US.js`, and `src/locales/zh-TW.js` only for new settings workbench copy.

The redesign must respect existing theme switching. Styles should use scoped page variables for light and dark themes and avoid leaking AntD overrides outside the settings page.

Language and theme controls must preserve their current behavior, including any existing redirect or reset behavior after language changes.

## Error Handling And Permissions

Continue using existing AntD modal/message and app request patterns. Do not introduce a new notification system.

Preserve current destructive-action safeguards:

- Gateway delete keeps confirmation modal behavior.
- Default gateway cannot be deleted through the normal action path.
- Gateway add/edit keeps `ServerEditModal` validation and payload shape.
- Diagnosis, logs, update, and network operations keep their current loading/error behavior.

If the redesign changes button placement, disabled states and confirmation wording must remain functionally equivalent.

## Testing

Verification must include:

- `pnpm run lint`
- `pnpm run build`
- Manual smoke for `/configPage/serverSetting`, `/configPage/commonSetting`, `/configPage/advancedSetting`, and `/configPage/about`.
- Add, edit, set default, and delete gateway UI paths where native/test data is available.
- Language and theme controls in Chinese, English, and Traditional Chinese.
- Light and dark theme readability.
- Narrow desktop window checks for navigation/content overflow.
- About and advanced pages in web mode where possible, with Tauri runtime checks noted when native bridge coverage is required.
