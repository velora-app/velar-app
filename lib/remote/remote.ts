/**
 * Run query and fetch schema: Electron IPC vs Next.js API (single place for branching).
 */
import type { DatabaseConnection, DatabaseTable, QueryResult, ApiErrorBody, SchemaResponseBody } from '@/types'
import { API } from '../api'

async function readErrorBody(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text.trim()) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    const err = (body as ApiErrorBody).error
    if (typeof err === 'string') return err
  }
  return fallback
}

export async function runQuery(
  connection: DatabaseConnection,
  query: string
): Promise<QueryResult> {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI.executeQuery(connection, query.trim())
  }
  const res = await fetch(API.query, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connection, query: query.trim() }),
  })
  if (!res.ok) {
    const body = await readErrorBody(res)
    throw new Error(getErrorMessage(body, `Query execution failed (${res.status})`))
  }
  return (await res.json()) as QueryResult
}

export async function fetchSchemaRemote(
  connection: DatabaseConnection
): Promise<{ tables: DatabaseTable[]; error?: string }> {
  if (typeof window !== 'undefined' && window.electronAPI) {
    const response = await window.electronAPI.fetchSchema(connection)
    if (response.error) throw new Error(response.error)
    return { tables: response.tables ?? [] }
  }
  const res = await fetch(API.schema, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connection }),
  })
  if (!res.ok) {
    const body = await readErrorBody(res)
    throw new Error(getErrorMessage(body, `Unable to load schema (${res.status})`))
  }
  return (await res.json()) as SchemaResponseBody
}
