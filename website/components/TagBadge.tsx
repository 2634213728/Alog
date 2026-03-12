'use client'

import Link from 'next/link'

interface TagBadgeProps {
  name: string
  slug: string
  count?: number
  active?: boolean
  size?: 'sm' | 'md'
}

export default function TagBadge({ name, slug, count, active, size = 'sm' }: TagBadgeProps) {
  const base = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-3 py-1 text-sm'

  return (
    <Link
      href={`/tags/${slug}`}
      className={`inline-flex items-center gap-1 rounded-full border font-mono transition-all duration-200 ${base}`}
      style={active ? {
        borderColor: 'rgba(var(--accent-rgb),0.38)',
        background: 'rgba(var(--accent-rgb),0.10)',
        color: 'var(--accent)',
        boxShadow: '0 0 10px rgba(var(--accent-rgb),0.2)',
      } : {
        borderColor: 'var(--border)',
        background: 'var(--card-bg)',
        color: 'var(--text-muted)',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.35)'
          e.currentTarget.style.color = 'var(--accent)'
          e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.08)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text-muted)'
          e.currentTarget.style.background = 'var(--card-bg)'
        }
      }}
    >
      <span className="opacity-60">#</span>
      {name}
      {count !== undefined && (
        <span className="opacity-50 text-[10px]">{count}</span>
      )}
    </Link>
  )
}
