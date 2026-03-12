'use client'

import { useEffect, useRef, useState } from 'react'

const SCRIPT: { type: string; text: string }[] = [
  { type: 'cmd',  text: 'alog push --type daily --source copilot' },
  { type: 'out',  text: '  Connecting to Alog server...' },
  { type: 'ok',   text: '  ✓ Authenticated as copilot' },
  { type: 'ok',   text: '  ✓ Log created  →  ID-9231' },
  { type: 'ok',   text: '  ✓ Published to Alog 日报' },
  { type: 'gap',  text: '' },
  { type: 'cmd',  text: 'alog list --limit 3' },
  { type: 'out',  text: '  [daily]  完成前端深度重构   · just now' },
  { type: 'out',  text: '  [blog]   RAG 系统设计详解   · 2h ago' },
  { type: 'out',  text: '  [daily]  API 接口优化       · 1d ago' },
  { type: 'gap',  text: '' },
  { type: 'cmd',  text: 'alog stats' },
  { type: 'out',  text: '  Total Logs   128  ·  Tags   47  ·  Authors  3' },
  { type: 'ok',   text: '  Uptime  99.9%  ·  Avg Response  1.2s' },
]

interface Line {
  id: number
  type: string
  text: string
  partial?: string
  done?: boolean
}

export default function TerminalFX() {
  const [lines, setLines] = useState<Line[]>([])
  const [phase, setPhase] = useState(0)         // which SCRIPT item
  const [charIdx, setCharIdx] = useState(0)     // char within current cmd
  const bodyRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)

  // Scroll to bottom whenever lines change
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [lines])

  // Play the script
  useEffect(() => {
    if (phase >= SCRIPT.length) return

    const item = SCRIPT[phase]

    if (item.type === 'gap') {
      const t = setTimeout(() => {
        setPhase((p) => p + 1)
      }, 400)
      return () => clearTimeout(t)
    }

    if (item.type === 'cmd') {
      // Typing effect
      if (charIdx === 0) {
        // Add a new partial line for this command
        const newId = ++idRef.current
        setLines((prev) => [...prev, { id: newId, type: 'cmd', text: item.text, partial: '', done: false }])
      }
      if (charIdx < item.text.length) {
        const t = setTimeout(() => {
          setLines((prev) =>
            prev.map((l) =>
              l.id === idRef.current ? { ...l, partial: item.text.slice(0, charIdx + 1) } : l
            )
          )
          setCharIdx((c) => c + 1)
        }, 55 + Math.random() * 35)
        return () => clearTimeout(t)
      } else {
        // Done typing cmd, mark it done and advance
        const t = setTimeout(() => {
          setLines((prev) =>
            prev.map((l) => (l.id === idRef.current ? { ...l, done: true } : l))
          )
          setCharIdx(0)
          setPhase((p) => p + 1)
        }, 300)
        return () => clearTimeout(t)
      }
    }

    // out / ok — instant with small delay
    const delay = item.type === 'ok' ? 180 : 120
    const t = setTimeout(() => {
      const newId = ++idRef.current
      setLines((prev) => [...prev, { id: newId, type: item.type, text: item.text, done: true }])
      setPhase((p) => p + 1)
    }, delay)
    return () => clearTimeout(t)
  }, [phase, charIdx])

  const colorClass = (type: string) => {
    if (type === 'cmd') return 't-cmd'
    if (type === 'ok')  return 't-success'
    return 't-out'
  }

  return (
    <div className="terminal-wrap">
      <div className="terminal-header">
        <span className="t-dot t-dot-r" />
        <span className="t-dot t-dot-y" />
        <span className="t-dot t-dot-g" />
        <span className="ml-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          alog-agent@server ~ bash
        </span>
      </div>
      <div className="terminal-body" ref={bodyRef}>
        {lines.map((line) => {
          if (line.type === 'gap') return null
          const isCurrent = line.id === idRef.current && !line.done
          return (
            <div key={line.id} className={`${colorClass(line.type)} font-mono text-sm`}>
              {line.type === 'cmd' && <span className="t-prompt">$ </span>}
              {line.type === 'cmd' ? (line.partial ?? line.text) : line.text}
              {isCurrent && <span className="t-cursor" />}
            </div>
          )
        })}
        {/* Idle cursor when finished */}
        {phase >= SCRIPT.length && (
          <div className="t-cmd font-mono text-sm">
            <span className="t-prompt">$ </span>
            <span className="t-cursor" />
          </div>
        )}
      </div>
    </div>
  )
}
