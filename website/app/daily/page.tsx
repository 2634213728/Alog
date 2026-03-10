import { prisma } from '@/lib/prisma'
import LogCard from '@/components/LogCard'
import TagBadge from '@/components/TagBadge'

export const dynamic = 'force-dynamic'

export default async function DailyPage() {
  const [logs, tags] = await Promise.all([
    prisma.log.findMany({
      where: { type: 'daily' },
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.tag.findMany({
      where: { logs: { some: { log: { type: 'daily' } } } },
      include: { _count: { select: { logs: true } } },
      orderBy: { logs: { _count: 'desc' } },
      take: 15,
    }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <h1 className="text-2xl font-bold font-mono text-[#10b981]">工作日报</h1>
        </div>
        <p className="text-slate-500 text-sm mt-1 ml-10">
          共 <span className="text-[#10b981] font-mono">{logs.length}</span> 篇日报
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
          <div className="text-4xl mb-4 opacity-30">📅</div>
          <p className="text-slate-500 font-mono text-sm">暂无日报</p>
          <p className="text-slate-600 text-xs mt-2">对 AI 说「生成alog日报」即可推送</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <LogCard key={log.id} {...log} createdAt={log.createdAt.toISOString()} />
          ))}
        </div>
      )}
    </div>
  )
}
