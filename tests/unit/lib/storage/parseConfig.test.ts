import { describe, it, expect } from 'vitest'
import { parseConnectionConfig } from '@/lib'

describe('parseConnectionConfig', () => {
  it('returns null for empty or whitespace-only input', () => {
    expect(parseConnectionConfig('')).toBeNull()
    expect(parseConnectionConfig('   ')).toBeNull()
  })

  it('parses JSON config with dialect', () => {
    const json = JSON.stringify({
      development: {
        dialect: 'postgresql',
        host: 'localhost',
        port: 5432,
        database: 'mydb',
        username: 'user',
        password: 'secret',
      },
    })
    const out = parseConnectionConfig(json)
    expect(out).not.toBeNull()
    expect(out?.type).toBe('postgresql')
    expect(out?.host).toBe('localhost')
    expect(out?.port).toBe(5432)
    expect(out?.database).toBe('mydb')
    expect(out?.username).toBe('user')
    expect(out?.password).toBe('secret')
  })

  it('parses .env-like config', () => {
    const env = `
      DIALECT=mysql
      HOST=db.example.com
      PORT=3306
      DATABASE=app
      USERNAME=root
      PASSWORD=pass
    `
    const out = parseConnectionConfig(env)
    expect(out).not.toBeNull()
    expect(out?.type).toBe('mysql')
    expect(out?.host).toBe('db.example.com')
    expect(out?.port).toBe(3306)
    expect(out?.database).toBe('app')
    expect(out?.username).toBe('root')
    expect(out?.password).toBe('pass')
  })

  it('prefers JSON when both valid', () => {
    const text = '{"development":{"dialect":"sqlite","database":"file.db"}}'
    const out = parseConnectionConfig(text)
    expect(out?.type).toBe('sqlite')
    expect(out?.database).toBe('file.db')
  })
})
