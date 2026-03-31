import React, { useState, useEffect } from 'react'

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    const goOffline = () => {
      setIsOffline(true)
      setWasOffline(true)
      setShowReconnected(false)
    }
    const goOnline = () => {
      setIsOffline(false)
      if (wasOffline) {
        setShowReconnected(true)
        setTimeout(() => setShowReconnected(false), 3000)
      }
    }
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [wasOffline])

  if (isOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] max-w-lg mx-auto px-3 pt-2">
        <div className="rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-body font-medium animate-slide-up"
          style={{ background: '#7c2d12', border: '1px solid #9a3412', color: '#fed7aa' }}>
          <span className="text-sm">📡</span>
          <span>You're offline — the app still works, but live updates are paused.</span>
        </div>
      </div>
    )
  }

  if (showReconnected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] max-w-lg mx-auto px-3 pt-2">
        <div className="rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-body font-medium animate-slide-up"
          style={{ background: '#14532d', border: '1px solid #166534', color: '#bbf7d0' }}>
          <span className="text-sm">✅</span>
          <span>Back online! Live updates resumed.</span>
        </div>
      </div>
    )
  }

  return null
}
