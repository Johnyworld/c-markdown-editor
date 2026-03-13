'use client'

import { useEffect, useRef } from 'react'
import { parseMarkdown } from '@/lib/markdown'
import type { Block } from '@/lib/types'

interface EditorBlockProps {
  block: Block
  isFocused: boolean
  onFocus: (id: string) => void
  onChange: (id: string, raw: string) => void
  onSplit: (id: string, before: string, after: string) => void
  onMerge: (id: string) => void
  onArrowUp: (id: string) => void
  onArrowDown: (id: string) => void
}

export default function EditorBlock({
  block,
  isFocused,
  onFocus,
  onChange,
  onSplit,
  onMerge,
  onArrowUp,
  onArrowDown,
}: EditorBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 포커스 시 textarea 자동 포커스
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      const el = textareaRef.current
      el.focus()
      // 커서를 끝으로 이동
      el.setSelectionRange(el.value.length, el.value.length)
    }
  }, [isFocused])

  // textarea 높이 자동 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [block.raw, isFocused])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget
    const { value, selectionStart, selectionEnd } = el

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const before = value.slice(0, selectionStart)
      const after = value.slice(selectionEnd)
      onSplit(block.id, before, after)
    } else if (e.key === 'Backspace' && selectionStart === 0 && selectionEnd === 0) {
      e.preventDefault()
      onMerge(block.id)
    } else if (e.key === 'ArrowUp' && selectionStart === 0) {
      onArrowUp(block.id)
    } else if (e.key === 'ArrowDown' && selectionStart === value.length) {
      onArrowDown(block.id)
    }
  }

  if (isFocused) {
    return (
      <textarea
        ref={textareaRef}
        value={block.raw}
        onChange={(e) => onChange(block.id, e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        spellCheck={false}
        className={[
          'w-full resize-none overflow-hidden outline-none',
          'font-mono text-sm leading-relaxed px-2 py-1 rounded',
          'bg-blue-50 dark:bg-blue-950/30',
          'text-gray-800 dark:text-gray-100',
          'border border-blue-200 dark:border-blue-800',
        ].join(' ')}
      />
    )
  }

  // 빈 블록
  if (!block.raw.trim()) {
    return (
      <div
        onClick={() => onFocus(block.id)}
        className="min-h-[1.5rem] w-full px-2 py-1 cursor-text rounded hover:bg-gray-50 dark:hover:bg-gray-800/50"
      />
    )
  }

  // 렌더 모드
  return (
    <div
      onClick={() => onFocus(block.id)}
      className={[
        'w-full px-2 py-1 cursor-text rounded',
        'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        'prose prose-sm max-w-none dark:prose-invert',
        '[&_u]:underline [&_u]:decoration-current',
      ].join(' ')}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(block.raw) }}
    />
  )
}
