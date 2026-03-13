'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import LinerEditor from '@/components/LinerEditor'
import Toolbar from '@/components/Toolbar'
import StatusBar from '@/components/StatusBar'
import {
  loadContent, saveContent,
  loadFileName, saveFileName,
  loadTheme, saveTheme,
} from '@/lib/storage'

const INITIAL_CONTENT = `# 마크다운 에디터에 오신 걸 환영합니다!

좌측에 마크다운을 입력하면 **바로 렌더링**됩니다.

## 지원 문법

- **굵게**: \`**텍스트**\`
- *기울임*: \`*텍스트*\`
- _밑줄_: \`_텍스트_\`
- ~~취소선~~: \`~~텍스트~~\`

## 코드 블록

\`\`\`javascript
const hello = 'world'
console.log(hello)
\`\`\`

> 인용문도 지원합니다.

| 헤더1 | 헤더2 |
|-------|-------|
| 셀1   | 셀2   |`

export default function Page() {
  const [raw, setRaw] = useState('')
  const [fileName, setFileName] = useState('document.md')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const [clearKey, setClearKey] = useState(0)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const savedContent = loadContent()
    const savedFileName = loadFileName()
    const savedTheme = loadTheme()
    setRaw(savedContent || INITIAL_CONTENT)
    setFileName(savedFileName)
    setTheme(savedTheme)
    setMounted(true)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    if (theme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    saveTheme(theme)
  }, [theme])

  useEffect(() => {
    if (!mounted) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      saveContent(raw)
      setLastSaved(new Date())
    }, 1000)
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [raw, mounted])

  const handleSave = useCallback(() => {
    const name = fileName.trim() || 'document'
    const finalName = name.endsWith('.md') ? name : `${name}.md`
    const blob = new Blob([raw], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = finalName
    a.click()
    URL.revokeObjectURL(url)
  }, [raw, fileName])

  const handleClear = useCallback(() => {
    if (!window.confirm('내용을 모두 삭제할까요?')) return
    setRaw('')
    setLastSaved(null)
    saveContent('')
    setClearKey((k) => k + 1)
  }, [])

  const handleFileNameChange = useCallback((name: string) => {
    setFileName(name)
    saveFileName(name)
  }, [])

  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <Toolbar
        fileName={fileName}
        onFileNameChange={handleFileNameChange}
        onSave={handleSave}
        onClear={handleClear}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      <div className="flex-1 overflow-hidden">
        <LinerEditor
          key={`editor-${clearKey}`}
          initialValue={raw}
          onChange={setRaw}
        />
      </div>

      <StatusBar lastSaved={lastSaved} charCount={raw.length} />
    </div>
  )
}
