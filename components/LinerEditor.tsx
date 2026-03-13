'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import EditorBlock from './EditorBlock';
import type { Block } from '@/lib/types';

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function rawToBlocks(raw: string): Block[] {
  const parts = raw.split(/\n\n/);
  return parts.map(part => ({ id: makeId(), raw: part }));
}

function blocksToRaw(blocks: Block[]): string {
  return blocks.map(b => b.raw).join('\n\n');
}

interface LinerEditorProps {
  initialValue: string;
  onChange: (raw: string) => void;
}

export default function LinerEditor({ initialValue, onChange }: LinerEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => rawToBlocks(initialValue) || [{ id: makeId(), raw: '' }]);
  // FR-06: 초기값 null — 진입 시 어떤 블록에도 포커스 없음
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // FR-07: 에디터 외부 클릭 시 모든 블록 blur
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (editorContainerRef.current && !editorContainerRef.current.contains(e.target as Node)) {
        setFocusedId(null);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const handleFocus = useCallback((id: string) => {
    setFocusedId(id);
  }, []);

  const handleChange = useCallback(
    (id: string, raw: string) => {
      setBlocks(prev => {
        const next = prev.map(b => (b.id === id ? { ...b, raw } : b));
        onChange(blocksToRaw(next));
        return next;
      });
    },
    [onChange]
  );

  const handleSplit = useCallback(
    (id: string, before: string, after: string) => {
      const newId = makeId();
      setBlocks(prev => {
        const idx = prev.findIndex(b => b.id === id);
        if (idx === -1) return prev;
        const next = [...prev.slice(0, idx), { id, raw: before }, { id: newId, raw: after }, ...prev.slice(idx + 1)];
        onChange(blocksToRaw(next));
        return next;
      });
      setFocusedId(newId);
    },
    [onChange]
  );

  const handleMerge = useCallback(
    (id: string) => {
      setBlocks(prev => {
        const idx = prev.findIndex(b => b.id === id);
        if (idx === 0) return prev;
        const prevBlock = prev[idx - 1];
        const currBlock = prev[idx];
        const merged = {
          ...prevBlock,
          raw: prevBlock.raw + (prevBlock.raw && currBlock.raw ? '\n' : '') + currBlock.raw,
        };
        const next = [...prev.slice(0, idx - 1), merged, ...prev.slice(idx + 1)];
        onChange(blocksToRaw(next));
        setFocusedId(prevBlock.id);
        return next;
      });
    },
    [onChange]
  );

  const handleArrowUp = useCallback((id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx > 0) setFocusedId(prev[idx - 1].id);
      return prev;
    });
  }, []);

  const handleArrowDown = useCallback((id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx < prev.length - 1) setFocusedId(prev[idx + 1].id);
      return prev;
    });
  }, []);

  return (
    <div className='h-full w-full overflow-y-auto px-8 py-6 bg-white dark:bg-gray-900 max-w-2xl mx-auto space-y-1'>
      <div ref={editorContainerRef} className='editor-container'>
        {blocks.map(block => (
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
  );
}
