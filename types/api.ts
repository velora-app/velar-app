import type { DatabaseTable, QueryResult } from './database'

/** Standard error payload returned by API routes on 4xx/5xx. */
export interface ApiErrorBody {
  error: string
  code?: string
}

/** POST /api/query request body (connection validated separately). */
export interface QueryRequestBody {
  connection: unknown
  query?: unknown
}

/** POST /api/schema request body (connection validated separately). */
export interface SchemaRequestBody {
  connection?: unknown
}

/** POST /api/schema response body. */
export interface SchemaResponseBody {
  tables: DatabaseTable[]
  error?: string
}

/** POST /api/query returns QueryResult; this type is for consistency. */
export type QueryResponseBody = QueryResult
