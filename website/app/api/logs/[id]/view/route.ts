import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/logs/[id]/view — increment view count
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const log = await prisma.log.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    })
    return NextResponse.json({ viewCount: log.viewCount })
  } catch {
    return NextResponse.json({ error: 'Log not found' }, { status: 404 })
  }
}
