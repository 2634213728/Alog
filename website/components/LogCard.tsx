'use client'

import { useRouter } from 'next/navigation'
import TagBadge from './TagBadge'
import { formatDateTime, getSourceColor } from '@/lib/utils'

interface LogCardProps {
  id: string
  type: string
  title: string
  content: string
  source: string
  author: string
  createdAt: string
  viewCount: number
  tags: { tag: { id: string; name: string; slug: string } }[]
}

const TYPE_CONFIG = {
  daily: {
    label: '日报',
    icon: '📅',
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  },
  blog: {
    label: '博客',
    icon: '📝',
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  },
}

export default function LogCard({ id, type, title, content, source, author, createdAt, viewCount, tags }: LogCardProps) {
  const router = useRouter()
  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.blog
  const preview = content.replace(/^#.*\n?/gm, '').replace(/[*_`#>\-]/g, '').trim().slice(0, 120)
  const sourceColor = getSourceColor(source)

  const handleCardClick = (e: React.MouseEvent) => {
    // Do not navigate if user clicked a tag link
    if ((e.target as HTMLElement).closest('a')) return
    router.push(`/${type}/${id}`)
  }

  return (
    <article
      className="alog-card p-5 cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-mono font-medium ${config.color}`}>
            {config.icon} {config.label}
          </span>
          {/* Source badge */}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-mono ${sourceColor}`}>
            {source}
          </span>
          {/* Author */}
          {author && (
            <span
              className="text-xs text-slate-400 hover:text-[#00d4ff] cursor-pointer transition-colors duration-200"
              onClick={(e) => { e.stopPropagation(); window.location.href = `/authors/${encodeURIComponent(author)}` }}
            >
              {author}
            </span>
          )}
        </div>
        {/* Time */}
        <time className="text-xs font-mono text-slate-500 shrink-0">
          {formatDateTime(createdAt)}
        </time>
      </div>

      {/* Title */}
      <h2 className="text-[#e2e8f0] font-semibold text-base mb-2 group-hover:text-[#00d4ff] transition-colors duration-200 leading-snug">
        {title}
      </h2>

      {/* Preview */}
      {preview && (
        <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-2">
          {preview}…
        </p>
      )}

      {/* Tags + view count */}
      {(tags.length > 0 || viewCount > 0) && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {tags.map(({ tag }) => (
            <TagBadge key={tag.id} name={tag.name} slug={tag.slug} />
          ))}
          {viewCount > 0 && (
            <span className="ml-auto text-xs font-mono text-slate-500 flex items-center gap-1">
              👁 {viewCount}
            </span>
          )}
        </div>
      )}

      {/* Bottom line glow on hover */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-[#00d4ff20] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </article>
  )
}
