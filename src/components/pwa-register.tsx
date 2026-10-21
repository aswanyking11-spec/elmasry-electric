'use client'

import { useEffect } from 'react'

// تسجيل Service Worker لتمكين تثبيت التطبيق كـ PWA
export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.warn('SW registration failed:', err))
    }
  }, [])
  return null
}
