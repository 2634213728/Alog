'use client'

import { useEffect } from 'react'

interface ViewCounterProps {
  logId: string
}

export default function ViewCounter({ logId }: ViewCounterProps) {
  useEffect(() => {
    fetch(`/api/logs/${logId}/view`, { method: 'POST' }).catch(() => {})
  }, [logId])

  return null
}
