# Frontend Redesign Phase 3A+3B Design

## Goal

Phase 3A+3B redesigns the logged-in desktop workspace around a dark professional console while preserving existing desktop resource behavior. Phase 3A establishes the shared app shell. Phase 3B adapts the desktop and desktop detail workflows into that shell without rewriting the underlying service logic.

## Scope

Phase 3A covers the logged-in shell used by `/app/*`: compact navigation rail, central workspace frame, collapsible right assistant panel, user entry, message entry, power action, gateway status placement, theme consistency, i18n, route gating, and rollback.

Phase 3B covers the desktop resource workspace: desktop list, desktop pool creation area, desktop loading/empty/disabled/locked/connecting states, common desktop actions, and desktop detail shell integration. It preserves existing functions for connect, restart, shutdown, detail navigation, snapshot-related flows, desktop pool creation, refresh, and disk detach.

Applications, peripherals, approvals, and faults remain in later phases. Their current pages should still render inside the new shell after Phase 3A.

## Approved Direction

The selected layout is the persistent assistant console:

- Left rail: compact icon navigation with active state and bottom system actions.
- Center: primary workspace with a consistent page header, action strip, scroll container, and footer/status area.
- Right: assistant panel, expanded by default and collapsible to a narrow strip.

The redesign is enabled by default, with an environment flag and legacy route fallback during migration. Old UI is not a long-term parallel mode; it will be removed in one cleanup pass after Phase 3A-3D are implemented and verified.

## Visual System

The visual direction remains a dark professional control console. Use charcoal/off-black surfaces, restrained borders, muted text, and one low-saturation green accent. Avoid decorative marketing layouts, oversized hero sections, nested cards, and generic three-card rows. The UI should feel operational: dense enough for repeated daily work, but not cramped.

Motion should be subtle and GPU-safe: opacity/transform transitions, active press feedback, and small assistant collapse/expand animations. Do not animate layout-critical dimensions with JavaScript. Avoid adding new animation libraries for this phase.

## Phase 3A Shell Design

The new app shell should reuse and harden the existing redesign primitives where possible:

- `AppShell` becomes the logged-in layout foundation.
- The rail contains navigation from the current `Sidebar` menu data: desktop, application, peripheral, approval, malfunction.
- Bottom rail actions preserve existing message, user, and shutdown behavior.
- User information remains reachable from the user menu. Password change, phone change, logout, forced password-change modal, and different-location login warning continue to work.
- Gateway status moves into a stable workspace footer or header-adjacent status area using the current `GatewaySelect readonly` behavior.
- Assistant panel MVP exposes fixed workflow actions: connection help, open diagnostic logs, submit fault report, and status guidance. It does not call a large model or infer from selected resources in this phase.

The shell should route `/app/*` to the new layout by default. A feature flag should allow disabling the Phase 3 shell while the migration is active, and legacy app routes should remain available for rollback until final cleanup.

## Phase 3B Desktop Workspace Design

The desktop page should keep its existing data hooks and action handlers. The implementation should separate presentation from behavior by wrapping current data in redesigned view components rather than rewriting service calls.

Desktop resources should be shown as clear resource cards with:

- Status and lock/default indicators.
- Desktop name and type.
- OS/icon treatment from existing helpers.
- Primary connect action.
- Secondary actions for restart, shutdown, detail, and existing authorized menu actions.
- Disabled affordance for stopped, locked, or unauthorized actions.

Desktop pools should appear in a distinct "available to create" section so users can tell existing desktops from provisionable resources. Refresh actions and loading state should be visible in the page header/action strip.

Desktop detail should first receive the shared shell treatment: consistent title, action area, and content frame. Snapshot, disk, and connection subsections can keep current internals in this phase unless a layout issue blocks integration.

## States

Phase 3B must explicitly cover these states:

- Loading desktop and desktop pool data.
- Empty desktop list with a clear next action.
- Desktop disabled/stopped.
- Desktop locked.
- Connecting/loading desktop.
- Desktop action errors using existing message/modal mechanisms.

The shell must also handle assistant expanded/collapsed states and narrow viewport fallback. On small widths, the assistant should collapse or hide before the main workspace becomes unusable.

## Rollback And Cleanup

Phase 3A+3B should follow the Phase 2 pattern:

- New UI is default.
- A feature flag can disable the new logged-in shell.
- Legacy paths remain available while Phase 3 is incomplete.
- Old UI cleanup is deferred until Phase 3A-3D are complete and verified, then removed in one explicit cleanup phase.

## Testing

Verification must include:

- `pnpm run lint`
- `pnpm run build`
- Browser smoke checks for `/app/desk`, `/app/application`, `/app/deskDetail`, and legacy rollback routes.
- Manual or automated checks for assistant collapse/expand, active navigation, user menu actions, logout navigation, message entry, gateway footer/status, and desktop primary actions.

Tauri desktop validation should follow browser smoke checks because window sizing, drag regions, and native commands can differ from Vite-only behavior.
