# Frontend Redesign Phase 3D Malfunction Design

## Goal

Phase 3D redesigns `/app/malfunction` as a fault workbench inside the redesigned logged-in shell. The selected direction is a table-first control console: compact command header, type/status filters, readable fault table, and clear actions for refresh, revoke, and fault creation.

The redesign must preserve current fault behavior and service calls while improving layout, theme consistency, responsive behavior, and assistant alignment.

## Scope

This phase covers the user fault page only:

- List faults with `listFault`.
- Filter by existing fault type and fault status options.
- Refresh the current query.
- Revoke one or more eligible faults with the existing confirmation behavior and `revokeFault`.
- Create faults with existing fields: fault type, desktop selection when applicable, and description.
- Preserve solved/rejected reply popovers and table pagination.

Approval, peripheral settings, admin-side fault processing, and a new diagnostic wizard are out of scope. The assistant may link conceptually to fault workflows, but this phase does not add LLM behavior or automate diagnostics.

## Approved Layout

Use the fault workbench layout:

- Header: page title, current result count, refresh action, revoke action, and primary create fault action.
- Filters: use horizontal segmented controls for fault type and status on desktop widths. Collapse them to compact selects only when the available width would clip Chinese or English labels.
- Table: keep a dense operational table for description, type, status, processor, report time, and actions.
- Status treatment: use clear tokens for pending, solved, rejected, and revoked states. Existing popover details for solved/rejected replies remain available.
- Empty state: show a composed empty state with create fault action when permitted.
- Create modal: reuse the existing modal/form behavior first; visual polish is allowed only when it does not alter validation or submission.

The page should match the existing Phase 3 shell, desktop, and application redesigns: dark professional console by default, readable light theme, scoped styles, no decorative orb/radial backgrounds, no marketing hero sections.

## Component Design

Keep `src/pages/malfunction/index.tsx` as the data controller. It should continue to own query params, selected rows, fault list, modal visibility, desktop options, and service handlers.

Add a redesigned presentation layer under `src/pages/malfunction/redesign/`:

- `RedesignMalfunctionPage`: header, filters, table frame, empty/loading layout, and action wiring.
- Small local helpers for status labels, table row state, and action availability if needed.

Do not rewrite `CreatedModal` or `BaseForm` unless integration exposes a concrete visual or layout issue. Keep current `useRequest`, `useLoading`, permission checks, and API contracts.

## Data And State

The redesigned page must receive controller-owned data through explicit props:

- current fault type and status filters
- fault type/status options and label maps
- rows, selected row keys, selected row data, total, loading, pagination
- handlers for refresh, filter changes, revoke, create, pagination, and row selection

List refreshes should guard against stale responses when filters or pages change quickly. Selection should be cleared when a reset or filter change makes the selected rows invalid.

## Theme And I18n

New copy must use existing `react-intl` message IDs where practical. Add new locale entries only for genuinely new labels. Chinese, English, and Traditional Chinese must remain consistent.

Styles must support light and dark themes. If the redesigned app shell variables are fixed to dark in this area, the malfunction page should define scoped page-level variables the same way the application workbench does.

## Error Handling And Permissions

Continue using existing modal, message, and request mechanisms. Do not add a new notification system.

Permission behavior must remain equivalent:

- Hide or disable revoke actions according to `Actions.TerminalRWMalfunctionCancel`.
- Hide create fault action according to `Actions.TerminalRWMalfunctionReport`.
- Keep read pagination behavior aligned with `Actions.TerminalROMalfunctionRead`.
- Disable revoke for solved, rejected, or revoked faults.

## Testing

Verification must include:

- `pnpm run lint`
- `pnpm run build`
- Browser smoke for `/app/malfunction` in the redesigned shell.
- Checks for type/status filtering, refresh, create modal opening, single and batch revoke confirmation, pagination, empty state, and solved/rejected popovers.
- Checks for Chinese and English labels.
- Checks for light and dark theme readability and no toolbar overflow with the assistant panel expanded.
