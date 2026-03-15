# Markdowner

마크다운 에디터와 실시간 미리보기가 통합된 웹 애플리케이션. 작성한 내용을 `.md` 파일로 저장할 수 있습니다.

## 주요 기능

- **Liner 스타일 인라인 렌더링** — Typora처럼 포커스된 블록만 원문으로 표시하고 나머지는 렌더링
- **실시간 미리보기** — 입력 즉시 마크다운 렌더링
- **MD 파일 저장** — 파일명을 지정해 `.md` 파일로 다운로드
- **자동 저장** — 입력 후 1초 debounce로 localStorage에 자동 저장
- **다크 모드** — 라이트/다크 테마 토글
- **XSS 방어** — DOMPurify로 HTML 새니타이징

## 지원 마크다운 문법

| 문법 | 입력 | 출력 |
|------|------|------|
| 굵게 | `**텍스트**` | **텍스트** |
| 기울임 | `*텍스트*` | *텍스트* |
| 밑줄 | `_텍스트_` | <u>텍스트</u> |
| 취소선 | `~~텍스트~~` | ~~텍스트~~ |
| 코드 블록 | ` ```언어 ``` ` | 구문 강조 코드 블록 |
| 인용문 | `> 텍스트` | 인용 블록 |
| 표 | `\| 헤더 \|` | 테이블 |

## 데모

**https://test-claude-markdown-editor.vercel.app/**

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속합니다.

## 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```

## 프로젝트 구조

```
app/
  page.tsx           # 루트 — raw 텍스트 상태, 저장/초기화/테마 이벤트
  layout.tsx         # HTML 레이아웃, 메타데이터
components/
  LinerEditor.tsx    # 블록 배열 상태 관리, 분리/병합/포커스 이동
  EditorBlock.tsx    # 단일 블록: 포커스 시 textarea, 비포커스 시 렌더링 div
  Toolbar.tsx        # 파일명 입력, 저장/초기화/테마 버튼
  StatusBar.tsx      # 자동저장 시각, 글자 수
lib/
  markdown.ts        # 마크다운 파싱 + DOMPurify 새니타이징
  storage.ts         # localStorage CRUD (content, filename, theme)
```

## 기술 스택

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + `@tailwindcss/typography`
- **DOMPurify** — XSS 방어
