import { describe, it, expect } from 'vitest'
import {
  loadConnections,
  loadSavedQueries,
  saveConnections,
  saveSavedQueries,
  loadActiveConnectionId,
  saveActiveConnectionId,
} from '@/lib'

describe('storage (node env)', () => {
  it('loadConnections returns empty array when window is undefined', () => {
    expect(loadConnections()).toEqual([])
  })

  it('loadSavedQueries returns empty array when window is undefined', () => {
    expect(loadSavedQueries()).toEqual([])
  })

  it('loadActiveConnectionId returns null when window is undefined', () => {
    expect(loadActiveConnectionId()).toBeNull()
  })

  it('saveConnections does not throw when given valid array', () => {
    expect(() =>
      saveConnections([
        {
          id: 'c1',
          name: 'Test',
          type: 'postgresql',
          host: 'localhost',
          port: 5432,
          database: 'db',
          username: '',
          password: '',
        },
      ])
    ).not.toThrow()
  })

  it('saveSavedQueries does not throw when given valid array', () => {
    expect(() =>
      saveSavedQueries([
        { id: 'q1', name: 'Q', query: 'SELECT 1', createdAt: Date.now() },
      ])
    ).not.toThrow()
  })

  it('saveActiveConnectionId does not throw', () => {
    expect(() => saveActiveConnectionId('conn-1')).not.toThrow()
    expect(() => saveActiveConnectionId(null)).not.toThrow()
  })
})
