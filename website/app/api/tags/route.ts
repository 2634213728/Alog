import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tags — all tags with log count
export async function GET(_req: NextRequest) {
  const tags = await prisma.tag.findMany({
    include: {
      _count: { select: { logs: true } },
    },
    orderBy: { logs: { _count: 'desc' } },
  })

  return NextResponse.json({
    tags: tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t._count.logs })),
  })
}
