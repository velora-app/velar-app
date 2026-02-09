export type DatabaseType = 'postgresql' | 'mysql' | 'sqlite' | 'mongodb' | 'redis'

export interface DatabaseConnection {
  id: string
  name: string
  type: DatabaseType
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl?: boolean
}

export interface QueryResult {
  columns: string[]
  rows: unknown[][]
  error?: string
  rowCount?: number
  executionTime?: number
  /** Set when results were truncated to MAX_QUERY_ROWS. */
  truncatedMessage?: string
}

/** Query safety limits: timeout and max rows returned. Used by lib/database and Electron. */
export const QUERY_TIMEOUT_MS = 60_000
export const MAX_QUERY_ROWS = 10_000

export interface DatabaseTable {
  name: string
  schema?: string
  type: 'table' | 'view' | 'collection' | 'key'
}

export interface SavedQuery {
  id: string
  name: string
  query: string
  connectionId?: string
  connectionName?: string
  createdAt: number
}

export interface DatabaseColumn {
  name: string
  type: string
  nullable: boolean
  default?: unknown
}

/** Parsed connection config from .env-like or JSON (e.g. config import). */
export interface ParsedConfig {
  type?: string
  username?: string
  password?: string
  database?: string
  host?: string
  port?: number
  name?: string
}
