import { prisma } from '@/lib/prisma'
import TagBadge from '@/components/TagBadge'

export const dynamic = 'force-dynamic'

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { logs: true } } },
    orderBy: { logs: { _count: 'desc' } },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-mono text-[#e2e8f0]">标签索引</h1>
        <p className="text-slate-500 text-sm mt-1">
          共 <span className="text-[#00d4ff] font-mono">{tags.length}</span> 个标签
        </p>
      </div>

      <div className="gradient-divider" />

      {tags.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4 opacity-30">#</div>
          <p className="text-slate-500 font-mono text-sm">暂无标签</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              slug={tag.slug}
              count={tag._count.logs}
              size="md"
            />
          ))}
        </div>
      )}
    </div>
  )
}
