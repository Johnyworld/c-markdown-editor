'use client'

import { useRef, useEffect } from 'react'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export default function Editor({ value, onChange }: EditorProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const isComposing = useRef(false)

  // 외부에서 value가 바뀌었을 때 (초기화 등) DOM 동기화
  useEffect(() => {
    const el = divRef.current
    if (!el) return
    if (el.innerText !== value) {
      el.innerText = value
    }
  }, [value])

  function handleInput() {
    if (isComposing.current) return
    const el = divRef.current
    if (!el) return
    onChange(el.innerText)
  }

  return (
    <div
      ref={divRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onCompositionStart={() => { isComposing.current = true }}
      onCompositionEnd={() => {
        isComposing.current = false
        handleInput()
      }}
      spellCheck={false}
      className={[
        'h-full w-full p-4 outline-none overflow-y-auto whitespace-pre-wrap break-words',
        'font-mono text-sm leading-relaxed',
        'bg-white text-gray-800',
        'dark:bg-gray-900 dark:text-gray-100',
        'caret-blue-500',
      ].join(' ')}
      aria-label="마크다운 에디터"
      role="textbox"
      aria-multiline="true"
    />
  )
}
