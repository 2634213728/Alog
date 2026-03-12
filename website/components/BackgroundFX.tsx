'use client'

import { useEffect } from 'react'

export default function BackgroundFX() {
  useEffect(() => {
    const container = document.getElementById('alog-particles')
    if (!container || container.childElementCount > 0) return

    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div')
      p.className = 'alog-particle'
      p.style.left = Math.random() * 100 + '%'
      p.style.animationDelay = Math.random() * 20 + 's'
      p.style.animationDuration = (15 + Math.random() * 10) + 's'
      container.appendChild(p)
    }
  }, [])

  return (
    <>
      <div className="alog-grid-lines" aria-hidden="true" />
      <div id="alog-particles" className="alog-particles" aria-hidden="true" />
    </>
  )
}
