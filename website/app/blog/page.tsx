import { prisma } from '@/lib/prisma'
import LogCard from '@/components/LogCard'
import TagBadge from '@/components/TagBadge'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const [logs, tags] = await Promise.all([
    prisma.log.findMany({
      where: { type: 'blog' },
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.tag.findMany({
      where: { logs: { some: { log: { type: 'blog' } } } },
      include: { _count: { select: { logs: true } } },
      orderBy: { logs: { _count: 'desc' } },
      take: 15,
    }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">📝</span>
          <h1 className="text-2xl font-bold font-mono tracking-wide" style={{ color: 'var(--accent2)' }}>技术博客</h1>
        </div>
        <p className="text-sm mt-1 ml-10" style={{ color: 'var(--text-muted)' }}>
          沉淀技术思考，总计 <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{logs.length}</span> 篇
        </p>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag.id} name={tag.name} slug={tag.slug} count={tag._count.logs} size="md" />
          ))}
        </div>
      )}

      <div className="gradient-divider" />

      {logs.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4 opacity-30">📝</div>
          <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>暂无博客</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>对 AI 说「生成alog博客」即可推送</p>
        </div>
      ) : (
        <div className="logs-grid-2">
          {logs.map((log) => (
            <LogCard key={log.id} {...log} createdAt={log.createdAt.toISOString()} />
          ))}
        </div>
      )}
    </div>
  )
}
