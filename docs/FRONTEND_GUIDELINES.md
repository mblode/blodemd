# Frontend Cleanup & Standards Checklist

## For manage-frontend & guest-frontend

**This is the definitive production-grade standard for all frontend code.**
Every file must meet ALL these requirements. No exceptions.

---

## 🚨 Core Principles

1. **Single Source of Truth** - Never duplicate state or data
2. **Type Safety** - No `any` types, no type casting
3. **React Hook Form for ALL Forms** - No manual form state management
4. **Proto as Contract** - Use proto types directly, don't duplicate
5. **Clear Separation** - Components render, hooks contain logic

## ⛔ Critical Anti-Patterns to Fix Immediately

### 1. **Duplicate State Management** (Most Common Issue)

```typescript
// ❌ WRONG - Two systems managing same data
const form = useForm();
const [formData, setFormData] = useState();
useEffect(() => {
  form.setValue("field", formData.field);
}, [formData]);

// ✅ CORRECT - Single source of truth
const form = useForm();
const fieldValue = form.watch("field");
```

### 2. **Manual Form State Instead of React Hook Form**

```typescript
// ❌ WRONG - Manual state management
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const handleSubmit = () => {
  /* manual validation */
};

// ✅ CORRECT - React Hook Form
const form = useForm<Schema>({
  resolver: createZodResolver(schema),
});
```

### 3. **Business Logic in Components**

```typescript
// ❌ WRONG - API call in component
const Component = () => {
  const handleClick = async () => {
    const response = await fetch('/api/...');
    // business logic here
  };
};

// ✅ CORRECT - Logic in hook
const useFeature = () => {
  const mutation = useMutation(...);
  return { handleClick: mutation.mutate };
};
```

### 4. **Type Casting Instead of Proper Types**

```typescript
// ❌ WRONG
const data = response as CustomType;
resolver: zodResolver(schema as any);

// ✅ CORRECT
const data = mapFromProto(response);
resolver: createZodResolver(schema);
```

---

## ✅ Production Standards Checklist

### 🧹 Code Quality

- [ ] Delete all `console.log|error|warn|debug` statements
- [ ] Remove `debugger` statements
- [ ] Delete commented-out code blocks
- [ ] Remove or complete TODO / FIXME comments
- [ ] Remove unused imports, variables, and functions
- [ ] Remove dead code paths (unreachable branches)
- [ ] Provide explicit radix to `parseInt`
- [ ] Remove unused function parameters (or prefix with `_` when required by an interface)
- [ ] Generate unique IDs with `useId` instead of hardcoding duplicated `id` attributes

### 🧾 TypeScript Hygiene

- [ ] Replace all `any` with proper types (including `zodResolver(schema as any)`)
- [ ] Remove `// @ts-ignore` and `// @ts-expect-error` by fixing types
- [ ] Add missing return types for functions
- [ ] Add missing prop/state/event types
- [ ] Prefer `type` over `interface` (e.g., `type Props = {}`)
- [ ] Component as arrow function: `const Component = ({...}: Props) => {}`
- [ ] One TSX component per file (flag if not possible without refactor)
- [ ] For component return types, prefer `React.ReactElement` (or omit and allow inference). Avoid `JSX.Element` to prevent JSX namespace errors. For async server components, use `Promise<React.ReactElement>`
- [ ] Use proto-generated types directly from `@reserve/proto/gen/*` (no custom API response types)
- [ ] Only create custom types for UI-specific enhancements (not proto duplicates)
- [ ] Use proto-mappers for transformations, not type casting (`as SomeType`)
- [ ] Only add a mapper if you’re actually transforming; otherwise pass proto types through
- [ ] Keep UI types minimal and feature-scoped; lift to shared only when reused across features
- [ ] Timestamps: always normalize to `Date` (e.g., `parseReservationTime`) and avoid string dates

### 📁 File & Imports

