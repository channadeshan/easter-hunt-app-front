import React, { useState, useEffect } from 'react'

// Extend window for Chrome's beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

type Platform = 'android' | 'ios' | 'none'

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  if (isStandalone) return 'none' // Already installed
  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  return 'none'
}

const DISMISSED_KEY = 'egg-hunt-install-dismissed'

export default function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform>('none')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // Don't show if user dismissed within last 3 days
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed && Date.now() - parseInt(dismissed) < 1000 * 60 * 60 * 24 * 3) return

    const p = detectPlatform()
    setPlatform(p)

    if (p === 'android') {
      const handler = (e: BeforeInstallPromptEvent) => {
        e.preventDefault()
        setDeferredPrompt(e)
        // Show banner 2s after page load to let the UI settle
        setTimeout(() => setVisible(true), 2000)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }

    if (p === 'ios') {
      setTimeout(() => setVisible(true), 2000)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
    setDeferredPrompt(null)
    setInstalling(false)
  }

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, Date.now().toString())
  }

  if (!visible || platform === 'none') return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto px-4 pb-4 animate-slide-up"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="glass border border-hunt-border rounded-2xl p-4 shadow-2xl"
        style={{ boxShadow: '0 -4px 40px rgba(255, 212, 59, 0.08)' }}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-hunt-canary/10 border border-hunt-canary/20 flex items-center justify-center text-2xl shrink-0">
            🥚
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-white text-sm leading-tight">
              Add to Home Screen
            </p>

            {platform === 'android' && (
              <p className="text-xs text-gray-400 font-body mt-0.5 leading-snug">
                Install the app for faster access — works even with spotty campus Wi-Fi.
              </p>
            )}

            {platform === 'ios' && (
              <p className="text-xs text-gray-400 font-body mt-0.5 leading-snug">
                Tap <span className="inline-block text-hunt-sky">⎙</span> Share, then{' '}
                <span className="text-white font-medium">"Add to Home Screen"</span>.
              </p>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="text-gray-600 hover:text-gray-300 transition-colors text-lg leading-none mt-0.5 shrink-0"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>

        {platform === 'android' && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2.5 rounded-xl border border-hunt-border text-gray-400 hover:text-white text-xs font-body transition-colors"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              disabled={installing}
              className="flex-[2] py-2.5 rounded-xl bg-hunt-canary hover:bg-hunt-canary/80 disabled:opacity-60 text-hunt-bg font-display font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              {installing ? (
                <>
                  <span className="animate-spin text-base">⟳</span> Installing…
                </>
              ) : (
                '📲 Install App'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
