# blode-docs

Multi-tenant documentation platform — serve versioned MDX docs per tenant from a shared Next.js frontend backed by a Fastify API.

## Apps

| App         | Description                                                                  | Port |
| ----------- | ---------------------------------------------------------------------------- | ---- |
| `apps/docs` | Next.js documentation frontend with dynamic tenant routing and MDX rendering | 3001 |
| `apps/api`  | Fastify REST API for multi-tenant data, content, and Vercel Blob storage     | 3000 |

## Packages

| Package                   | Description                                 |
| ------------------------- | ------------------------------------------- |
| `@repo/contracts`         | Zod schemas shared between frontend and API |
| `@repo/db`                | Drizzle ORM setup and PostgreSQL migrations |
| `@repo/models`            | Core data models                            |
| `@repo/common`            | Shared utilities                            |
| `@repo/validation`        | Validation logic built on `@repo/models`    |
| `@repo/ui`                | Shared React component library              |
| `@repo/api-client`        | HTTP client utilities for consuming the API |
| `@repo/prebuild`          | Pre-build YAML processing                   |
| `@repo/previewing`        | Preview data handling                       |
| `@repo/docs-cli`          | CLI tool for docs operations                |
| `@repo/typescript-config` | Shared `tsconfig.json` configurations       |
| `@repo/deploy-action`     | Deployment automation helpers               |

## Requirements

- Node >= 18
- npm 10.9.3

## Quick Start

```sh
npm install
cp .env.example .env.local   # fill in DATABASE_URL, BLOB_READ_WRITE_TOKEN, etc.
npm run dev                  # docs → http://localhost:3001  api → http://localhost:3000
```

## Development

```sh
# All apps
npm run dev

# Single app
npx turbo run dev --filter=docs
npx turbo run dev --filter=api

# Build all
npm run build
```

## Testing

```sh
npm run test              # full suite: unit → component → integration → smoke → e2e
npm run test:unit         # Vitest unit tests
npm run test:component    # Vitest component tests
npm run test:integration  # Vitest integration tests
npm run test:smoke        # Vitest smoke tests
npm run test:e2e          # Playwright end-to-end tests
```

## Code Quality

```sh
npm run fix           # Ultracite auto-fix (lint + format)
npm run check         # Ultracite check without fixing
npm run check-types   # TypeScript type check across all workspaces
npm run lint          # Oxlint across monorepo
npm run format        # Oxfmt across monorepo
```
