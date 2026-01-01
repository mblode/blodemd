# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

**Monorepo Structure**: Turborepo with npm workspaces

- `apps/manage-api`: Backend API (Fastify, Prisma, Connect-RPC)
- `apps/manage-frontend`: Management dashboard (Next.js 15, React 19, TanStack Query)
- `apps/guest-frontend`: Guest-facing app (Next.js 15, React 19)
- `packages/proto`: Shared protobuf definitions
- `packages/ui`: Shared UI components
- `packages/icons`: Shared icon library

**Key Technologies**:

- TypeScript 5.8+
- Protobuf with Connect-RPC for API communication
- Prisma ORM for database
- Supabase for authentication and storage
- Stripe for payments
- Biome for linting and formatting
- Vitest for testing

## Essential Commands

```bash
# Development
npm run dev                    # Start all apps in dev mode
npm run dev --filter=manage-api       # Start only API
npm run dev --filter=manage-frontend  # Start only management frontend

# Build
npm run build                  # Build all apps
npm run build --filter=manage-api    # Build specific app

# Code Quality
npm run lint                   # Run Biome linter on all packages
npm run format                 # Format code with Biome
npm run check                  # Run Biome check (lint + format check)
npm run check-types            # Type-check all packages

# Testing
npm run test --workspace=apps/manage-api        # Run API tests
npm run test:watch --workspace=apps/manage-api  # Watch mode for API tests
npm run test:availability --workspace=apps/manage-api  # Run specific availability tests

# Database (API)
npm run migrate:dev --workspace=apps/manage-api    # Create/apply migrations
npm run migrate:deploy --workspace=apps/manage-api  # Deploy migrations to production
npm run gen:prisma --workspace=apps/manage-api     # Generate Prisma client

# Code Generation
npm run codegen                # Generate protobuf types
```

## Development Principles

### Frontend-First Development (MANDATORY)

**All new features MUST be built frontend-first.** This aligns development with user stories, not technical implementation.

**Workflow**:

1. **Frontend Prototype**: Build UI components with mock data first
2. **API Contract**: Define protobuf contracts based on actual UI needs
3. **Backend Implementation**: Create APIs to serve the established frontend requirements (using TDD)
4. **Integration**: Connect frontend to real backend

**Why**: Building frontend first reveals actual data structures and operations needed. Backend serves real needs rather than hypothetical requirements, preventing over-engineering and API mismatches. This keeps development user-centric.

**Exception**: Foundational infrastructure (auth, middleware, DB schema) may precede frontend when it blocks all features.

## Architecture Overview

### API Architecture (`apps/manage-api`)

- **Module-based structure**: Each feature in `src/modules/` contains its service, router, and related logic
- **Service pattern**: Business logic separated into service classes (e.g., `*.service.ts`)
- **Connect-RPC**: API endpoints defined via protobuf, handlers in `src/modules/*/`
- **Database**: Prisma ORM with PostgreSQL, schema at `apps/manage-api/prisma/schema.prisma`
- **Authentication**: Supabase JWT tokens validated in ConnectRPC middleware (see Middleware section below)
- **Background jobs**: BullMQ for async processing
- **Request Context**: Generic, technology-agnostic context via AsyncLocalStorage (see Request-Scoped Context below)

### Request-Scoped Context (CRITICAL - Read This!)

**All backend code MUST use a generic `RequestContext`** that is NOT tied to any specific technology (ConnectRPC, Pino, Fastify, etc.). Context is accessed via **Node.js AsyncLocalStorage** - NO explicit passing through function parameters.

**Key Requirements**:

- Generic `RequestContext` type containing request metadata (requestId, userId, staffId, organizationId, venueId, timestamp)
- ALL entrypoints (ConnectRPC, Fastify routes, BullMQ jobs, CLI scripts) MUST implement middleware to initialize AsyncLocalStorage context
- Context accessed anywhere via `getContext()` helper - NO explicit passing through layers
- Context is automatically attached to ALL logs (Pino reads from AsyncLocalStorage via mixin)
- Services MUST NOT use ConnectRPC-specific context directly - use `getContext()`

**AsyncLocalStorage Pattern**:

