/**
 * Parse .env-like or JSON config into connection params (DRY: single place for config parsing).
 */
import type { ParsedConfig } from '@/types'

export type { ParsedConfig }

function inferType(dialect: string): string | undefined {
  const val = dialect.toLowerCase()
  if (val.includes('postgres')) return 'postgresql'
  if (val.includes('mysql')) return 'mysql'
  if (val.includes('sqlite')) return 'sqlite'
  if (val.includes('mongo')) return 'mongodb'
  if (val.includes('redis')) return 'redis'
  return undefined
}

function parseEnvLike(text: string): ParsedConfig {
  const obj: Record<string, string> = {}
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/)
      if (match) {
        const key = match[1].toUpperCase()
        let value = match[2]
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
        obj[key] = value
      }
    })
  return {
    type: inferType(obj['DIALECT'] || obj['DB_DIALECT'] || ''),
    username: obj['USERNAME'] || obj['USER'] || obj['DB_USERNAME'],
    password: obj['PASSWORD'] || obj['DB_PASSWORD'],
    database: obj['DATABASE'] || obj['DB_NAME'],
    host: obj['HOST'] || obj['DB_HOST'],
    port: obj['PORT'] ? Number(obj['PORT']) : obj['DB_PORT'] ? Number(obj['DB_PORT']) : undefined,
    name: obj['NAME'] || obj['DB_NAME'] || obj['DATABASE'],
  }
}

function parseJson(text: string): ParsedConfig | null {
  try {
    const json = JSON.parse(text)
    const candidate = json.development || json.test || json.production || json
    if (typeof candidate !== 'object' || Array.isArray(candidate)) return null
    return {
      type: inferType(String(candidate.dialect || candidate.type || '')),
      username: candidate.username,
      password: candidate.password,
      database: candidate.database,
      host: candidate.host,
      port: candidate.port ? Number(candidate.port) : undefined,
      name: candidate.name || candidate.database || candidate.host,
    }
  } catch {
    return null
  }
}

/** Parse raw text (JSON or .env-like) into connection config. */
export function parseConnectionConfig(text: string): ParsedConfig | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  return parseJson(trimmed) ?? parseEnvLike(trimmed)
}
