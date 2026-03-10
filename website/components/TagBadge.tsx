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
      className={`inline-flex items-center gap-1 rounded-full border font-mono transition-all duration-200
        ${base}
        ${active
          ? 'border-[#00d4ff60] bg-[#00d4ff15] text-[#00d4ff]'
          : 'border-[#1e2d40] bg-[#0f1629] text-slate-400 hover:border-[#00d4ff40] hover:text-[#00d4ff] hover:bg-[#00d4ff0a]'
        }`}
    >
      <span className="opacity-60">#</span>
      {name}
      {count !== undefined && (
        <span className="opacity-50 text-[10px]">{count}</span>
      )}
    </Link>
  )
}
