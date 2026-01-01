# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed by Turbo; workspaces are defined in `package.json`.
- `apps/` contains product apps: `apps/docs`, `apps/web`, and `apps/dashboard`.
- `packages/` holds shared libraries and tooling, e.g. `packages/ui`, `packages/models`, `packages/common`, `packages/validation`, plus config packages like `packages/typescript-config`.
- Root configuration lives in `turbo.json`, `biome.json`, and `package.json`.

## Build, Test, and Development Commands
- `npm run dev` — runs all app/package dev servers via Turbo.
- `npx turbo run dev --filter=docs` — run a single app (use `web` or `dashboard` for other apps).
- `npm run build` — builds all packages/apps.
- `npm run lint` — Ultracite lint checks across the repo.
- `npm run lint:fix` — auto-fix lint issues via Ultracite.
- `npm run format` / `npm run format:check` — format or validate formatting.
- `npm run check-types` — TypeScript type checking across workspaces.

## Coding Style & Naming Conventions
- TypeScript-first; keep code compatible with Node >=18.
- Formatting and linting are enforced by Biome + Ultracite (`biome.json`) with 2-space indentation.
- Workspace folders use kebab-case names under `apps/` and `packages/`.
- Package names follow the `@repo/*` scope (see `packages/*/package.json`).

## Testing Guidelines
- No test runner is configured in this repo yet. Use `npm run check-types` for basic validation.
- If you add tests, prefer `*.test.ts` or `*.spec.ts` in the owning app/package and add a corresponding script so Turbo can run it.

## Commit & Pull Request Guidelines
- Recent commits mix conventional commits (`feat(scope): ...`) with sentence-case messages. Prefer conventional format with a scope matching the app/package.
- Husky + lint-staged run `biome check --write` on commit; keep changes formatted to avoid pre-commit failures.
- No PR template is present; include a short summary, testing notes, and screenshots for UI changes.

## Environment & Tooling
- Use npm (repo pins `npm@10.9.3`) and ensure Node >=18.