- [ ] File names use kebab-case (e.g., `user-profile.tsx`)
- [ ] Component identifiers use PascalCase (e.g., `UserProfile`)
- [ ] Import order: React/Next → third-party → internal (`@reserve/*`) → relative → styles
- [ ] Use absolute imports where configured (e.g., `@/*`)
- [ ] Remove duplicate imports

### 🌐 API & Data (client-side)

- [ ] Use ConnectRPC with `@connectrpc/connect-query` (no raw `fetch` on client)
- [ ] Use `useQuery` for reads and `useMutation` for writes
- [ ] Use `skipToken` or disabled queries for conditional fetches
- [ ] After mutations, invalidate with `createConnectQueryKey` where applicable
- [ ] Handle `ConnectError` codes (auth, permission, not found) with user-facing messages
- [ ] No direct backend imports (no Prisma/DB access)
- [ ] Standardize loading/error/empty UI using shared components/helpers
- [ ] After mutations, invalidate queries using `createConnectQueryKey` and the exact key used by the query
  - Example: `await queryClient.invalidateQueries({ queryKey: createConnectQueryKey({ schema: listTables, cardinality: "finite" }) })`

### 🌐 API & Data (server routes/actions)

- [ ] Prefer Connect client; if not feasible, justify raw `fetch` with comment
- [ ] Ensure timeouts and error handling on server-side requests

### 📝 Forms & Validation - STRICT REQUIREMENTS

- [ ] **React Hook Form is MANDATORY** for ALL forms
  - NO useState for form fields
  - NO manual onChange handlers for form state
  - Form must be single source of truth
- [ ] **Zod v4 schemas with `createZodResolver`**
  - NEVER use `zodResolver(schema as any)`
  - Always use `createZodResolver(schema)`
  - **Location**: Import from `@/lib/utils/zod-resolver`
  ```typescript
  import { createZodResolver } from "@/lib/utils/zod-resolver";
  const form = useForm({ resolver: createZodResolver(schema) });
  ```
- [ ] **Schema placement**: Always in `types/index.ts`
  ```typescript
  export const formSchema = z.object({...});
  export type FormSchema = z.infer<typeof formSchema>;
  ```
- [ ] **KEEP Zod for frontend validation** - Zod is used on the client for instant form validation feedback
  - Protovalidate is for backend/API validation only
  - Frontend needs Zod for real-time user feedback during form input
- [ ] **NO duplicate state management**
  - If using React Hook Form, don't also use useState for same values
  - Use `form.watch()` to observe values
  - Use `form.setValue()` for programmatic updates
- [ ] **Form architecture pattern**:

  ```typescript
  // ✅ CORRECT
  const form = useForm<Schema>({ resolver: createZodResolver(schema) });
  const watchedValue = form.watch("fieldName");

  // ❌ WRONG - Duplicate state
  const [fieldValue, setFieldValue] = useState();
  useEffect(() => form.setValue("field", fieldValue), [fieldValue]);
  ```

- [ ] **Form dependency arrays - CRITICAL PERFORMANCE**
  - NEVER put `form` object in useCallback/useEffect dependencies
  - Form methods (`setValue`, `getValues`, `reset`, `watch`, `handleSubmit`) are **stable references**
  - Only `form.formState` properties (like `isDirty`, `isSubmitting`) should be in dependencies
  - Adding `form` to deps causes infinite render loops and performance issues

  ```typescript
  // ❌ WRONG - Creates infinite loops and performance issues
  const handleChange = useCallback(() => {
    form.setValue("field", value);
  }, [form]); // form object recreated every render → infinite loop

  useEffect(() => {
    form.reset(data);
  }, [form, data]); // form triggers this every render!

  // ✅ CORRECT - Form methods are stable references
  const handleChange = useCallback(() => {
    form.setValue("field", value);
  }, []); // Empty deps - form.setValue never changes

  useEffect(() => {
    form.reset(data);
  }, [data]); // Only data dependency needed

  // ✅ CORRECT - formState properties are fine to watch
  useEffect(() => {
    onUnsavedChanges(form.formState.isDirty);
  }, [form.formState.isDirty, onUnsavedChanges]); // This is correct
  ```

