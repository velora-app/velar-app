import { describe, it, expect } from 'vitest'
import { buildCsv, buildJsonFromRows } from '@/lib'

describe('buildCsv', () => {
  it('returns header row and newline when no rows', () => {
    expect(buildCsv(['a', 'b'], [])).toBe('a,b\n')
  })

  it('joins columns and rows with commas', () => {
    expect(buildCsv(['x', 'y'], [[1, 2]])).toBe('x,y\n1,2')
    expect(buildCsv(['a', 'b'], [[1, 2], [3, 4]])).toBe('a,b\n1,2\n3,4')
  })

  it('escapes values containing comma in double quotes', () => {
    expect(buildCsv(['col'], [['a,b']])).toBe('col\n"a,b"')
  })

  it('escapes double quotes by doubling them', () => {
    expect(buildCsv(['col'], [['say "hi"']])).toBe('col\n"say ""hi"""')
  })

  it('escapes newlines in quoted value', () => {
    expect(buildCsv(['col'], [['line1\nline2']])).toBe('col\n"line1\nline2"')
  })

  it('treats null and undefined as empty string', () => {
    expect(buildCsv(['a', 'b'], [[null, undefined]])).toBe('a,b\n,')
  })
})

describe('buildJsonFromRows', () => {
  it('returns pretty-printed array of objects', () => {
    const out = buildJsonFromRows(['a', 'b'], [[1, 2], [3, 4]])
    const parsed = JSON.parse(out)
    expect(parsed).toEqual([{ a: 1, b: 2 }, { a: 3, b: 4 }])
  })

  it('uses column names as keys', () => {
    const out = buildJsonFromRows(['id', 'name'], [['1', 'Alice']])
    expect(JSON.parse(out)).toEqual([{ id: '1', name: 'Alice' }])
  })

  it('handles empty rows', () => {
    expect(buildJsonFromRows(['a'], [])).toBe('[]')
  })

  it('handles null/undefined in cells', () => {
    const out = buildJsonFromRows(['x'], [[null]])
    expect(JSON.parse(out)).toEqual([{ x: null }])
  })
})
