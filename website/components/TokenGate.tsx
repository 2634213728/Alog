'use client'

import { useState, useEffect } from 'react'

const SESSION_KEY = 'alog_token'

interface TokenGateProps {
  onVerified: (token: string) => void
  onCancel: () => void
}

export function TokenGate({ onVerified, onCancel }: TokenGateProps) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-fill from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) setToken(saved)
  }, [])

  const verify = async () => {
    if (!token.trim()) { setError('请输入 Token'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      })
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, token.trim())
        onVerified(token.trim())
      } else {
        setError('Token 无效，请检查 ADMIN_TOKEN 或 API Key')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="alog-card p-6 w-full max-w-md mx-4">
        <h3 className="text-base font-semibold font-mono mb-1" style={{ color: '#e2e8f0' }}>
          🔑 身份验证
        </h3>
        <p className="text-xs mb-4" style={{ color: '#64748b' }}>
          输入 ADMIN_TOKEN 或任意有效 API Key 以继续操作
        </p>

        <input
          type="password"
          placeholder="alog_xxxx... 或 Admin Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && verify()}
          autoFocus
          className="w-full px-3 py-2 rounded-md text-sm font-mono mb-3 outline-none focus:ring-1"
          style={{
            background: '#060a14',
            border: '1px solid #1e2d40',
            color: '#e2e8f0',
            // @ts-ignore
            '--tw-ring-color': '#00d4ff40',
          }}
        />

        {error && (
          <p className="text-xs mb-3" style={{ color: '#f87171' }}>{error}</p>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded-md text-sm font-mono text-slate-400 hover:text-slate-200 transition-colors"
            style={{ background: '#ffffff08' }}
          >
            取消
          </button>
          <button
            onClick={verify}
            disabled={loading}
            className="px-4 py-1.5 rounded-md text-sm font-mono font-medium transition-colors disabled:opacity-50"
            style={{
              background: loading ? '#00d4ff30' : '#00d4ff20',
              border: '1px solid #00d4ff50',
              color: '#00d4ff',
            }}
          >
            {loading ? '验证中...' : '确认'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook: get cached token from sessionStorage
export function getCachedToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(SESSION_KEY)
}

export function clearCachedToken() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
}
