import { describe, it, expect } from 'vitest'
import { validateConnection } from '@/lib/database'

describe('validateConnection', () => {
  it('returns error for null or non-object body', () => {
    expect(validateConnection(null)).toEqual({ error: 'Invalid request body' })
    expect(validateConnection(undefined)).toEqual({ error: 'Invalid request body' })
    expect(validateConnection('string')).toEqual({ error: 'Invalid request body' })
    expect(validateConnection(42)).toEqual({ error: 'Invalid request body' })
  })

  it('returns error for invalid or missing connection type', () => {
    expect(validateConnection({})).toEqual({ error: 'Invalid or missing connection type' })
    expect(validateConnection({ type: 'invalid' })).toEqual({
      error: 'Invalid or missing connection type',
    })
    expect(validateConnection({ type: 'postgres' })).toEqual({
      error: 'Invalid or missing connection type',
    })
  })

  it('returns error when required fields are missing', () => {
    expect(
      validateConnection({
        type: 'postgresql',
        name: '',
        host: 'localhost',
        database: 'mydb',
      })
    ).toEqual({ error: 'Connection name is required' })

    expect(
      validateConnection({
        type: 'postgresql',
        name: 'My Conn',
        host: '',
        database: 'mydb',
      })
    ).toEqual({ error: 'Host is required' })

    expect(
      validateConnection({
        type: 'postgresql',
        name: 'My Conn',
        host: 'localhost',
        database: '',
      })
    ).toEqual({ error: 'Database is required' })
  })

  it('returns connection for valid body with all required fields', () => {
    const result = validateConnection({
      type: 'postgresql',
      name: 'Test',
      host: 'localhost',
      database: 'mydb',
    })
    expect(result).toHaveProperty('connection')
    expect(result.connection).toMatchObject({
      name: 'Test',
      type: 'postgresql',
      host: 'localhost',
      database: 'mydb',
      username: '',
      password: '',
      ssl: false,
    })
    expect(result.connection!.id).toMatch(/^conn-\d+$/)
    expect(result.connection!.port).toBe(5432)
  })

  it('accepts valid types: mysql, sqlite, mongodb, redis', () => {
    const base = { name: 'X', host: 'h', database: 'd' }
    expect(validateConnection({ ...base, type: 'mysql' }).connection?.type).toBe('mysql')
    expect(validateConnection({ ...base, type: 'sqlite' }).connection?.type).toBe('sqlite')
    expect(validateConnection({ ...base, type: 'mongodb' }).connection?.type).toBe('mongodb')
    expect(validateConnection({ ...base, type: 'redis' }).connection?.type).toBe('redis')
  })

  it('uses provided id when string, otherwise generates conn-*', () => {
    const withId = validateConnection({
      type: 'postgresql',
      id: 'my-id',
      name: 'N',
      host: 'h',
      database: 'd',
    })
    expect(withId.connection!.id).toBe('my-id')

    const withoutId = validateConnection({
      type: 'postgresql',
      name: 'N',
      host: 'h',
      database: 'd',
    })
    expect(withoutId.connection!.id).toMatch(/^conn-\d+$/)
  })

  it('normalizes port and defaults to 5432', () => {
    const withPort = validateConnection({
      type: 'postgresql',
      name: 'N',
      host: 'h',
      port: 5433,
      database: 'd',
    })
    expect(withPort.connection!.port).toBe(5433)

    const withoutPort = validateConnection({
      type: 'postgresql',
      name: 'N',
      host: 'h',
      database: 'd',
    })
    expect(withoutPort.connection!.port).toBe(5432)
  })

  it('sets ssl only when true', () => {
    expect(
      validateConnection({
        type: 'postgresql',
        name: 'N',
        host: 'h',
        database: 'd',
        ssl: true,
      }).connection!.ssl
    ).toBe(true)
    expect(
      validateConnection({
        type: 'postgresql',
        name: 'N',
        host: 'h',
        database: 'd',
      }).connection!.ssl
    ).toBe(false)
  })
})
