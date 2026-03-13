# markdown-editor Design Document

> **Summary**: 입력과 동시에 인라인 렌더링되는 통합 마크다운 에디터 설계 (liner 스타일)
>
> **Project**: test-claude-markdown-editor
> **Version**: 0.3.0
> **Author**: gimjaehwan
> **Date**: 2026-03-13
> **Status**: Implemented
> **Plan Ref**: `docs/01-plan/features/markdown-editor.plan.md`

---

## 1. UI/UX Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  TOOLBAR: [파일명 입력]  [저장]  [초기화]  [🌙/☀️ 테마 토글]      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   EDITOR & PREVIEW (content editable, liner 스타일)              │
│                                                                  │
│   - 마크다운 직접 입력하면서 바로 렌더링                          │
│   - 커서가 있는 줄: 마크다운 원문 표시                            │
│   - 커서가 없는 줄: HTML 렌더링 결과 표시                         │
│   - 모노스페이스 폰트 (에디팅 영역)                               │
│   - GitHub 스타일 타이포그래피 (렌더링 영역)                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
│  STATUS BAR: "자동 저장됨 · 방금 전"  |  글자 수: 0              │
└──────────────────────────────────────────────────────────────────┘
```

**Liner 스타일 동작 원리:**
- 전체 컨텐츠를 단락(블록) 단위로 분리
- 포커스된 블록: 마크다운 원문 그대로 표시 (편집 가능)
- 비포커스 블록: `marked.js`로 렌더링된 HTML 표시 (읽기 전용)
- 블록 전환은 `click` 또는 `Enter` / `ArrowUp/Down` 키로 이동

---

## 2. Component Architecture

```
app/
├── page.tsx                  # 루트 — raw 텍스트 상태 보관, 저장/초기화/테마 이벤트
├── layout.tsx                # HTML 기반, 다크모드 클래스 적용
└── globals.css               # Tailwind base + 에디터 prose 커스텀 스타일

components/
├── Toolbar.tsx               # 파일명 input, 저장/초기화/테마 버튼
├── LinerEditor.tsx           # 핵심 컴포넌트 — 블록 분리 + 포커스 관리
├── EditorBlock.tsx           # 단일 블록 — 편집 모드(textarea) / 렌더 모드(div)
└── StatusBar.tsx             # 자동저장 시각, 글자 수

lib/
├── markdown.ts               # parseMarkdown(raw): string (DOMPurify sanitize 포함)
├── storage.ts                # localStorage CRUD (content, filename, theme)
└── types.ts                  # 공유 타입 (Block 인터페이스)
```

---

## 3. 블록 분리 전략

마크다운 원문을 **빈 줄 기준으로 단락 블록**으로 분리한다.

```
"# 제목\n\n내용입니다.\n\n## 소제목\n코드"
→ blocks = [
    "# 제목",
    "내용입니다.",
    "## 소제목\n코드"
  ]
```

각 블록은 `{ id: string, raw: string }` 형태로 관리한다.

```ts
interface Block {
  id: string    // nanoid 또는 index 기반 고유 ID
  raw: string   // 해당 블록의 마크다운 원문
}
```

전체 raw 텍스트 = `blocks.map(b => b.raw).join('\n\n')`

---

## 4. LinerEditor 컴포넌트

```ts
// 상태
const [blocks, setBlocks] = useState<Block[]>([])
const [focusedId, setFocusedId] = useState<string | null>(null)

// Enter 키: 현재 블록 커서 위치에서 분리 → 새 블록 생성
function splitBlock(id: string, before: string, after: string) { ... }

