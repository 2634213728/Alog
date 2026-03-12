'use client'

import { useEffect, useState } from 'react'
import { slugifyHeading } from './MarkdownRenderer'

interface Heading {
  level: number
  text: string
  id: string
}

function parseHeadings(content: string): Heading[] {
  const lines = content.split('\n')
  const headings: Heading[] = []
  for (const line of lines) {
    const m = line.match(/^(#{1,4})\s+(.+)$/)
    if (m) {
      const level = m[1].length
      const text  = m[2].trim()
      headings.push({ level, text, id: slugifyHeading(text) })
    }
  }
  return headings
}

export default function TableOfContents({ content }: { content: string }) {
  const headings = parseHeadings(content)
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return
    const ids = headings.map((h) => h.id)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  if (headings.length < 2) return null

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top: y, behavior: 'smooth' })
    setActive(id)
  }

  const minLevel = Math.min(...headings.map((h) => h.level))

  return (
    <nav className="detail-toc">
      <div className="detail-toc-inner">
        {/* header */}
        <div className="detail-toc-title">
          <span className="detail-toc-icon">◈</span>
          目录
        </div>
        <ul className="detail-toc-list">
          {headings.map((h, i) => {
            const depth = h.level - minLevel          // 0, 1, 2, 3
            const isActive = active === h.id
            // indent: 10px base + 12px per depth level
            const pl = 10 + depth * 12
            return (
              <li key={i}>
                <button
                  onClick={() => scrollTo(h.id)}
                  className={`detail-toc-item ${isActive ? 'active' : ''}`}
                  style={{ paddingLeft: `${pl}px`, fontSize: depth === 0 ? '11.5px' : depth === 1 ? '11px' : '10.5px' }}
                  title={h.text}
                >
                  {depth > 0 && (
                    <span className="detail-toc-dot" data-level={Math.min(depth, 3)} />
                  )}
                  <span className="detail-toc-text" style={{ opacity: depth === 0 ? 1 : depth === 1 ? 0.85 : 0.7 }}>
                    {h.text}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {/* progress */}
        <div className="detail-toc-footer">
          <span className="detail-toc-kbd">Scroll</span> to navigate
        </div>
      </div>
    </nav>
  )
}
