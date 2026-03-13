'use client'

import { useState, useCallback, useId } from 'react'
import EditorBlock from './EditorBlock'

interface Block {
  id: string
  raw: string
}

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

function rawToBlocks(raw: string): Block[] {
  const parts = raw.split(/\n\n/)
  return parts.map((part) => ({ id: makeId(), raw: part }))
}

function blocksToRaw(blocks: Block[]): string {
  return blocks.map((b) => b.raw).join('\n\n')
}

interface LinerEditorProps {
  initialValue: string
  onChange: (raw: string) => void
}

export default function LinerEditor({ initialValue, onChange }: LinerEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() =>
    rawToBlocks(initialValue) || [{ id: makeId(), raw: '' }]
  )
  const [focusedId, setFocusedId] = useState<string | null>(
    () => blocks[0]?.id ?? null
  )

  function update(next: Block[]) {
    setBlocks(next)
    onChange(blocksToRaw(next))
  }

  const handleFocus = useCallback((id: string) => {
    setFocusedId(id)
  }, [])

  const handleChange = useCallback((id: string, raw: string) => {
    setBlocks((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, raw } : b))
      onChange(blocksToRaw(next))
      return next
    })
  }, [onChange])

  const handleSplit = useCallback((id: string, before: string, after: string) => {
    const newId = makeId()
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id)
      if (idx === -1) return prev
      const next = [
        ...prev.slice(0, idx),
        { id, raw: before },
        { id: newId, raw: after },
        ...prev.slice(idx + 1),
      ]
      onChange(blocksToRaw(next))
      return next
    })
    setFocusedId(newId)
  }, [onChange])

  const handleMerge = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id)
      if (idx === 0) return prev
      const prevBlock = prev[idx - 1]
      const currBlock = prev[idx]
      const merged = {
        ...prevBlock,
        raw: prevBlock.raw + (prevBlock.raw && currBlock.raw ? '\n' : '') + currBlock.raw,
      }
      const next = [...prev.slice(0, idx - 1), merged, ...prev.slice(idx + 1)]
      onChange(blocksToRaw(next))
      setFocusedId(prevBlock.id)
      return next
    })
  }, [onChange])

  const handleArrowUp = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id)
      if (idx > 0) setFocusedId(prev[idx - 1].id)
      return prev
    })
  }, [])

  const handleArrowDown = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id)
      if (idx < prev.length - 1) setFocusedId(prev[idx + 1].id)
      return prev
    })
  }, [])

  return (
    <div
      className="h-full w-full overflow-y-auto px-8 py-6 bg-white dark:bg-gray-900"
      onClick={() => {
        // 에디터 영역 빈 곳 클릭 시 마지막 블록 포커스
        if (!focusedId) setFocusedId(blocks[blocks.length - 1]?.id ?? null)
      }}
    >
      <div className="max-w-2xl mx-auto space-y-1">
        {blocks.map((block) => (
          <EditorBlock
            key={block.id}
            block={block}
            isFocused={block.id === focusedId}
            onFocus={handleFocus}
            onChange={handleChange}
            onSplit={handleSplit}
            onMerge={handleMerge}
            onArrowUp={handleArrowUp}
            onArrowDown={handleArrowDown}
          />
        ))}
      </div>
    </div>
  )
}
