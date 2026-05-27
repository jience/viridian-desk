# Repository Guidelines

## Project Structure & Module Organization

Viridian Desk is a Tauri 2 desktop app with a React/Vite frontend. Frontend code lives in `src/`: startup, providers, routing, and layouts in `src/app`; thin route exports in `src/pages`; feature implementation in `src/features`; shared widgets in `src/shared/components`; Redux state in `src/store`; API/listener/command wrappers in `src/services`; the Tauri facade in `src/native`; design-system components, shell helpers, theme code, and shared UI locales in `src/shared/ui`; utilities in `src/utils`; styles in `src/styles`; assets and app locales in `src/assets`. Native Rust code is under `src-tauri/src`, grouped by domain (`app`, `config`, `core`, `events`, `plugins`). Tauri config, permissions, icons, sidecars, resources, and packaging files stay in `src-tauri/`. Build helpers are in `scripts/`; docs are in `docs/`.

## Build, Test, and Development Commands

Use `pnpm`; `pnpm-lock.yaml` is the lockfile.

- `pnpm install`: install frontend dependencies.
- `pnpm run dev`: generate i18n types, then start the Vite dev server.
- `pnpm run tauri dev`: run the full desktop app locally.
- `pnpm run lint`: generate i18n types, run ESLint, and run `tsc -b`.
- `pnpm run build`: lint, then build the Vite frontend.
- `pnpm run preview`: preview the production frontend build.
- `cd src-tauri && cargo test`: run Rust tests, including `src-tauri/tests`.
- `scripts/build.sh -v <version>`: package the desktop client; see `-h`.

## Coding Style & Naming Conventions

EditorConfig enforces LF files, final newlines, trimmed trailing whitespace, 2-space indentation by default, and 4-space indentation for Rust. Prettier uses 2 spaces, single quotes, and `printWidth: 100`; run `pnpm run prettier` before broad formatting. Prefer `.ts`/`.tsx`, PascalCase components, camelCase variables/functions, and `_` prefixes for intentionally unused parameters.

## Testing Guidelines

Validate frontend changes with `pnpm run lint`, targeted Playwright/static tests, and manual checks in `pnpm run tauri dev`. Add Rust integration tests under `src-tauri/tests` and unit tests beside Rust modules when changing native behavior. Name tests after the behavior verified.

## Commit & Pull Request Guidelines

Use concise imperative commits such as `Add gateway retry handling` or `Fix login error mapping`. Pull requests should include a summary, test results (`pnpm run lint`, `cargo test`, manual platform checks), linked issues, and screenshots or recordings for UI changes.

## Security & Configuration Tips

Treat files in `src-tauri/resources`, certificates, signing keys, and bundled binaries as sensitive. Do not commit new secrets or local environment files. When changing Tauri capabilities or shell sidecars, document why the permission is needed and test on the target platform.
