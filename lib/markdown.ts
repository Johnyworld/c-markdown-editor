import { marked } from 'marked'
import DOMPurify from 'dompurify'

// _text_ → <u>text</u> (단독 밑줄, ** 또는 * 와 혼용 안 됨)
function preprocessUnderline(raw: string): string {
  return raw.replace(/(?<![*_])_([^_\n]+)_(?![*_])/g, '<u>$1</u>')
}

export function parseMarkdown(raw: string): string {
  if (typeof window === 'undefined') return ''
  const preprocessed = preprocessUnderline(raw)
  const html = marked.parse(preprocessed) as string
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}
