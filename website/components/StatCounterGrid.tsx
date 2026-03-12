'use client'

import { useEffect, useRef, useState } from 'react'
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

function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const steps = 40
          const increment = target / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

function StatCard({ stat }: { stat: StatItem }) {
  const { count, ref } = useCountUp(stat.value)

  return (
    <div ref={ref}>
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
    </div>
  )
}

export default function StatCounterGrid({ stats, cols = 3 }: StatCounterGridProps) {
  const gridClass = cols === 4
    ? 'stats-4'
    : 'grid grid-cols-2 sm:grid-cols-3 gap-3'
  return (
    <div className={gridClass}>
      {stats.map((s) => (
        <StatCard key={s.label} stat={s} />
      ))}
    </div>
  )
}
