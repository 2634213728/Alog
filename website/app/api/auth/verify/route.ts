import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/auth/verify — verify admin token or API key
export async function POST(req: NextRequest) {
  let body: { token?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ valid: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const { token } = body
  if (!token || token.trim().length === 0) {
    return NextResponse.json({ valid: false, error: 'Token is required' }, { status: 400 })
  }

  // Check admin token first
  if (token === process.env.ADMIN_TOKEN) {
    return NextResponse.json({ valid: true, role: 'admin' })
  }

  // Check API key
  const keyRecord = await prisma.apiKey.findUnique({ where: { key: token } })
  if (keyRecord) {
    return NextResponse.json({ valid: true, role: 'apikey', source: keyRecord.source })
  }

  return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 401 })
}
