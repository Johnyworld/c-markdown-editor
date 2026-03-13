'use client'

interface ToolbarProps {
  fileName: string
  onFileNameChange: (name: string) => void
  onSave: () => void
  onClear: () => void
  theme: 'light' | 'dark'
  onThemeToggle: () => void
}

export default function Toolbar({
  fileName,
  onFileNameChange,
  onSave,
  onClear,
  theme,
  onThemeToggle,
}: ToolbarProps) {
  return (
    <header className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
      {/* 제목 */}
      <span className="font-semibold text-sm text-gray-700 dark:text-gray-200 mr-2 whitespace-nowrap">
        MD Editor
      </span>

      {/* 파일명 입력 */}
      <input
        type="text"
        value={fileName}
        onChange={(e) => onFileNameChange(e.target.value)}
        placeholder="document.md"
        className={[
          'flex-1 min-w-0 max-w-xs px-2 py-1 text-sm rounded border',
          'border-gray-300 dark:border-gray-600',
          'bg-white dark:bg-gray-800',
          'text-gray-800 dark:text-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-blue-400',
        ].join(' ')}
        aria-label="저장 파일명"
      />

      {/* 저장 버튼 */}
      <button
        onClick={onSave}
        className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
      >
        저장
      </button>

      {/* 초기화 버튼 */}
      <button
        onClick={onClear}
        className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        초기화
      </button>

      {/* 테마 토글 */}
      <button
        onClick={onThemeToggle}
        className="px-2 py-1 text-lg rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
        title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
