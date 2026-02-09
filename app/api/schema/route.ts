import { NextRequest, NextResponse } from 'next/server'
import type { SchemaRequestBody } from '@/types'
import { fetchSchema, validateConnection } from '@/lib/database'
import { badRequest, serverError, logger } from '@/lib'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown
    const rawConnection =
      typeof body === 'object' && body !== null && 'connection' in body
        ? (body as SchemaRequestBody).connection
        : undefined
    const validated = validateConnection(rawConnection)
    if (validated.error || !validated.connection) {
      return badRequest(validated.error ?? 'Connection is required')
    }

    const tables = await fetchSchema(validated.connection)
    return NextResponse.json({ tables })
  } catch (error) {
    return serverError('Schema API error', error, logger.error)
  }
}
