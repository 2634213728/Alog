'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TokenGate, getCachedToken } from './TokenGate'

interface LogActionsProps {
  logId: string
  logType: string
}

export default function LogActions({ logId, logType }: LogActionsProps) {
  const router = useRouter()
  const [showGate, setShowGate] = useState(false)
  const [pendingAction, setPendingAction] = useState<'edit' | 'delete' | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const cached = getCachedToken()
    if (cached) setToken(cached)
  }, [])

  const handleEdit = () => {
    if (token) {
      router.push(`/edit/${logId}`)
    } else {
      setPendingAction('edit')
      setShowGate(true)
    }
  }

  const handleDelete = () => {
    if (token) {
      setShowConfirm(true)
    } else {
      setPendingAction('delete')
      setShowGate(true)
    }
  }

  const onTokenVerified = (tok: string) => {
    setToken(tok)
    setShowGate(false)
    if (pendingAction === 'edit') {
      router.push(`/edit/${logId}`)
    } else if (pendingAction === 'delete') {
      setShowConfirm(true)
    }
    setPendingAction(null)
  }

  const doDelete = async () => {
    if (!token) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/logs/${logId}`, {
        method: 'DELETE',
        headers: { 'x-token': token },
      })
      if (res.ok) {
        router.push(`/${logType}`)
        router.refresh()
      } else {
        alert('删除失败，请检查 Token 是否有效')
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
    <>
      {showGate && (
        <TokenGate onVerified={onTokenVerified} onCancel={() => { setShowGate(false); setPendingAction(null) }} />
      )}

      {/* Delete confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="alog-card p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold font-mono mb-2" style={{ color: '#e2e8f0' }}>
              确认删除
            </h3>
            <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
              此操作不可恢复，确认删除这条日志吗？
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-1.5 rounded-md text-sm font-mono text-slate-400 hover:text-slate-200 transition-colors"
                style={{ background: '#ffffff08' }}
              >
                取消
              </button>
              <button
                onClick={doDelete}
                disabled={deleting}
                className="px-4 py-1.5 rounded-md text-sm font-mono font-medium transition-colors disabled:opacity-50"
                style={{ background: '#f8717120', border: '1px solid #f8717150', color: '#f87171' }}
              >
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleEdit}
          className="px-3 py-1.5 rounded-md text-xs font-mono transition-colors"
          style={{ background: '#00d4ff12', border: '1px solid #00d4ff30', color: '#00d4ff' }}
        >
          ✏️ 编辑
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 rounded-md text-xs font-mono transition-colors"
          style={{ background: '#f8717112', border: '1px solid #f8717130', color: '#f87171' }}
        >
          🗑 删除
        </button>
      </div>
    </>
  )
}
