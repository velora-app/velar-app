/**
 * Standard API response helpers. All API routes should use these for errors so clients get a consistent shape.
 */
import { NextResponse } from 'next/server'
import type { ApiErrorBody } from '@/types'

export type { ApiErrorBody }

/** Return 400 with standard { error } body. */
export function badRequest(error: string, code?: string): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error, code }, { status: 400 })
}

/** Return 500 with standard { error } body. Log the cause. */
export function serverError(
  message: string,
  cause: unknown,
  log: (msg: string, err?: unknown) => void
): NextResponse<ApiErrorBody> {
  log(message, cause)
  const error = cause instanceof Error ? cause.message : 'Unknown error'
  return NextResponse.json({ error, code: 'INTERNAL_ERROR' }, { status: 500 })
}