```typescript
import { AsyncLocalStorage } from "node:async_hooks";

// Singleton instance
const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

// Get context anywhere in the call stack
export function getContext(): RequestContext {
  const ctx = asyncLocalStorage.getStore();
  if (!ctx) throw new Error("No context available");
  return ctx;
}

// Middleware initializes context
async function handleRequest(req: Request) {
  const context = { requestId: generateId(), auth: extractAuth(req) };
  return asyncLocalStorage.run(context, async () => processRequest(req));
}

// Services use context without receiving it as parameter
class MyService {
  async doWork(params: Params) {
    const ctx = getContext(); // Available anywhere!
    logger.info("Doing work"); // Logger auto-reads ctx from AsyncLocalStorage
  }
}
```

**Benefits**:

- No context drilling: cleaner function signatures
- Technology-agnostic: business logic isn't tied to ConnectRPC
- Complete request tracing: every log includes requestId, userId, etc.
- Automatic isolation: AsyncLocalStorage handles concurrent requests
- Testable: easy to create mock contexts for testing
- Portable: can migrate from ConnectRPC to other transports without rewriting services

### ConnectRPC Middleware (CRITICAL - Read This!)

**All handlers MUST use the middleware stack**. The middleware handles authentication, authorization, error handling, context population, and logging automatically.

#### Handler Requirements

1. **Define a Route Policy** - Every endpoint MUST have an explicit policy:

   ```typescript
   export const myMethodPolicy: RoutePolicy = {
     audience: "guest", // guest (users table) | manage (staff table) | public (either)
     auth: "user", // none | optional | user | staff
   };
   ```

2. **NO Manual Auth** - Never call `getUser()` or `getStaff()` in handlers:

   ```typescript
   // ❌ WRONG
   const userSession = await getUser(context);

   // ✅ CORRECT
   import { requireUserAuth } from "@/lib/server/middleware";
   const { userId } = requireUserAuth(context);
   ```

2a. **Use AsyncLocalStorage Context** - Services use `getContext()`, not explicit parameters:

```typescript
// ❌ WRONG - Explicit context passing (old pattern)
class MyService {
  async doWork(ctx: RequestContext, params: Params) {
    logger.info({ ...ctx }, "Doing work");
  }
}

// ✅ CORRECT - Use getContext() from AsyncLocalStorage
import { getContext } from "@/lib/context";

class MyService {
  async doWork(params: Params) {
    const ctx = getContext(); // Available anywhere!
    logger.info("Doing work"); // Logger auto-reads ctx from AsyncLocalStorage
  }
}
```

3. **NO Try/Catch** - Error middleware handles all errors:

   ```typescript
   // ❌ WRONG
   try {
     // business logic
   } catch (error) {
     logger.error(...)
     throw new ConnectError(...)
   }

   // ✅ CORRECT
   // Pure business logic - no try/catch needed
   const result = await myService.doSomething();
   return { result };
   ```

4. **NO Manual Logging** - Middleware logs requests/responses automatically:

   ```typescript
   // ❌ WRONG
   logger.info({ req }, "Request received");

   // ✅ CORRECT
   // Middleware handles all request/response/error logging automatically
   ```

#### Context Helpers

Use these helper functions to access auth in handlers:

- `requireUserAuth(context)` - Returns `{ userId, email }`, throws if not a user
- `requireStaffAuth(context)` - Returns `{ staffId, staffRole, venueIds, organizationId }`, throws if not staff
- `requireVenueAccess(context, venueId)` - Throws if staff doesn't have access to venue
- `getAuthContext(context)` - Returns auth or undefined (for optional auth)

#### Service Registration

Register services with policies using `registerServiceWithPolicies`:

```typescript
import { registerServiceWithPolicies } from "@/lib/server/middleware";

export const registerMyService = (router: ConnectRouter) => {
  registerServiceWithPolicies(router, {
    service: MyService,
    implementation: myHandler,
    methodPolicies: {
      myMethod: { audience: "guest", auth: "user" },
      anotherMethod: { audience: "manage", auth: "staff" },
    },
  });
};
```

#### Complete Examples

See `docs/templates/handler-with-middleware.template.ts` for detailed before/after examples.

### Frontend Architecture

- **Next.js App Router**: Both frontends use Next.js 15 with App Router
- **State Management**: MobX for client state, TanStack Query for server state
- **API Communication**: Connect-RPC clients with protobuf-generated types
- **Styling**: Tailwind CSS with custom UI components in `packages/ui`
- **Forms**: React Hook Form with Zod validation

### Shared Packages

