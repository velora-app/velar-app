import { NextRequest, NextResponse } from 'next/server'
import type { QueryRequestBody } from '@/types'
import { executeQuery, validateConnection } from '@/lib/database'
import { badRequest, logger } from '@/lib'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown
    if (typeof body !== 'object' || body === null) {
      return badRequest('Invalid request body')
    }
    const { connection: rawConnection, query: rawQuery } = body as QueryRequestBody
    const validated = validateConnection(rawConnection)
    if (validated.error || !validated.connection) {
      return badRequest(validated.error ?? 'Connection is required')
    }
    const query = rawQuery
    if (typeof query !== 'string' || !query.trim()) {
      return badRequest('Query is required')
    }

    const result = await executeQuery(validated.connection, query.trim())
    return NextResponse.json(result)
  } catch (error) {
    logger.error('Query API error', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ columns: [], rows: [], error: message }, { status: 500 })
  }
}
