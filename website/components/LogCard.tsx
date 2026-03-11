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
      {showGate && (
        <TokenGate onVerified={onTokenVerified} onCancel={() => { setShowGate(false); setPendingAction(null) }} />
      )}

      {/* Delete confirm */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="alog-card p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold font-mono mb-2" style={{ color: '#e2e8f0' }}>确认删除</h3>
            <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>此操作不可恢复，确认删除这条日志吗？</p>
            <div className="flex gap-2 justify-end">
              <button onClick={(e) => { e.stopPropagation(); setShowConfirm(false) }}
                className="px-4 py-1.5 rounded-md text-sm font-mono text-slate-400" style={{ background: '#ffffff08' }}>取消</button>
              <button onClick={(e) => { e.stopPropagation(); doDelete() }} disabled={deleting}
                className="px-4 py-1.5 rounded-md text-sm font-mono disabled:opacity-50"
                style={{ background: '#f8717120', border: '1px solid #f8717150', color: '#f87171' }}>
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
        {/* Time + actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Edit/Delete — visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => triggerAction('edit', e)}
              className="px-2 py-0.5 rounded text-xs font-mono transition-colors"
              style={{ background: '#00d4ff12', border: '1px solid #00d4ff30', color: '#00d4ff' }}
              title="编辑"
            >
              ✏️
            </button>
            <button
              onClick={(e) => triggerAction('delete', e)}
              className="px-2 py-0.5 rounded text-xs font-mono transition-colors"
              style={{ background: '#f8717112', border: '1px solid #f8717130', color: '#f87171' }}
              title="删除"
            >
              🗑
            </button>
          </div>
          <time className="text-xs font-mono text-slate-500">
            {formatDateTime(createdAt)}
          </time>
        </div>
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
