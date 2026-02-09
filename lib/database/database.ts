import {
  DatabaseConnection,
  QueryResult,
  DatabaseType,
  QUERY_TIMEOUT_MS,
  MAX_QUERY_ROWS,
} from '@/types'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Query timed out after ${ms / 1000}s`)), ms)
    ),
  ])
}

function applyMaxRows(result: QueryResult): QueryResult {
  if (result.rows.length <= MAX_QUERY_ROWS) return result
  const fullCount = result.rowCount ?? result.rows.length
  return {
    ...result,
    rows: result.rows.slice(0, MAX_QUERY_ROWS),
    rowCount: fullCount,
    truncatedMessage: `Results limited to ${MAX_QUERY_ROWS.toLocaleString()} of ${fullCount.toLocaleString()} rows`,
  }
}

export async function executeQuery(
  connection: DatabaseConnection,
  query: string
): Promise<QueryResult> {
  const startTime = Date.now()

  try {
    let result: QueryResult
    switch (connection.type) {
      case 'postgresql':
        result = await executePostgreSQL(connection, query, startTime)
        break
      case 'mysql':
        result = await withTimeout(executeMySQL(connection, query, startTime), QUERY_TIMEOUT_MS)
        break
      case 'sqlite':
        result = await withTimeout(executeSQLite(connection, query, startTime), QUERY_TIMEOUT_MS)
        break
      case 'mongodb':
        result = await executeMongoDB(connection, query, startTime)
        break
      case 'redis':
        result = await withTimeout(executeRedis(connection, query, startTime), QUERY_TIMEOUT_MS)
        break
      default:
        throw new Error(`Unsupported database type: ${connection.type}`)
    }
    return applyMaxRows(result)
  } catch (error) {
    return {
      columns: [],
      rows: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: Date.now() - startTime,
    }
  }
}

async function executePostgreSQL(
  connection: DatabaseConnection,
  query: string,
  startTime: number
): Promise<QueryResult> {
  const { Pool } = require('pg')
  const pool = new Pool({
    host: connection.host,
    port: connection.port,
    database: connection.database,
    user: connection.username,
    password: connection.password,
    ssl: connection.ssl ? { rejectUnauthorized: false } : false,
  })

  try {
    const result = await pool.query({
      text: query,
      statement_timeout: QUERY_TIMEOUT_MS,
    })
    const fields = result.fields as Array<{ name: string }>
    const rows = result.rows as Record<string, unknown>[]
    return {
      columns: fields.map((f) => f.name),
      rows: rows.map((row) => Object.values(row)),
      rowCount: result.rowCount,
      executionTime: Date.now() - startTime,
    }
  } finally {
    await pool.end()
  }
}

async function executeMySQL(
  connection: DatabaseConnection,
  query: string,
  startTime: number
): Promise<QueryResult> {
  const mysql = require('mysql2/promise')
  const conn = await mysql.createConnection({
    host: connection.host,
    port: connection.port,
    database: connection.database,
    user: connection.username,
    password: connection.password,
    ssl: connection.ssl ? {} : undefined,
  })

  try {
    const [rows, fields] = await conn.execute(query)
    const fieldList = fields as Array<{ name: string }>
    const rowList = Array.isArray(rows) ? (rows as Record<string, unknown>[]) : []
    return {
      columns: fieldList.map((f) => f.name),
      rows: rowList.map((row) => Object.values(row)),
      rowCount: rowList.length,
      executionTime: Date.now() - startTime,
    }
  } finally {
    await conn.end()
  }
}

async function executeSQLite(
  connection: DatabaseConnection,
  query: string,
  startTime: number
): Promise<QueryResult> {
  const Database = require('better-sqlite3')
  const db = new Database(connection.database || connection.host)

  try {
    // Check if it's a SELECT query
    const trimmedQuery = query.trim().toUpperCase()
    if (trimmedQuery.startsWith('SELECT')) {
      const stmt = db.prepare(query)
      const rows = stmt.all() as Record<string, unknown>[]

      if (rows.length === 0) {
        return {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: Date.now() - startTime,
        }
      }

      const columns = Object.keys(rows[0])
      const resultRows = rows.map((row) => columns.map((col) => row[col]))

      return {
        columns,
        rows: resultRows,
        rowCount: rows.length,
        executionTime: Date.now() - startTime,
      }
    } else {
      // For non-SELECT queries (INSERT, UPDATE, DELETE, etc.)
      const stmt = db.prepare(query)
      const result = stmt.run()

      return {
        columns: [],
        rows: [],
        rowCount: result.changes || 0,
        executionTime: Date.now() - startTime,
      }
    }
  } finally {
    db.close()
  }
}

async function executeMongoDB(
  connection: DatabaseConnection,
  query: string,
  startTime: number
): Promise<QueryResult> {
  const { MongoClient } = require('mongodb')
  const uri = `mongodb://${connection.username}:${connection.password}@${connection.host}:${connection.port}/${connection.database}`

  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db(connection.database)

    // For MongoDB, we'll try to parse the query as JSON
    let parsedQuery: { collection?: string; filter?: unknown; projection?: unknown; limit?: number }
    try {
      parsedQuery = JSON.parse(query) as typeof parsedQuery
    } catch {
      // If not JSON, treat as collection name and return all documents
      const collection = db.collection(query.trim())
      const documents = await collection
        .find({})
        .limit(MAX_QUERY_ROWS)
        .maxTimeMS(QUERY_TIMEOUT_MS)
        .toArray()

      if (documents.length === 0) {
        return {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: Date.now() - startTime,
        }
      }

      const columns = Object.keys(documents[0] as Record<string, unknown>)
      const rows = (documents as Record<string, unknown>[]).map((doc) =>
        columns.map((col) => {
          const value = doc[col]
          return typeof value === 'object' && value !== null ? JSON.stringify(value) : value
        })
      )

      return {
        columns,
        rows,
        rowCount: documents.length,
        executionTime: Date.now() - startTime,
      }
    }

    // Execute parsed MongoDB query
    const { collection, filter, projection, limit } = parsedQuery
    if (!collection || typeof collection !== 'string') {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: Date.now() - startTime,
      }
    }
    const coll = db.collection(collection)
    const documents = await coll
      .find(filter || {}, projection || {})
      .limit(Math.min(limit ?? 100, MAX_QUERY_ROWS))
      .maxTimeMS(QUERY_TIMEOUT_MS)
      .toArray()

    if (documents.length === 0) {
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: Date.now() - startTime,
      }
    }

    const columns = Object.keys(documents[0] as Record<string, unknown>)
    const rows = (documents as Record<string, unknown>[]).map((doc) =>
      columns.map((col) => {
        const value = doc[col]
        return typeof value === 'object' && value !== null ? JSON.stringify(value) : value
      })
    )

    return {
      columns,
      rows,
      rowCount: documents.length,
      executionTime: Date.now() - startTime,
    }
  } finally {
    await client.close()
  }
}

async function executeRedis(
  connection: DatabaseConnection,
  query: string,
  startTime: number
): Promise<QueryResult> {
  const redis = require('redis')
  const client = redis.createClient({
    socket: {
      host: connection.host,
      port: connection.port,
    },
    password: connection.password || undefined,
  })

  await client.connect()

  try {
    // Parse Redis command
    const parts = query.trim().split(/\s+/)
    const command = parts[0].toUpperCase()
    const args = parts.slice(1)

    const result = await client.sendCommand([command, ...args])

    return {
      columns: ['Result'],
      rows: [[typeof result === 'string' ? result : JSON.stringify(result)]],
      rowCount: 1,
      executionTime: Date.now() - startTime,
    }
  } finally {
    await client.quit()
  }
}