// Backspace: 블록 시작에서 이전 블록과 병합
function mergeWithPrev(id: string) { ... }
```

---

## 5. EditorBlock 컴포넌트

```ts
interface EditorBlockProps {
  block: Block
  isFocused: boolean
  onFocus: (id: string) => void
  onChange: (id: string, raw: string) => void
  onSplit: (id: string, before: string, after: string) => void
  onMerge: (id: string) => void
  onArrowUp: (id: string) => void
  onArrowDown: (id: string) => void
}
```

**편집 모드 (isFocused = true):**
- `<textarea>` 렌더링 (자동 높이 조절 — `rows` 동적 계산)
- 마크다운 원문 표시
- `Enter` → `onSplit`, Backspace at start → `onMerge`

**렌더 모드 (isFocused = false):**
- `<div dangerouslySetInnerHTML>` 렌더링
- prose 스타일 적용
- `onClick` → `onFocus(block.id)`

---

## 6. 마크다운 파싱 (`lib/markdown.ts`)

### 밑줄 전처리 전략

`_text_` → `<u>text</u>` 변환은 **코드 영역 바깥**에서만 적용한다.

제외 대상:
- 인라인 코드: `` `...` ``
- 펜스드 코드 블록: ` ```...``` `

**처리 순서:**
1. raw 문자열에서 코드 영역(인라인 코드 + 펜스드 블록)을 추출하여 플레이스홀더로 치환
2. 나머지 영역에만 `_text_` → `<u>text</u>` 정규식 적용
3. 플레이스홀더를 원본 코드로 복원
4. `marked.parse()` → `DOMPurify.sanitize()` 순으로 처리

```ts
import { marked } from 'marked'
import DOMPurify from 'dompurify'

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
```

---

## 7. 로컬 스토리지 (`lib/storage.ts`)

저장 단위: **전체 raw 텍스트** (블록 조인 결과)

```ts
const CONTENT_KEY = 'md-editor-content'
const FILENAME_KEY = 'md-editor-filename'
const THEME_KEY = 'md-editor-theme'

export function loadContent(): string { ... }
export function saveContent(raw: string): void { ... }
export function loadFileName(): string { ... }
export function saveFileName(name: string): void { ... }
export function loadTheme(): 'light' | 'dark' { ... }
export function saveTheme(theme: 'light' | 'dark'): void { ... }
```

---

## 8. 자동 저장 & Debounce

`page.tsx`에서 전체 raw 텍스트 기준으로 1초 debounce 저장:

```ts
useEffect(() => {
  const timer = setTimeout(() => {
    saveContent(raw)
    setLastSaved(new Date())
  }, 1000)
  return () => clearTimeout(timer)
}, [raw])
```

---

## 9. MD 파일 다운로드

```ts
function handleSave() {
  const blob = new Blob([raw], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.endsWith('.md') ? fileName : `${fileName}.md`
  a.click()
  URL.revokeObjectURL(url)
}
```

---

## 10. 다크/라이트 테마

- `<html>` 태그에 `dark` 클래스 토글 (Tailwind `darkMode: 'class'`)
- `localStorage`에 테마 저장 (키: `md-editor-theme`)

---

## 11. 의존성

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18",
    "marked": "^12",
    "dompurify": "^3"
  },
  "devDependencies": {
    "@tailwindcss/typography": "latest",
    "typescript": "^5",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  }
}
```

---

## 12. 구현 순서

1. [x] 프로젝트 초기화 (Next.js + Tailwind + TypeScript)
2. [x] `lib/types.ts` — Block 공유 타입
3. [x] `lib/markdown.ts` — 파싱 + 밑줄 전처리 + sanitize
4. [x] `lib/markdown.ts` — 코드 블록 내 밑줄 변환 제외 처리
5. [x] `lib/storage.ts` — localStorage 유틸
6. [x] `components/EditorBlock.tsx` — 단일 블록 편집/렌더 전환
7. [x] `components/LinerEditor.tsx` — 블록 분리 + 포커스 관리
8. [x] `components/Toolbar.tsx` — 툴바 버튼
9. [x] `components/StatusBar.tsx` — 상태바 (30초 interval 갱신 포함)
10. [x] `app/page.tsx` — LinerEditor로 교체
11. [x] 다크/라이트 테마 스타일 완성
12. [x] MD 다운로드 기능 검증

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial draft (split panel) | gimjaehwan |
| 0.2 | 2026-03-13 | Split → Liner 스타일로 변경 | gimjaehwan |
| 0.3 | 2026-03-13 | 코드 블록 내 밑줄 변환 제외 로직 추가, types.ts 반영 | gimjaehwan |