- **`packages/proto`**: Contains `.proto` files defining the API contract. Changes here regenerate TypeScript types for both API and frontends
- **`packages/ui`**: Reusable React components built with Radix UI primitives
- **`packages/icons`**: Centralized icon library

## Code Quality Standards

**IMPORTANT**: All code changes must adhere to our cleanup and standards documentation:

- **Backend files** (`apps/manage-api`): Must follow [BACKEND_CLEANUP_CHECKLIST.md](./docs/standards/backend-cleanup-checklist.md)
  - Use Pino logger directly (`import { logger } from "@/lib/logger"`) - NEVER use console statements or kLog
  - Type all errors as `ErrorWithDetails` in catch blocks
  - Use error constants from `RESERVATION_ERRORS` or module-specific constants
  - Implement proper ConnectRPC error codes
  - Follow structured logging patterns
  - **Validation**: Use protovalidate for input validation (Zod only as fallback when protovalidate doesn't cover requirements)
  - Be conservative with validation constraints, especially for dates and built-in types

- **Frontend files** (`apps/manage-frontend`, `apps/guest-frontend`): Must follow [FRONTEND_CLEANUP_CHECKLIST.md](./docs/standards/frontend-cleanup-checklist.md)
  - React Hook Form is MANDATORY for ALL forms - no manual form state
  - Single source of truth - no duplicate state management
  - Components only render, hooks contain all logic
  - Use `createZodResolver` from `@/lib/utils/zod-resolver` (never `zodResolver(schema as any)`)
  - **KEEP Zod for frontend validation** - needed for instant form feedback to users
  - Use proto types directly, no duplicates
  - No console statements in production code

- **All changes**: Must follow [CLEANUP_STANDARDS.md](./docs/standards/cleanup-standards.md)
  - Phase 1: Code cleanup without structural changes
  - Phase 2: Refactoring and optimization (future)

When creating or editing any file, ensure it meets ALL requirements from the relevant checklist.

## Code Conventions

### TypeScript

- Use path aliases: `@/` for src directory in each app
- Prefer type imports: `import type { ... }`
- Use functional components with hooks in React

### Formatting (Biome)

- 2 spaces indentation
- Double quotes for strings
- Semicolons required
- Max line width: 100 characters
- Trailing commas in ES5

### File Organization

- **API Handlers**: `*.handler.ts` - ConnectRPC entry points (pure transport layer, no business logic)
- **Services**: `*.service.ts` - Business logic orchestration
- **DAOs**: `*.dao.ts` - Database access layer (all Prisma queries)
  - **MUST be classes** with explicit methods for each operation
  - **Explicit types**: All methods have explicit input/return types
  - **Select const pattern**: Use Prisma select consts for DRY types
    ```typescript
    const wholeVenueSelect = { id: true, name: true } as const;
    type WholeVenue = Prisma.VenueGetPayload<{
      select: typeof wholeVenueSelect;
    }>;
    ```
  - **Audit logging**: All CUD operations (Create, Update, Delete) MUST log to audit trail
    - Include before/after state, entity type, operation, affected IDs, userId/staffId
    - Read operations do NOT require audit logging
- **Mappers**: `*.mapper.ts` - Data transformation (DB ↔ Proto ↔ Domain)
- **Constants**: `*.constants.ts` - Module-specific constants and enums
- **Types**: `*.types.ts` - TypeScript type definitions
- **React components**: PascalCase files matching component name
- **Utilities**: `lib/` directory in each app

### Testing

- **TDD for Backend (MANDATORY)**: All backend changes follow Test-Driven Development
  - Red-Green-Refactor cycle: Write failing test → Make it pass → Refactor
  - Tests MUST be written and verified to fail BEFORE implementation
- Test files: `*.test.ts` or `*.spec.ts`
- **Unit tests** run in PARALLEL - no database access, all dependencies mocked
- **Integration/E2E tests** run in PARALLEL using dynamic IDs (UUIDs, timestamps) to prevent conflicts
- Frontend tests use Vitest with jsdom; TDD encouraged but not mandatory

## Key Modules in API

- `reservation`: Core booking functionality
- `venue`: Venue configuration and management
- `shift`: Staff shift management
- `availability-alert`: Notification system for availability
- `reporting`: Analytics and reporting
- `billing`: Stripe integration for payments
- `organization`: Multi-tenant organization management
