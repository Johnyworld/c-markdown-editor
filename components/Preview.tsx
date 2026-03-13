'use client'

interface PreviewProps {
  html: string
}

export default function Preview({ html }: PreviewProps) {
  return (
    <div
      className={[
        'h-full w-full p-4 overflow-y-auto',
        'bg-gray-50 dark:bg-gray-800',
        'prose prose-sm max-w-none',
        'dark:prose-invert',
        // 밑줄 스타일
        '[&_u]:underline [&_u]:decoration-current',
      ].join(' ')}
      dangerouslySetInnerHTML={{ __html: html }}
      aria-label="미리보기"
    />
  )
}
