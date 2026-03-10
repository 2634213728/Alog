import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/utils'

// GET /api/keys — list all API keys
export async function GET(req: NextRequest) {
  const adminToken = req.headers.get('x-admin-token')
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, source: true, author: true, createdAt: true, key: true },
  })
  return NextResponse.json({ apiKeys: keys })
}

// POST /api/keys — create new API key
export async function POST(req: NextRequest) {
  const adminToken = req.headers.get('x-admin-token')
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, source, author } = await req.json()
  if (!name || !source) {
    return NextResponse.json({ error: 'name and source are required' }, { status: 400 })
  }

  const key = generateApiKey()
  const apiKey = await prisma.apiKey.create({
    data: { name, source, author: author ?? '', key },
  })

  return NextResponse.json({ success: true, apiKey }, { status: 201 })
}

// DELETE /api/keys — delete by ?id= query param or JSON body
export async function DELETE(req: NextRequest) {
  const adminToken = req.headers.get('x-admin-token')
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Support ?id= query param
  const idFromQuery = req.nextUrl.searchParams.get('id')
  let id = idFromQuery
  if (!id) {
    const body = await req.json().catch(() => ({}))
    id = body.id
  }
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await prisma.apiKey.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
