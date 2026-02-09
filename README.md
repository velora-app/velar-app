# Velora

A modern standalone database management tool (TablePlus-style) built with TypeScript, Next.js, and Electron.

## Features

- 🔌 Support for multiple database types (PostgreSQL, MySQL, SQLite, MongoDB, Redis)
- 📝 SQL query editor with syntax highlighting (Monaco Editor)
- 📊 Data table viewer with horizontal and vertical scrolling
- 📤 Export functionality (CSV, JSON, Excel)
- 🌳 Database tree navigation
- 💾 Connection management
- 🎨 Modern, clean UI with dark theme
- 🖥️ Standalone desktop application (no browser required)

## Getting Started

### Development Mode

1. Install dependencies:

```bash
npm install
```

2. Run in development mode:

   **With Electron (desktop):**

   ```bash
   npm run electron:dev
   ```

   This starts the Next.js dev server and launches the Electron app.

   **Web only (browser at http://localhost:3000):**

   ```bash
   npm run dev
   ```

   Use this when you don't need the desktop app or native DB drivers (e.g. SQLite via Electron).

### Building Standalone Application

Build for your platform:

**macOS:**

```bash
npm run build:mac
```

**Windows:**

```bash
npm run build:win
```

**Linux:**

```bash
npm run build:linux
```

The built application will be in the `dist` folder.

## Usage

1. Click "New Connection" in the sidebar to add a database connection
2. Select your database type and enter connection details
3. Write SQL queries in the editor (supports ⌘+Enter / Ctrl+Enter to execute)
4. View results in the data table with full horizontal and vertical scrolling
5. Export results to CSV, JSON, or Excel format
6. Sort columns by clicking on column headers

## Supported Databases

- **PostgreSQL** - Full SQL support
- **MySQL** - Full SQL support
- **SQLite** - Full SQL support
- **MongoDB** - JSON query format
- **Redis** - Command-based queries

## Export Features

- **CSV Export** - Export query results as CSV files
- **JSON Export** - Export query results as JSON files
- **Excel Export** - Export query results as XLSX files (requires Electron)

## Keyboard Shortcuts

- `⌘+Enter` / `Ctrl+Enter` - Execute query
- Click column headers - Sort by column

## Project Structure

```
├── app/              # Next.js app router (pages, API routes)
├── application/     # Application layer (useWorkspace); barrel at @/application
├── components/       # React components (ui/ = base primitives); barrel at @/components
├── docs/             # DOCUMENTATION.md (architecture, standards, components, review)
├── electron/         # Electron main process (TypeScript → dist-electron)
├── lib/              # Infrastructure, DDD-style subfolders; barrel at @/lib (client-safe only)
│   ├── api/          # Response helpers, constants (API, SAVED_QUERIES_LIMIT)
│   ├── database/     # Query execution, schema, validation (server-only; use @/lib/database in API routes)
│   ├── storage/      # Persistence (connections, saved queries, parseConfig)
│   ├── remote/       # Execution path (Electron vs HTTP), file save
│   ├── export/       # CSV/JSON export builders
│   └── logger/       # Central logger
├── tests/            # Test layer (unit/, integration/) – separate from app code
├── types/            # TypeScript types; barrel at @/types
└── package.json
```

## Docs

- **docs/DOCUMENTATION.md** – Single reference: architecture, standards (API, logging, types, constants, barrels, query safety, testing), component structure, and review/next steps.

## Testing

After `npm install`, run tests:

```bash
npm test
```

All tests live under **`tests/`** (separate from app code), mirroring source paths:

- **`tests/unit/lib/storage/`** – parseConfig, storage
- **`tests/unit/lib/database/`** – validateConnection
- **`tests/unit/lib/export/`** – exportData (buildCsv, buildJsonFromRows)
- **`tests/integration/`** – (optional) API or DB tests

Use the `@/` path alias in tests (e.g. `import { validateConnection } from '@/lib/database'`).

## Technologies

- **Next.js 14** - React framework
- **Electron** - Desktop application framework
- **TypeScript** - Type safety
- **Monaco Editor** - SQL editor with syntax highlighting
- **Tailwind CSS** - Styling
- **XLSX** - Excel export functionality
