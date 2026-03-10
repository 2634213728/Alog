import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/authors — returns all authors with log counts
export async function GET() {
  // Group logs by author, counting type breakdown
  const logs = await prisma.log.findMany({
    select: { author: true, source: true, type: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  // Deduplicate and aggregate
  const authorMap = new Map<string, {
    name: string
    source: string
    logCount: number
    dailyCount: number
    blogCount: number
    lastActive: string
  }>()

  for (const log of logs) {
    const name = log.author || log.source
    if (!authorMap.has(name)) {
      authorMap.set(name, {
        name,
        source: log.source,
        logCount: 0,
        dailyCount: 0,
        blogCount: 0,
        lastActive: log.createdAt.toISOString(),
      })
    }
    const entry = authorMap.get(name)!
    entry.logCount++
    if (log.type === 'daily') entry.dailyCount++
    else if (log.type === 'blog') entry.blogCount++
  }

  const authors = Array.from(authorMap.values()).sort((a, b) => b.logCount - a.logCount)

  return NextResponse.json({ authors })
}
