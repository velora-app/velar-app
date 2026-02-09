# TablePuls (Velora) – Project documentation

Single reference for architecture, standards, components, and review. Merge of `ARCHITECTURE.md`, `STANDARDS.md`, `COMPONENT-ARCHITECTURE.md`, and `REVIEW.md`.

---

## Table of contents

1. [Architecture](#1-architecture)
2. [Standards](#2-standards)
3. [Component architecture](#3-component-architecture)
4. [Review & current state](#4-review--current-state)

---

## 1. Architecture

### Current fit

**Partially enterprise-style.** Clear separation (types, lib, application, components, app) and no circular dependencies. Presentation goes through an application layer; API routes call lib directly.

| Layer / concern       | Where it lives today | Notes |
| -------------------- | -------------------- | ----- |
| **Domain (entities)** | `types/database.ts` | Types are pure. |
| **Infrastructure**   | `lib/*`              | Database, schema, storage, remote, export, logger. |
| **Application**     | `application/useWorkspace.ts` | One hook for workspace state and handlers. |
| **Presentation**    | `app/`, `components/` | Page uses `useWorkspace()` only; no direct lib in page. |
| **API entrypoints**  | `app/api/query`, `app/api/schema` | Thin routes; call `@/lib/database` and `@/lib`. |

**Dependency rule:** Presentation → Application → Domain; Application and API use Infrastructure. Domain has no framework or I/O deps.

### Folder structure

```
├── app/                    # Presentation (Next.js app router)
│   ├── api/                # HTTP entrypoints
│   ├── layout.tsx
│   └── page.tsx
├── components/             # Presentation (UI)
│   ├── ui/                 # Base components (Button, Input, Modal, Drawer, …)
│   └── index.ts            # Barrel: import from @/components
├── application/           # Use cases, orchestration
│   └── useWorkspace.ts     # Workspace state + handlers
├── lib/                    # Infrastructure (I/O, adapters)
│   ├── api/                # Response helpers, constants
│   ├── database/           # Server-only; API routes only
│   ├── storage/            # Persistence, config parsing
│   ├── remote/             # Electron vs HTTP, file save
│   ├── export/             # CSV/JSON builders
│   └── logger/
├── types/                  # Domain types (single entry: @/types)
└── tests/                  # Unit (and optional integration) tests
```

### Dependency rules

- **Presentation** (`app/`, `components/`): import from `@/application`, `@/types`, `@/components`. Use `@/lib` only for client-safe libs (storage, remote, logger, api, export).
- **Application**: import from `@/types`, `@/lib`.
- **API routes**: use `@/lib/database` for DB work and `@/lib` for badRequest, serverError, logger.
- **Domain / types**: no imports from app, components, or lib.

### What was done to align

- **Application layer:** `application/useWorkspace.ts` holds workspace state and handlers. The page only composes layout and uses `useWorkspace()`; it does not import from `lib/` directly.
- **Thin page:** `app/page.tsx` is presentation-only: calls `useWorkspace()`, spreads state/handlers into UI, renders modals/drawers.

### Optional next steps (full enterprise fit)

- Ports & adapters: interfaces in application, implementations in lib.
- Move `types/database.ts` to `domain/` if you want an explicit domain folder.
- Schema validation (e.g. Zod) in application for connection/query payloads.
- Central config for env and feature flags.

---

## 2. Standards

### API

- **Base:** Routes under `/api/*`. Paths in **`lib/api/constants.ts`** (`API.query`, `API.schema`). Import from `@/lib`.
- **Errors:** Use **`lib/api`** helpers (from `@/lib`):
  - **400:** `badRequest(error: string, code?: string)` → `{ error, code? }`.
  - **500:** `serverError(message, cause, logger.error)` → `{ error, code: 'INTERNAL_ERROR' }`, logs cause.
- **Query API** 500: keep domain shape `{ columns, rows, error }`; use `logger.error` for logging.
- **Validation:** Validate all request bodies. Use `validateConnection` from **`@/lib/database`** for connection payloads; validate query and other fields in the route.

### Logging

- Use **`lib/logger`** instead of `console.*`. Import from `@/lib`.
  - `logger.error(message, error?)` – failures and exceptions.
  - `logger.warn(message, meta?)` – recoverable or unexpected.
  - `logger.info(message, meta?)` – optional info.
- In development, `logger.error` logs full error; in production, message only. ESLint warns on `console.*` outside `lib/logger/logger.ts`.

### Types

- **Single source:** Shared types in **`types/`** (`database.ts`, `api.ts`, `electron.d.ts`). Import from **`@/types`** (or `../types` in Electron). `types/index.ts` re-exports.
- Prefer **`unknown`** over **`any`** at boundaries (API bodies, localStorage, driver results). Narrow with type guards or validation.
- Use domain types from `types/database.ts` everywhere; avoid ad-hoc connection/result shapes.

### Constants

- **`lib/api/constants.ts`:** API paths, `SAVED_QUERIES_LIMIT`, `DRAWER_WIDTH`, etc. Import from `@/lib`. No magic numbers or URL strings in components or routes.

### Validation

- **API:** Validate and normalize before DB/schema calls. Invalid payloads → 400 with clear `error` string.
- **Storage:** `loadConnections()` and `loadSavedQueries()` validate/normalize so bad localStorage does not break the app.

### Barrel files (index.ts)

- Each layer has an **`index.ts`** that re-exports the public API.
- **`types/index.ts`** – import from **`@/types`**.
- **`lib/`** – DDD-style; each subfolder has its own `index.ts`:
  - **`lib/api`** – response helpers, constants.
  - **`lib/database`** – server-only; use **`@/lib/database`** in API routes only.
  - **`lib/storage`**, **`lib/remote`**, **`lib/export`**, **`lib/logger`** – client-safe.
- **`lib/index.ts`** – re-exports only client-safe libs (not `database`). App/components use **`@/lib`**; API routes add **`@/lib/database`** for executeQuery, fetchSchema, validateConnection.
- **`application/index.ts`** – use **`@/application`**.
- **`components/index.ts`** – use **`@/components`** in the app.

### Query safety

- **Timeout:** **`QUERY_TIMEOUT_MS`** (in `types/database.ts`, default 60s). Applied in lib/database and Electron.
- **Max rows:** **`MAX_QUERY_ROWS`** (default 10,000). When truncated, `QueryResult` has **`truncatedMessage`**; DataTable shows it.

### Error boundary

- **`components/ErrorBoundary`** wraps main app content in **`app/page.tsx`**. On uncaught render error: “Something went wrong”, log via **`logger`**, offer **Try again** and **Go home**.

### Formatting & linting

- **Prettier:** `npm run format`, `npm run format:check`. Config: `.prettierrc`; ignore: `.prettierignore`.
- **ESLint:** no-console except in `lib/logger/logger.ts`.

### Testing

- **Location:** All tests under **`tests/`** (not next to app code).
- **Layout:** **`tests/unit/`** mirrors source (e.g. `tests/unit/lib/storage/parseConfig.test.ts`). Optional **`tests/integration/`**.
- **Vitest:** `npm test`. Config: `vitest.config.ts`; includes `tests/**/*.test.ts` and `*.spec.ts`.
- Use **`@/`** alias and barrel imports (e.g. `import { parseConnectionConfig } from '@/lib'`).
- Prefer pure functions and validation tests; add integration tests with mocks or test DB as needed.

---

## 3. Component architecture

### Current structure

**Base components in `components/ui/`:**

- **Button** – primary / secondary (and other) variants.
- **Input** – text, number, password; optional label and error.
- **Select** – options array; optional label and error.
- **Textarea**, **Checkbox** – optional label and error.
- **Modal** – overlay + panel; optional title, icon, size, scrollable body.
- **Drawer** – overlay + side panel; optional title, side, width, overlayLabel.

Feature components (ConnectionModal, ConfigImportModal, SaveQueryModal, SavedQueriesDrawer, SchemaPanel, AppHeader, etc.) use these so behaviour and styling stay consistent.

### Atomic UI (reference)

| Level       | Role            | Examples in project                    |
| ----------- | --------------- | -------------------------------------- |
| **Atoms**   | Smallest units  | Button, Input, Select, Badge, Icon     |
| **Molecules** | Groups of atoms | FormField, Toolbar                     |
| **Organisms** | Feature blocks  | ConnectionForm, DataTable, SchemaPanel |
| **Templates** | Page layout     | WorkspaceLayout, ModalShell            |
| **Pages**   | Composed views  | Home (`app/page.tsx`)                  |

Atoms live in `components/ui/`; no strict atoms/molecules/organisms folders unless you choose to add them.

### Optional improvements

- Move to strict Atomic folders (`atoms/`, `molecules/`, `organisms/`) if you want a stricter layout.
- Inline or toast feedback instead of `alert()` where still used.
- Share “save file” (Electron vs browser) in a util or hook.
- Field-level validation (e.g. Zod) for connection form and API payloads.

---

## 4. Review & current state

### Structure summary

- **lib/** – DDD bounded context; each subfolder has `index.ts`: api, database (server-only), storage, remote, export, logger.
- **Barrels:** types, lib (client-safe), application, components. App imports from `@/types`, `@/lib`, `@/application`, `@/components`.
- **Query safety:** `QUERY_TIMEOUT_MS`, `MAX_QUERY_ROWS` in `types/database.ts`; timeout and truncation in lib/database and electron/database; `truncatedMessage` in DataTable.
- **Error boundary:** `components/ErrorBoundary` in `app/page.tsx`.

### What’s in good shape

- **Architecture:** Clear application layer (`useWorkspace`), thin page, lib as infrastructure.
- **UI:** Base components in `components/ui/`, consistent Button/Modal/Drawer/Input/Select; barrel at `@/components`.
- **DRY:** Shared helpers in lib subfolders (remote, storage, export, parseConfig).
- **No circular dependencies:** Page → application → lib/types.
- **Persistence:** Save/delete/rename for saved queries and connections via storage helpers.
- **Validation:** `validateConnection` copies only known keys (no prototype pollution).

### Fixes applied (historical)

1. **lib/remote/remote.ts** – Error handling when fetch fails; read response body and handle non-JSON.
2. **app/api/query and schema routes** – Validate request body before DB code.
3. **lib/storage/storage.ts** – Validate loaded data; ensure arrays and filter invalid entries.
4. **QueryEditor** – Typed Monaco ref and onMount.
5. **types/database.ts** – `unknown[][]` for rows; `truncatedMessage`, `QUERY_TIMEOUT_MS`, `MAX_QUERY_ROWS`.

### Recommended next steps (optional)

- **Integration tests:** API routes with test DB or mocks.
- **Security:** Auth or ensure API not exposed to untrusted users; connection validation already restricts to known fields.
- **Electron storage key:** `velora_active_connection_id` – document or migrate if rebranding.
- **Product name:** App/package name is Velora.
- **Schema API:** Consider single error path (e.g. 200 + `{ tables: [], error }` or 500) for consistency with query API.