- [ ] Display field-level errors using `form.formState.errors`
- [ ] Disable submit while `form.formState.isSubmitting`
- [ ] Reset on success with `form.reset()` when appropriate

### 🎨 UI/UX & Design System

- [ ] All UI text uses sentence case (buttons, labels, headings)
- [ ] Use components from `@reserve/ui` for UI primitives
- [ ] Use icons from `@reserve/icons` (do not add `lucide-react`)
- [ ] Provide clear error, success, and empty states

### 🖼️ Images (Next/Image)

- [ ] Use `next/image` for images (local/remote)
- [ ] Always provide `alt`; use `alt=""` for decorative images
- [ ] Provide explicit `width` and `height`, or use `fill` with a relative parent
- [ ] Add `sizes` for responsive images; use `priority` only for above-the-fold
- [ ] Use `placeholder="blur"` for LCP-heavy images where helpful
- [ ] Ensure remote domains are allowed in `next.config.js` (`images.domains` or `remotePatterns`)

### ♿ Accessibility

- [ ] Inputs have labels; icon buttons have `aria-label`
- [ ] Keyboard navigation (Tab) works; visible focus rings
- [ ] Color contrast meets standards
- [ ] Replace `dangerouslySetInnerHTML` theme scripts with `<Script>` and avoid hardcoded IDs
- [ ] Use interactive elements (`button`, `section`, etc.) instead of `div` with `role`

### 🔒 Security

- [ ] No sensitive data in `localStorage`
- [ ] No API keys or hardcoded credentials in code
- [ ] Prefer httpOnly cookies for auth tokens
- [ ] Sanitize any HTML used with `dangerouslySetInnerHTML` (e.g., DOMPurify)
- [ ] Validate URLs and escape user content

### ⚡ Performance Basics

- [ ] Remove unused deps from `package.json`
- [ ] Import narrowly (avoid `import *`)
- [ ] Use dynamic imports for large components
- [ ] Avoid heavy date libs (prefer `date-fns` over `moment`)
- [ ] Lists use stable, unique keys; avoid index as key
- [ ] `useEffect` has correct deps and cleanup

### 🏢 State Management - SINGLE SOURCE OF TRUTH

- [ ] **Never duplicate state** - Each piece of data has ONE owner
- [ ] **Form state**: React Hook Form owns it (not useState)
- [ ] **Server state**: React Query/Connect Query owns it (not useState)
- [ ] **UI state**: useState only for UI-specific state (modals, tabs, etc.)
- [ ] **Global state**: MobX stores only when truly global
- [ ] **Red flags to fix immediately**:
  - Using both RHF and useState for same form data
  - Syncing state with useEffect between multiple sources
  - Storing server data in useState instead of query cache
- [ ] `observer` wraps MobX-observing components
- [ ] No state mutations; use immutable updates

### 🎯 Component vs Hook Separation - STRICT BOUNDARIES

- [ ] **Components (Presentation Layer)**:
  - JSX and rendering logic ONLY
  - UI state only (modal open/close, tab selection)
  - Simple event handlers that call hook functions
  - Style/className logic
  - NO business logic, NO API calls, NO complex state
- [ ] **Custom Hooks (Business Logic Layer)**:
  - ALL API calls and data fetching
  - React Hook Form instance for forms
  - Business logic and validation rules
  - Complex state transformations
  - Side effects (toasts, navigation)
  - Return processed data and handlers to components
- [ ] **Architecture pattern**:

  ```typescript
  // ✅ CORRECT - Hook owns logic, component renders
  const useFeatureLogic = () => {
    const form = useForm<Schema>({...});
    const { data } = useQuery(...);
    const handleSubmit = form.handleSubmit(async (data) => {...});
    return { form, data, handleSubmit };
  };

  const Component = () => {
    const { form, data, handleSubmit } = useFeatureLogic();
    return <form onSubmit={handleSubmit}>...</form>;
  };

  // ❌ WRONG - Logic in component
  const Component = () => {
    const [formData, setFormData] = useState();
    const handleSubmit = async () => { /* API call here */ };
    return ...;
  };
  ```

