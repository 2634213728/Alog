'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TagBadge from './TagBadge'
import { formatDateTime, getSourceColor } from '@/lib/utils'
import { TokenGate, getCachedToken } from './TokenGate'

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
    style: { color: 'var(--accent-green)', background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }
  },
  blog: {
    label: '博客',
    icon: '📝',
    style: { color: 'var(--accent2)', background: 'rgba(var(--accent2-rgb),0.1)', borderColor: 'rgba(var(--accent2-rgb),0.3)' }
  },
}

export default function LogCard({ id, type, title, content, source, author, createdAt, viewCount, tags }: LogCardProps) {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [showGate, setShowGate] = useState(false)
  const [pendingAction, setPendingAction] = useState<'edit' | 'delete' | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const cached = getCachedToken()
    if (cached) setToken(cached)
  }, [])

  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.blog
  const preview = content.replace(/^#.*\n?/gm, '').replace(/[*_`#>\-]/g, '').trim().slice(0, 120)
  const sourceColor = getSourceColor(source)

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) return
    router.push(`/${type}/${id}`)
  }

  const triggerAction = (action: 'edit' | 'delete', e: React.MouseEvent) => {
    e.stopPropagation()
    if (token) {
      if (action === 'edit') router.push(`/edit/${id}`)
      else setShowConfirm(true)
    } else {
      setPendingAction(action)
      setShowGate(true)
    }
  }

  const onTokenVerified = (tok: string) => {
    setToken(tok)
    setShowGate(false)
    if (pendingAction === 'edit') router.push(`/edit/${id}`)
    else if (pendingAction === 'delete') setShowConfirm(true)
    setPendingAction(null)
  }

  const doDelete = async () => {
    if (!token) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/logs/${id}`, {
        method: 'DELETE',
        headers: { 'x-token': token },
      })
      if (res.ok) {
        router.refresh()
      } else {
        alert('删除失败，请检查 Token')
        setToken(null)
      }
    } catch {
      alert('网络错误，请重试')
    } finally {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <article
      className="alog-card p-5 cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Type color indicator strip on left edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl opacity-40 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: config.style.color }}
      />
      {showGate && (
        <TokenGate onVerified={onTokenVerified} onCancel={() => { setShowGate(false); setPendingAction(null) }} />
      )}

      {/* Delete confirm */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="alog-card p-6 w-full max-w-sm" style={{ background: 'var(--card-bg)' }}>
            <h3 className="text-base font-semibold font-mono mb-2" style={{ color: 'var(--text-primary)' }}>确认删除</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>此操作不可恢复，确认删除这条日志吗？</p>
            <div className="flex gap-2 justify-end">
              <button onClick={(e) => { e.stopPropagation(); setShowConfirm(false) }}
                className="px-4 py-1.5 rounded-md text-sm font-mono transition-colors" 
                style={{ color: 'var(--text-muted)', background: 'rgba(var(--accent-rgb),0.05)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                取消
              </button>
              <button onClick={(e) => { e.stopPropagation(); doDelete() }} disabled={deleting}
                className="px-4 py-1.5 rounded-md text-sm font-mono disabled:opacity-50 transition-colors"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
                onMouseEnter={(e) => !deleting && (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                onMouseLeave={(e) => !deleting && (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}>
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-mono font-medium transition-all duration-200"
            style={{ ...config.style, boxShadow: `0 0 12px ${config.style.borderColor}` }}>
            {config.icon} {config.label}
          </span>
          {/* Source badge */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-mono"
            style={sourceColor}>
            {source}
          </span>
          {/* Author */}
          {author && (
            <span
              className="text-xs cursor-pointer transition-colors duration-200"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              onClick={(e) => { e.stopPropagation(); window.location.href = `/authors/${encodeURIComponent(author)}` }}
            >
              {author}
            </span>
          )}
        </div>
        {/* Time + actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Edit/Delete — visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => triggerAction('edit', e)}
              className="px-2 py-0.5 rounded text-xs font-mono transition-colors"
              style={{ background: 'rgba(var(--accent-rgb),0.1)', border: '1px solid rgba(var(--accent-rgb),0.2)', color: 'var(--accent)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.1)'}
              title="编辑"
            >
              ✏️
            </button>
            <button
              onClick={(e) => triggerAction('delete', e)}
              className="px-2 py-0.5 rounded text-xs font-mono transition-colors"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              title="删除"
            >
              🗑
            </button>
          </div>
          <time className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {formatDateTime(createdAt)}
          </time>
        </div>
      </div>

      {/* Title */}
      <h2 className="font-semibold text-base mb-2 transition-colors duration-200 leading-snug"
        style={{ color: 'var(--text-primary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}>
        {title}
      </h2>

      {/* Preview */}
      {preview && (
        <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
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
            <span className="ml-auto text-xs font-mono flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              👁 {viewCount}
            </span>
          )}
        </div>
      )}

      {/* Bottom line glow on hover */}
      <div className="mt-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
        style={{ background: 'linear-gradient(to right, transparent, rgba(var(--accent-rgb),0.25), transparent)' }} />
    </article>
  )
}
