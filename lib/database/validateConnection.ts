/**
 * Validate request body into a DatabaseConnection for API routes.
 * Only known keys are copied into the connection object (safe against prototype pollution).
 */
import type { DatabaseConnection, DatabaseType } from '@/types'

const DB_TYPES: DatabaseType[] = ['postgresql', 'mysql', 'sqlite', 'mongodb', 'redis']

function isDbType(v: unknown): v is DatabaseType {
  return typeof v === 'string' && DB_TYPES.includes(v as DatabaseType)
}

export function validateConnection(
  body: unknown
): { connection: DatabaseConnection; error?: never } | { connection?: never; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Invalid request body' }
  }
  const o = body as Record<string, unknown>
  const type = o.type
  if (!isDbType(type)) {
    return { error: 'Invalid or missing connection type' }
  }
  if (typeof o.name !== 'string' || !o.name.trim()) {
    return { error: 'Connection name is required' }
  }
  if (typeof o.host !== 'string' || !o.host.trim()) {
    return { error: 'Host is required' }
  }
  if (typeof o.database !== 'string' || !o.database.trim()) {
    return { error: 'Database is required' }
  }
  const port = o.port != null ? Number(o.port) : NaN
  const connection: DatabaseConnection = {
    id: typeof o.id === 'string' ? o.id : `conn-${Date.now()}`,
    name: o.name.trim(),
    type,
    host: o.host.trim(),
    port: Number.isFinite(port) ? port : 5432,
    database: o.database.trim(),
    username: typeof o.username === 'string' ? o.username : '',
    password: typeof o.password === 'string' ? o.password : '',
    ssl: o.ssl === true,
  }
  return { connection }
}