### ✅ Final Validation Checklist

- [ ] **NO duplicate state** - Each piece of data has exactly one owner
- [ ] **NO manual form state** - All forms use React Hook Form
- [ ] **NO any types** - Everything is properly typed
- [ ] **NO business logic in components** - All logic in hooks
- [ ] **NO console statements** - Production ready
- [ ] **NO type casting** - Use proper types or mappers
- [ ] Consistent naming, spacing, and formatting (Biome)
- [ ] Consistent error/loading patterns
- [ ] Follow team conventions and reuse utilities

---

### 📁 Structure & Organization - MANDATORY PATTERNS

- [ ] Organize components by feature with this **MANDATORY** structure:

  ```
  components/
    [feature-name]/           # Feature folder (e.g., flow, floor-plan, schedules)
      # COMPONENTS - All at root level, NO subdirectories
      component-one.tsx
      component-two.tsx
      component-three.tsx

      # BUSINESS LOGIC - Required folders
      hooks/                  # Feature-specific hooks ONLY
        use-feature-data.ts   # Data fetching/API calls
        use-feature-logic.ts  # Business logic
        use-feature-state.ts  # Complex state management

      types/                  # Type modules - STRICT organization
        index.ts              # Zod schemas for forms
        common.ts             # Shared types (enums, common interfaces)
        [domain].ts           # Domain-specific UI types

      utils/                  # Utilities - STRICT organization
        proto-mappers.ts      # ALL proto → UI transformations
        utils.ts              # Non-proto helpers (placement math, formatting, etc.)

      # ROOT FILES - Single purpose files
      constants.ts            # Feature constants
  ```

- [ ] **utils/proto-mappers.ts** - ALL proto transformations:

  ```typescript
  export const mapReservationFromProto = (
    reservation: ProtoReservation,
  ): UiReservation => ({
    ...reservation,
    startTime: reservation.startTime || new Date(),
    // Only transform what's needed for UI
  });
  ```

- [ ] **types/[domain].ts** - UI-specific types ONLY:

  ```typescript
  import type { ProtoReservation } from "./proto";

  // Extend proto with UI-specific properties
  export type EnhancedReservation = Omit<ProtoReservation, "$typeName"> & {
    // startTime inherited from ProtoReservation as Timestamp | undefined
    conflictLevel: ConflictLevel; // UI-only property
  };
  ```

#### 📋 **Type Organization Rules**

- [ ] **NEVER** create duplicate API response types - use proto types directly
- [ ] **NEVER** type cast with `as` - use proto-mappers instead
- [ ] Keep `utils/proto-mappers.ts` for proto transforms and `utils/utils.ts` for general helpers in every feature (flows, floor plan, etc.)
- [ ] Split types by domain: `reservations.ts`, `tables.ts`, etc.
- [ ] For forms, place Zod schemas in `types/index.ts` with derived types:
  ```typescript
  // types/index.ts
  export const newReservationSchema = z.object({
    name: z.string().min(1, "Name required"),
    partySize: z.number().min(1).max(20),
  });
  export type NewReservationSchema = z.infer<typeof newReservationSchema>;
  ```

#### 🪝 **Hook Organization Rules**

- [ ] **ALL** API calls go in hooks, NEVER in components
- [ ] **ALL** business logic goes in hooks
- [ ] Hooks return UI types after mapping from proto:
  ```typescript
  export const useFeatureData = () => {
    const { data: protoResponse } = useQuery(listReservations, ...);
    const uiData = useMemo(() =>
      protoResponse?.reservations?.map(mapReservationFromProto) ?? [],
      [protoResponse]
    );
    return { data: uiData };
  };
  ```

#### 🧩 **Component Rules**

