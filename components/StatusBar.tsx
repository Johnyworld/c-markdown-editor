'use client'

import { useState, useEffect } from 'react'

interface StatusBarProps {
  lastSaved: Date | null
  charCount: number
}

function formatRelativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 5) return '방금 전'
  if (diff < 60) return `${diff}초 전`
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function StatusBar({ lastSaved, charCount }: StatusBarProps) {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    if (!lastSaved) return
    const id = setInterval(() => forceUpdate((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [lastSaved])

  return (
    <footer className="flex items-center justify-between px-4 py-1 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
      <span>
        {lastSaved ? `자동 저장됨 · ${formatRelativeTime(lastSaved)}` : '저장되지 않음'}
      </span>
      <span>글자 수: {charCount.toLocaleString()}</span>
    </footer>
  )
}
