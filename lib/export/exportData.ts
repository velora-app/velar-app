/**
 * Build export content for CSV/JSON. Single place for format logic.
 */
export function buildCsv(columns: string[], rows: unknown[][]): string {
  const headers = columns.join(',')
  const rowLines = rows.map((row) =>
    row
      .map((cell) => {
        const value = cell === null || cell === undefined ? '' : String(cell)
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      .join(',')
  )
  return `${headers}\n${rowLines.join('\n')}`
}

export function buildJsonFromRows(columns: string[], rows: unknown[][]): string {
  const data = rows.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, idx) => {
      obj[col] = row[idx]
    })
    return obj
  })
  return JSON.stringify(data, null, 2)
}
