'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

interface StatItem {
  label: string
  value: number
  unit: string
  icon: string
  href: string
  accent: string
  iconBg: string
}

interface StatCounterGridProps {
  stats: StatItem[]
  cols?: 3 | 4
}

function useCountUp(target: number, triggered: boolean, duration = 1200) {
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!triggered || started.current || target === 0) return
    started.current = true
    if (target <= 10) { setCount(target); return }
    const steps = 36
    const interval = duration / steps
    let current = 0
    const inc = target / steps
    const timer = setInterval(() => {
      current += inc
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, interval)
    return () => clearInterval(timer)
  }, [triggered, target, duration])

  return count
}

// Single shared observer for all stat cards
function StatCard({ stat, triggered }: { stat: StatItem; triggered: boolean }) {
  const count = useCountUp(stat.value, triggered)

  return (
    <Link href={stat.href} className="stat-card p-4 block group">
      <div className="flex items-center justify-between mb-3">
        <div
          className="stat-icon-block"
          style={{ background: stat.iconBg, boxShadow: `0 0 16px ${stat.iconBg.replace('0.12', '0.3')}` }}
        >
          <span>{stat.icon}</span>
        </div>
        <span
          className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: stat.accent }}
        >
          →
        </span>
      </div>
      <div className="text-3xl font-bold font-mono leading-none mb-1" style={{ color: stat.accent }}>
        {count.toLocaleString()}
        <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
          {stat.unit}
        </span>
      </div>
      <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
        {stat.label}
      </div>
    </Link>
  )
}

export default function StatCounterGrid({ stats, cols = 3 }: StatCounterGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)

  const onIntersect = useCallback(([entry]: IntersectionObserverEntry[]) => {
    if (entry.isIntersecting) setTriggered(true)
  }, [])

  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const observer = new IntersectionObserver(onIntersect, { threshold: 0.2 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onIntersect])

  const gridClass = cols === 4
    ? 'stats-4'
    : 'grid grid-cols-1 sm:grid-cols-3 gap-3'

  return (
    <div ref={gridRef} className={gridClass}>
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} triggered={triggered} />
      ))}
    </div>
  )
}


