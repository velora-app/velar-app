/**
 * App-wide constants. Use these instead of magic strings for API paths and config.
 */
export const API = {
  query: '/api/query',
  schema: '/api/schema',
} as const

export const SAVED_QUERIES_LIMIT = 200

/** Width in px of the connections/saved-queries drawer. */
export const DRAWER_WIDTH = 288
