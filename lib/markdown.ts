import DOMPurify from 'dompurify'

// ─── 코드 영역 보호 ──────────────────────────────────────────────────────────

function maskCodeSegments(text: string): [string, string[]] {
  const segments: string[] = []
  const masked = text
    .replace(/```[\s\S]*?```/g, (m) => { segments.push(m); return `\x00C${segments.length - 1}\x00` })
    .replace(/`[^`\n]+`/g,      (m) => { segments.push(m); return `\x00C${segments.length - 1}\x00` })
  return [masked, segments]
}

function restoreCodeSegments(text: string, segments: string[]): string {
  return text.replace(/\x00C(\d+)\x00/g, (_, i) => segments[Number(i)])
}

// ─── Inline 파싱 ─────────────────────────────────────────────────────────────

function parseInline(raw: string): string {
  const [masked, segs] = maskCodeSegments(raw)

  const result = masked
    // 이미지 (링크보다 먼저)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    // 링크
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // 굵게
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // 기울임 (단독 *)
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    // 취소선
    .replace(/~~([^~\n]+)~~/g, '<del>$1</del>')
    // 밑줄 (코드 외부, 단독 _)
    .replace(/(?<![*_])_([^_\n]+)_(?![*_])/g, '<u>$1</u>')
    // 인라인 코드 (마스킹된 플레이스홀더 복원 전 처리 불필요 — 이미 보호됨)

  return restoreCodeSegments(result, segs)
    // 인라인 코드 플레이스홀더가 복원된 원본 backtick 형태를 <code>로 변환
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
}

// ─── Block 파싱 ──────────────────────────────────────────────────────────────

function parseTable(lines: string[]): string {
  const rows = lines.map((l) => l.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
  const [header, , ...body] = rows
  const th = header.map((c) => `<th>${parseInline(c)}</th>`).join('')
  const tb = body.map((r) => `<tr>${r.map((c) => `<td>${parseInline(c)}</td>`).join('')}</tr>`).join('')
  return `<table><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table>`
}

function parseListItems(lines: string[], ordered: boolean): string {
  const tag = ordered ? 'ol' : 'ul'
  const items = lines.map((l) => {
    const text = ordered ? l.replace(/^\d+\.\s+/, '') : l.replace(/^[-*]\s+/, '')
    return `<li>${parseInline(text)}</li>`
  })
  return `<${tag}>${items.join('')}</${tag}>`
}

function parseBlocks(raw: string): string {
  const lines = raw.split('\n')
  const output: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // 펜스드 코드 블록
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      const cls = lang ? ` class="language-${lang}"` : ''
      const escaped = codeLines.join('\n')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      output.push(`<pre><code${cls}>${escaped}</code></pre>`)
      i++ // 닫는 ``` 건너뜀
      continue
    }

    // 헤딩
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/)
    if (headingMatch) {
      const level = headingMatch[1].length
      output.push(`<h${level}>${parseInline(headingMatch[2])}</h${level}>`)
      i++
      continue
    }

    // 구분선
    if (/^(\s*[-*]){3,}\s*$/.test(line) && !/^[-*]\s/.test(line)) {
      output.push('<hr>')
      i++
      continue
    }

    // 인용
    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      output.push(`<blockquote>${parseBlocks(quoteLines.join('\n'))}</blockquote>`)
      continue
    }

    // 표
    if (line.startsWith('|') && i + 1 < lines.length && /^\|[-| :]+\|$/.test(lines[i + 1])) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      output.push(parseTable(tableLines))
      continue
    }

    // 순서 없는 목록
    if (/^[-*]\s/.test(line)) {
      const listLines: string[] = []
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        listLines.push(lines[i])
        i++
      }
      output.push(parseListItems(listLines, false))
      continue
    }

    // 순서 있는 목록
    if (/^\d+\.\s/.test(line)) {
      const listLines: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listLines.push(lines[i])
        i++
      }
      output.push(parseListItems(listLines, true))
      continue
    }

    // 빈 줄
    if (line.trim() === '') {
      i++
      continue
    }

    // 단락 — 빈 줄 또는 블록 요소까지 묶음
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('> ') &&
      !lines[i].startsWith('|') &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^(\s*[-*]){3,}\s*$/.test(lines[i])
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length) {
      output.push(`<p>${parseInline(paraLines.join('<br>'))}</p>`)
    }
  }

  return output.join('\n')
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function parseMarkdown(raw: string): string {
  if (typeof window === 'undefined') return ''
  const html = parseBlocks(raw)
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}
