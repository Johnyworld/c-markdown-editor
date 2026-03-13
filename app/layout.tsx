import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Markdown Editor',
  description: '마크다운 에디터 — 실시간 미리보기 + MD 파일 저장',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
