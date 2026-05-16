# Frontend Redesign Phase 3C Application Design

## Goal

Phase 3C redesigns the virtual application page inside the new logged-in shell. The selected direction is "application workbench card flow": a compact command header, horizontal category filters, and readable app cards optimized for launching applications quickly.

The redesign must preserve current application behavior and service calls. It should improve clarity, density, accessibility, theme support, and internationalization without introducing new backend assumptions.

## Scope

This phase covers `/app/application` only:

- User-added application list loaded with `listVapp({ isAdded: true })`.
- Category filtering using the existing application categories.
- Add from system applications with search, category filtering, pagination, row selection, and `addVapp`.
- Custom publish with desktop selection, app name, icon selection, executable path, category, description, and `createVapp`.
- Launching an application through the existing `connectVapp` path.
- Details, remove system favorite, and delete custom application actions.

Recent apps, recommendations, telemetry, and assistant-driven automation are out of scope because the current page does not expose those data sources.

## Approved Layout

Use a card-based workbench:

- Header: page title, concise summary count, explicit refresh action wired to the current list request, and two primary actions: favorite system app and publish custom app.
- Category filter: horizontal segmented control for all existing categories. It must handle long English labels and narrow widths without clipping.
- App grid: responsive cards with icon, app name, category, mode, source, and target desktop or desktop pool when available.
- Card actions: click or explicit primary control launches the app; secondary menu exposes details and remove/delete.
- Empty state: explain that no apps match the current category and show the relevant add actions when permissions allow.
- Loading state: preserve list loading behavior and use card-scoped launch feedback so launching one app does not visually block every card.

The page should remain visually consistent with Phase 3A+3B: dark professional console by default, restrained borders, compact spacing, and no marketing-style hero area.

## Component Design

Add a redesigned presentation layer under the application page rather than rewriting business logic. The current `Application` container should keep ownership of modal visibility, category state, loading state, refresh, and service handlers.

Recommended component boundaries:

- `RedesignApplicationPage`: page header, filter state wiring, loading/empty/content layout.
- `RedesignApplicationGrid`: responsive grid and permission-aware add entry placement.
- `RedesignApplicationCard`: app summary, launch action, and secondary menu.
- Existing modal internals may be reused first, then given scoped visual polish if they clash with the new shell.

Avoid coupling the application page to desktop page internals. Shared visual primitives can come from the existing redesign UI layer when they are already stable.

## Theme And I18n

All new copy must use i18next keys. Add both Simplified Chinese and English strings, and keep Traditional Chinese compatible with the current fallback model.

Styles must support light and dark themes through the existing CSS variable approach used in the redesign. Dark mode remains the visual target; light mode must be usable, readable, and free of low-contrast text.

## Error Handling And Permissions

Continue using existing `message`, confirm modal, and loading helpers. Do not introduce new error surfaces unless required by the redesigned layout.

Permission checks must match current behavior:

- Hide or disable add-from-system and custom-publish actions according to existing action permissions.
- Keep remove/delete options aligned with the current system-vs-user publish type logic.
- Keep delete confirmation text explicit about the selected app.

## Testing

Verification must include:

- `pnpm run lint`
- `pnpm run build`
- Browser smoke for `/app/application` in the new shell.
- Checks for dark and light theme rendering.
- Checks for Chinese and English labels.
- Manual checks for category filter, add system modal, custom publish modal, details modal, launch click, remove favorite, and delete custom application.

If modal styling is changed, verify that table pagination, form validation, icon selection, and dropdown placement still work in the Tauri-sized desktop window.
