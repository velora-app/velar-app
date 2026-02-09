import type { DatabaseConnection, DatabaseTable } from '../types'

export async function fetchSchema(connection: DatabaseConnection): Promise<DatabaseTable[]> {
  switch (connection.type) {
    case 'postgresql':
      return fetchPostgresSchema(connection)
    case 'mysql':
      return fetchMySqlSchema(connection)
    case 'sqlite':
      return fetchSqliteSchema(connection)
    case 'mongodb':
      return fetchMongoSchema(connection)
    case 'redis':
      return fetchRedisSchema(connection)
    default:
      throw new Error(`Unsupported database type: ${connection.type}`)
  }
}

async function fetchPostgresSchema(connection: DatabaseConnection): Promise<DatabaseTable[]> {
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
    const result = await pool.query(`
      SELECT table_schema AS schema, table_name AS name, table_type
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name;
    `)
    const rows = result.rows as Array<{ name: string; schema: string; table_type: string }>
    return rows.map((row) => ({
      name: row.name,
      schema: row.schema,
      type: row.table_type === 'VIEW' ? ('view' as const) : ('table' as const),
    }))
  } finally {
    await pool.end()
  }
}

async function fetchMySqlSchema(connection: DatabaseConnection): Promise<DatabaseTable[]> {
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
    const [rows] = await conn.execute(
      `SELECT TABLE_SCHEMA AS schema, TABLE_NAME AS name, TABLE_TYPE AS tableType
       FROM information_schema.tables WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`,
      [connection.database]
    )
    const rowList = rows as Array<{ name: string; schema: string; tableType: string }>
    return rowList.map((row) => ({
      name: row.name,
      schema: row.schema,
      type: row.tableType === 'VIEW' ? ('view' as const) : ('table' as const),
    }))
  } finally {
    await conn.end()
  }
}

async function fetchSqliteSchema(connection: DatabaseConnection): Promise<DatabaseTable[]> {
  const Database = require('better-sqlite3')
  const db = new Database(connection.database || connection.host)
  try {
    const rows = db
      .prepare(
        `SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name`
      )
      .all()
    const rowList = rows as Array<{ name: string; type: string }>
    return rowList.map((row) => ({
      name: row.name,
      type: row.type === 'view' ? ('view' as const) : ('table' as const),
    }))
  } finally {
    db.close()
  }
}

async function fetchMongoSchema(connection: DatabaseConnection): Promise<DatabaseTable[]> {
  const { MongoClient } = require('mongodb')
  const uri = `mongodb://${connection.username}:${connection.password}@${connection.host}:${connection.port}/${connection.database}`
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(connection.database)
    const collections = await db.listCollections().toArray()
    const list = collections as Array<{ name: string }>
    return list.map((c) => ({ name: c.name, type: 'collection' as const }))
  } finally {
    await client.close()
  }
}

async function fetchRedisSchema(connection: DatabaseConnection): Promise<DatabaseTable[]> {
  const redis = require('redis')
  const client = redis.createClient({
    socket: { host: connection.host, port: connection.port },
    password: connection.password || undefined,
  })
  await client.connect()
  try {
    const keys = await client.keys('*')
    return (keys as string[]).map((key) => ({ name: key, type: 'key' as const }))
  } finally {
    await client.quit()
  }
}
