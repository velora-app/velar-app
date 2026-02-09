/**
 * Central logger. Use instead of console.error/log/warn so we can add levels, env filtering, or forwarding later.
 */
const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'

export const logger = {
  error(message: string, error?: unknown): void {
    if (isDev && error !== undefined) {
      console.error(`[error] ${message}`, error)
    } else {
      console.error(`[error] ${message}${error instanceof Error ? `: ${error.message}` : ''}`)
    }
  },
  warn(message: string, meta?: unknown): void {
    if (meta !== undefined) console.warn(`[warn] ${message}`, meta)
    else console.warn(`[warn] ${message}`)
  },
  info(message: string, meta?: unknown): void {
    if (meta !== undefined) console.info(`[info] ${message}`, meta)
    else console.info(`[info] ${message}`)
  },
}
