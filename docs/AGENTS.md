# Repository Guidelines

## Development Principles

**Frontend-First Development (MANDATORY)**: All new features must be built frontend-first. Build UI with mocks → define proto contracts based on UI needs → implement backend with TDD → integrate. This aligns development with user stories, prevents over-engineering, and ensures APIs match real requirements. Exception: foundational infrastructure may precede frontend.

**Request-Scoped Context (MANDATORY - Backend)**: We are mid-migration to AsyncLocalStorage-backed `RequestContext`. Fastify and background jobs use ALS today, but ConnectRPC auth handlers still pass `context` explicitly. Until auth moves onto ALS, continue passing `context` into services/validators per the documented service pattern, and keep `getContext()` usage limited to the entrypoints that already initialize ALS. The goal remains a generic `RequestContext` (not tied to ConnectRPC or Pino) with automatic log enrichment once the migration completes.

## Project Structure & Module Organization

Fox runs as a Turborepo monorepo with npm workspaces. The Fastify + Prisma API lives in `apps/manage-api`, Next.js frontends in `apps/manage-frontend` and `apps/guest-frontend`, and packages (`proto`, `ui`, `icons`, `supabase`) hold shared code. Generated RPC assets sit in `packages/proto/gen/**` and `apps/manage-api/src/gen/**`. Tests sit alongside API modules and frontend components as `*.test.ts(x)` files. Stage 1 refactors must uphold the `handler -> service -> dao` pattern with dedicated `mapper` modules so business logic stays provider-agnostic.

**DAO Pattern (MANDATORY)**: DAOs must be classes with explicit methods for each operation. All methods have explicit input/return types. Use Prisma select const pattern for DRY types (`const wholeVenueSelect = {...} as const; type WholeVenue = Prisma.VenueGetPayload<{select: typeof wholeVenueSelect}>`). All CUD operations (Create/Update/Delete) must log to audit trail with before/after state, entity type, operation, affected IDs, userId/staffId. Read operations do not require audit logging.

## Build, Test, and Development Commands

- `npm run dev` (all apps) or `npm run dev --workspace=<pkg>` (single workspace).
- `npm run start:api` runs migrations then boots the API; `npm run migrate:dev --workspace=apps/manage-api` applies schema changes.
- `npm run build`, `npm run lint`, and `npm run check-types` keep local work CI-ready.
- `npm run test --workspace=<app>` executes unit suites; `npm run test:coverage --workspace=apps/manage-api` tracks coverage.
- `npm run codegen --workspace=packages/proto` refreshes ConnectRPC clients.

## Coding Style & Naming Conventions

Biome controls formatting (2 spaces, width 100, double quotes, semicolons, ES5 trailing commas). Keep files in kebab-case, React components in PascalCase, constants in UPPER_SNAKE_CASE. Prefer `type` aliases, forbid `any`/`as any` and `@ts-ignore`, and remove `console.*` or `debugger`. UI copy stays in sentence case, forms use React Hook Form + `createZodResolver`, and shared primitives come from `@reserve/ui` plus `@reserve/icons`.

## Testing Guidelines

**TDD is MANDATORY for all backend changes.** Follow Red-Green-Refactor: write failing test → make it pass → refactor. Tests must be verified to fail before implementation. Split orchestration, data access, and mapping logic so DAOs and mappers earn focused unit tests. Unit tests MUST run in parallel (no DB access, all dependencies mocked). Integration/E2E tests MUST also run in parallel using dynamic IDs (UUIDs, timestamps) to prevent conflicts - sequential tests are slow and discourage test writing. Run `npm run test --workspace=apps/manage-api` before merging API work, track coverage using `npm run test:coverage --workspace=apps/manage-api`, and co-locate tests with their modules. Stage 2 adds disposable DB + RPC harness - prepare suites to plug in.

## Commit & Pull Request Guidelines

Use short, imperative commit subjects. PRs must ship green lint/type/test checks, call out migrations, and attach UI screenshots when applicable. When closing Stage milestones, update the progress log in `docs/FINAL_PROD_READINESS_DOC.md` and log open questions for Mr Yum.

## Production Readiness Priorities

Stage 0 guardrails: rotate exposed secrets, enforce per-env CORS, tighten Fastify rate limits and security headers, enable dependency scanning, and keep CI green. Stage 1: uphold the modular service pattern, add ConnectRPC auth/error middleware, abstract providers, seed Redis groundwork, and eliminate magic numbers or weak typing. Stage 2 lands the integration harness, Redis-backed sessions, platform health checks, and automated deploys; Stage 3 layers load testing, tracing, Datadog log shipping, RUM, audit logging, and alerting. Align work with this sequence before merging.