- [ ] Import from `"./types"` not `"./types/index"`
- [ ] Components ONLY: JSX, local UI state, event handlers, styles
- [ ] Components NEVER: API calls, business logic, proto imports

### 🌐 Data & API

- [ ] Standardize Connect clients and query keys across features
- [ ] Centralize error handling for `ConnectError` codes
- [ ] Replace any remaining raw `fetch` in server routes with Connect clients where feasible

### ⚡ Performance & Rendering

- [ ] Memoize expensive components (`React.memo`, `useMemo`, `useCallback`) based on profiling
- [ ] Virtualize long lists and heavy tables
- [ ] Audit bundle and code-split heavy routes (dynamic imports)

### 🧭 Next.js Conventions

- [ ] Use `next/link` for internal navigation
- [ ] Keep Server Components by default; add `"use client"` only when needed
- [ ] Only add `"use client"` if the file itself uses client-only APIs (useState/useEffect, browser APIs, context that requires client). A server component can render client components as children.
- [ ] Prefer server `page.tsx` wrappers that just render a client child; remove redundant `"use client"` from wrappers to keep RSC benefits (unless there is a specific reason)
- [ ] Add `loading.tsx`/`error.tsx` for critical routes to improve UX

---

## 🤖 AI Assistant Prompt

```
Refactor this file to meet our production standards:

FILE: [paste file path]

MANDATORY REQUIREMENTS:
1. React Hook Form for ALL forms - no manual form state
2. Single source of truth - no duplicate state management
3. Remove ALL console statements, debuggers, commented code
4. Replace ALL `any` types with proper types
5. Components only render, hooks contain all logic
6. Zod schemas in types/index.ts with createZodResolver
7. Proto types used directly, no duplicates
8. ConnectRPC for API calls, no raw fetch
9. Proper error handling and loading states
10. Follow exact folder structure from checklist

Check for these RED FLAGS:
- useState for form fields (should be React Hook Form)
- useEffect syncing between state sources (indicates duplicate state)
- API calls in components (should be in hooks)
- Type casting with 'as' (use proper types or mappers)
- zodResolver with 'as any' (use createZodResolver)

Provide the refactored code following these exact patterns.
```

---

## 📋 Quick Reference

### Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **CSS classes**: kebab-case (`user-profile-card`)

### Quick Fix Reference

```tsx
// ❌ Wrong -> ✅ Correct

// Console statements
console.log("data", data) -> Remove entirely

// Type safety
const handleClick = (e: any) => {} -> (e: React.MouseEvent<HTMLButtonElement>) => {}
resolver: zodResolver(schema as any) -> resolver: createZodResolver(schema)
data as CustomType -> Use proper types or mappers

// Form state
const [value, setValue] = useState() -> const form = useForm(); form.watch('value')

// UI text
<button>SAVE CHANGES</button> -> <button>Save changes</button>

// Security
localStorage.setItem("token", token) -> Use httpOnly cookies

// Proto types
type CustomAPIResponse = {...} -> import type { Response } from "@reserve/proto/gen/..."
```

### Commands

```bash
# Type check (workspace)
npm run check-types --workspace=apps/manage-frontend
npm run check-types --workspace=apps/guest-frontend

# Lint + format (workspace)
npm run lint --workspace=apps/manage-frontend
npm run format --workspace=apps/manage-frontend
npm run lint --workspace=apps/guest-frontend
npm run format --workspace=apps/guest-frontend

# Tests (workspace)
npm run test --workspace=apps/manage-frontend
npm run test --workspace=apps/guest-frontend

# Detect unused code
npx knip

# Pull env from Vercel (workspace)
npm run env:pull --workspace=apps/manage-frontend
npm run env:pull --workspace=apps/guest-frontend
```

---

## Master File Checklist

This checklist enumerates frontend source files to clean up and verify. It covers:

- apps/manage-frontend
- apps/guest-frontend
- packages/ui (shared UI)

Excluded to avoid noise:

- packages/icons (large icon set)
- packages/proto (generated code)
