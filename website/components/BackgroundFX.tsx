'use client'

import { useEffect } from 'react'

export default function BackgroundFX() {
  useEffect(() => {
    const container = document.getElementById('alog-particles')
    if (!container || container.childElementCount > 0) return

    // Reduced from 25 → 12 particles; use DocumentFragment for single reflow
    const frag = document.createDocumentFragment()
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div')
      p.className = 'alog-particle'
      p.style.cssText = [
        `left:${(Math.random() * 96).toFixed(1)}%`,
        `animation-delay:${(Math.random() * 20).toFixed(1)}s`,
        `animation-duration:${(15 + Math.random() * 10).toFixed(1)}s`,
      ].join(';')
      frag.appendChild(p)
    }
    container.appendChild(frag)
  }, [])

  return (
    <>
      <div className="alog-grid-lines" aria-hidden="true" />
      <div id="alog-particles" className="alog-particles" aria-hidden="true" />
    </>
  )
}
