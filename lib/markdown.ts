import { marked } from 'marked'
import DOMPurify from 'dompurify'

// 코드 영역 바깥에서만 _text_ → <u>text</u> 변환
function preprocessUnderline(raw: string): string {
  const codeSegments: string[] = []

  // 코드 영역을 플레이스홀더로 치환 (펜스드 블록 → 인라인 코드 순서 중요)
  const masked = raw
    .replace(/```[\s\S]*?```/g, (match) => {
      codeSegments.push(match)
      return `\x00CODE${codeSegments.length - 1}\x00`
    })
    .replace(/`[^`\n]+`/g, (match) => {
      codeSegments.push(match)
      return `\x00CODE${codeSegments.length - 1}\x00`
    })

  // 코드 외 영역에만 밑줄 변환 적용
  const converted = masked.replace(/(?<![*_])_([^_\n]+)_(?![*_])/g, '<u>$1</u>')

  // 플레이스홀더 복원
  return converted.replace(/\x00CODE(\d+)\x00/g, (_, i) => codeSegments[Number(i)])
}

export function parseMarkdown(raw: string): string {
  if (typeof window === 'undefined') return ''
  const preprocessed = preprocessUnderline(raw)
  const html = marked.parse(preprocessed) as string
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}
