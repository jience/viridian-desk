# Frontend Redesign Phase 3E Approval Design

## Goal

Phase 3E redesigns `/app/approval` as an approval workbench inside the redesigned logged-in shell. The approved direction is a table-first workflow console: compact command header, status filtering, readable approval table, and clear actions for refresh, cancel, detail, and workflow creation.

The redesign must preserve current workflow behavior and service calls while improving layout consistency, theme support, responsive behavior, and day-to-day usability.

## Scope

This phase covers the user approval page only:

- List workflows with `listWorkflow`.
- Filter the current list by workflow status.
- Refresh the current query.
- Cancel one or more pending workflows with the existing `CancelWorkflow` modal and `cancelWorkflow` flow.
- Open the existing `Create` modal for workflow creation.
- Open the existing `ApprovalDetailModal` for row details.
- Preserve table pagination and current permission behavior.

Approval detail internals, workflow creation form internals, approval backend APIs, admin approval processing, and new assistant automation are out of scope.

## Approved Layout

Use the approval workbench layout:

- Header: page title, total count, pending count, refresh action, batch cancel action, and primary create workflow action.
- Filters: desktop segmented status controls for all, pending, processing, success, reject, error, and revoke. Collapse to compact selects only when width would clip labels.
- Table: keep a dense operational table for workflow template, approver, status, apply time, and actions.
- Status treatment: use clear visual tokens for pending, processing, success, reject, error, and revoke.
- Row actions: preserve detail and single cancel actions, with cancel disabled for non-pending rows.
- Empty state: show a composed empty state with create workflow action when permitted.
- Modals: reuse `Create`, `CancelWorkflow`, and `ApprovalDetailModal` first. Visual polish is allowed only when it does not change validation, request payloads, or modal lifecycle.

The page should match the Phase 3 desktop, application, and malfunction workbenches: dark professional console by default, readable light theme, scoped styles, no decorative orb/radial backgrounds, no marketing hero sections.

## Component Design

Keep `src/pages/approval/index.tsx` as the data controller. It should continue to own query params, selected rows, workflow list, modal visibility, cancel tips, current user filtering, service handlers, and modal refs.

Add a redesigned presentation layer under `src/pages/approval/redesign/`:

- `RedesignApprovalPage`: header, status filters, table frame, empty/loading layout, and action wiring.
- Small local helpers for status labels, workflow template labels, pending count, and action availability if needed.

Do not rewrite `Create`, `CancelWorkflow`, or `ApprovalDetailModal` unless integration exposes a concrete compile or layout issue. Keep existing `useRequest`, permission checks, and API contracts.

## Data And State

The redesigned page must receive controller-owned data through explicit props:

- current status filter
- status options and status label maps
- workflow rows, selected row keys, selected row data, total, pending count, loading, and pagination
- handlers for refresh, filter changes, create, single/batch cancel, details, pagination, and row selection

List refreshes should guard against stale responses when refresh, filter changes, or pagination happen quickly. Selection should be cleared when a reset, filter change, or successful cancel makes selected rows invalid.

## Theme And I18n

New copy must use existing `react-intl` message IDs where practical. Add new legacy locale entries in `src/locales/zh-CN.js`, `src/locales/en-US.js`, and `src/locales/zh-TW.js` only for genuinely new labels.

The workflow template mapping currently contains hardcoded Chinese labels in `workflowTempList_zh_Cn`. This phase must introduce a view-level label helper that maps known workflow types to existing `react-intl` IDs. It must preserve fallback behavior for unknown workflow types.

Styles must support light and dark themes using scoped page-level variables, matching the malfunction workbench approach.

## Error Handling And Permissions

Continue using existing modal, message, and request mechanisms. Do not add a new notification system.

Permission behavior must remain equivalent:

- Hide or disable batch and row cancel actions according to `Actions.TerminalRWApplyManageCreateOrCancel`.
- Hide create workflow action according to `Actions.TerminalRWApplyManageCreateOrCancel`.
- Hide or disable read/detail behavior according to `Actions.TerminalROApplyManageRead`.
- Disable cancel for non-pending workflows.

## Testing

Verification must include:

- `pnpm run lint`
- `pnpm run build`
- Browser smoke for `/app/approval` in the redesigned shell.
- Checks for status filtering, refresh, create modal opening, single and batch cancel confirmation, detail modal opening, pagination, empty state, and pending-only cancel disablement.
- Checks for Chinese, English, and Traditional Chinese labels.
- Checks for light and dark theme readability and no toolbar overflow with the assistant panel expanded.
