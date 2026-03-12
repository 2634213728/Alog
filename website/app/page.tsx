import { prisma } from '@/lib/prisma'
import LogCard from '@/components/LogCard'
import TagBadge from '@/components/TagBadge'
import Link from 'next/link'
import StatCounterGrid from '@/components/StatCounterGrid'

export const revalidate = 30

const FEATURES = [
  {
    icon: '⚡',
    title: '零安装接入',
    desc: '规则文件内嵌完整推送命令，AI 工具直接执行，无需安装任何 CLI 或配置环境变量。',
    accent: 'var(--accent)',
  },
  {
    icon: '🔌',
    title: '多工具来源',
    desc: '支持 GitHub Copilot、Cursor、Claude Code、Windsurf 等，每个工具独立 API Key。',
    accent: 'var(--accent2)',
  },
  {
    icon: '🔍',
    title: '全文检索',
    desc: '对标题、正文、标签进行模糊检索，支持按类型、作者、日期范围组合过滤。',
    accent: 'var(--accent-green)',
  },
]

export default async function HomePage() {
  const [allLogs, tags, authors] = await Promise.all([
    prisma.log.findMany({
      select: { id: true, type: true, viewCount: true },
    }),
    prisma.tag.count(),
    prisma.log.groupBy({ by: ['author'], where: { author: { not: '' } } }),
  ])

  const totalLogs   = allLogs.length
  const dailyCount  = allLogs.filter(l => l.type === 'daily').length
  const blogCount   = allLogs.filter(l => l.type === 'blog').length
  const totalViews  = allLogs.reduce((s, l) => s + l.viewCount, 0)
  const authorCount = authors.length

  const recentLogs = await prisma.log.findMany({
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  const topTags = await prisma.tag.findMany({
    include: { _count: { select: { logs: true } } },
    orderBy: { logs: { _count: 'desc' } },
    take: 16,
  })

  const STATS = [
    { label: '日志总数', value: totalLogs,   unit: '条', icon: '📋', href: '/logs',    accent: 'var(--accent)',       iconBg: 'rgba(var(--accent-rgb),0.12)' },
    { label: '工作日报', value: dailyCount,  unit: '篇', icon: '📅', href: '/daily',   accent: 'var(--accent-green)', iconBg: 'rgba(16,185,129,0.12)' },
    { label: '技术博客', value: blogCount,   unit: '篇', icon: '📝', href: '/blog',    accent: 'var(--accent2)',      iconBg: 'rgba(var(--accent2-rgb),0.12)' },
    { label: '累计阅读', value: totalViews,  unit: '次', icon: '👁',  href: '/logs',   accent: 'var(--accent)',       iconBg: 'rgba(var(--accent-rgb),0.12)' },
  ]

  return (
    <div className="space-y-12">

      {/* ——— Hero ——— */}
      <section className="pt-4 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono badge-scan"
          style={{ borderColor: 'rgba(var(--accent-rgb),0.25)', background: 'rgba(var(--accent-rgb),0.06)', color: 'var(--accent)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-glow" style={{ background: 'var(--accent)' }} />
          AI Work Log Platform
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold font-mono tracking-tight leading-tight"
          style={{ color: 'var(--text-primary)' }}>
          <span className="hero-neon logo-shimmer">ALOG</span>
          <br />
          <span className="text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--text-secondary)' }}>
            AI 编程工作日志聚合平台
          </span>
        </h1>
        <p className="text-base leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
          让每次 AI 协作的工作留下可追溯的记录。
          只需对 AI 说 <code style={{ background: 'rgba(var(--accent-rgb),0.1)', border: '1px solid rgba(var(--accent-rgb),0.2)', borderRadius: '4px', padding: '0.1em 0.4em', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9em' }}>生成alog日报</code>，
          即可自动整理并推送日志，无需任何手动操作。
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/setup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold font-mono transition-all duration-200"
            style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 0 20px rgba(var(--accent-rgb),0.3)' }}>
            快速接入 →
          </Link>
          <Link href="/logs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold font-mono transition-all duration-200 alog-card">
            <span style={{ color: 'var(--text-secondary)' }}>浏览日志</span>
          </Link>
        </div>
      </section>

      {/* ——— Stats grid ——— */}
      <section className="space-y-3">
        <h2 className="cyber-section-title">数据概览</h2>
        <StatCounterGrid stats={STATS} cols={4} />
      </section>

      {/* ——— Features ——— */}
      <section className="space-y-3">
        <h2 className="cyber-section-title">核心特性</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card p-5 space-y-3">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="font-semibold font-mono text-sm" style={{ color: f.accent }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="gradient-divider" />

      {/* ——— Recent logs ——— */}
      {recentLogs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="cyber-section-title">最新动态</h2>
            <Link href="/logs" className="text-xs font-mono transition-colors"
              style={{ color: 'var(--accent)' }}>
              查看全部 →
            </Link>
          </div>
          <div className="logs-grid-2">
            {recentLogs.map((log) => (
              <LogCard key={log.id} {...log} createdAt={log.createdAt.toISOString()} />
            ))}
          </div>
        </section>
      )}

      {/* ——— Tag cloud ——— */}
      {topTags.length > 0 && (
        <section className="space-y-3">
          <h2 className="cyber-section-title">热门标签</h2>
          <div className="flex flex-wrap gap-2">
            {topTags.map((tag) => (
              <TagBadge key={tag.id} name={tag.name} slug={tag.slug} count={tag._count.logs} size="md" />
            ))}
          </div>
        </section>
      )}

      {/* ——— CTA ——— */}
      {totalLogs === 0 && (
        <div className="alog-card p-8 text-center space-y-3">
          <div className="text-4xl opacity-30">◈</div>
          <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>还没有任何日志</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            访问 <Link href="/setup" style={{ color: 'var(--accent)' }}>/setup</Link> 页面，两步完成接入，让 AI 自动推送日志
          </p>
        </div>
      )}

    </div>
  )
}

