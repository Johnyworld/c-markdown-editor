# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```

## Architecture

**Starter 레벨** — 순수 클라이언트 사이드 Next.js 앱. 백엔드 없음.

### Liner 스타일 에디터 (핵심 개념)

Typora와 유사한 인라인 렌더링 방식. 빈 줄 기준으로 단락을 블록으로 분리하고, 포커스된 블록만 원문(textarea)으로 표시하며 나머지는 렌더링 결과로 표시한다.

```
app/page.tsx           # 루트 — raw 텍스트 상태, 저장/초기화/테마 이벤트
components/
  LinerEditor.tsx      # 블록 배열 상태 관리, 분리(split)/병합(merge)/포커스 이동 처리
  EditorBlock.tsx      # 단일 블록: isFocused=true → textarea, false → rendered div
  Toolbar.tsx          # 파일명 입력, 저장/초기화/테마 버튼
  StatusBar.tsx        # 자동저장 시각, 글자 수
lib/
  markdown.ts          # preprocessUnderline() + marked.parse() + DOMPurify.sanitize()
  storage.ts           # localStorage CRUD (content, filename, theme)
```

## Key Behaviors

- **블록 분리**: raw 텍스트를 `\n\n` 기준으로 `Block[]`로 분리. 저장 시 `join('\n\n')`으로 복원
- **Enter 키**: 커서 위치에서 블록 분리 → `onSplit(id, before, after)`
- **Backspace at start**: 이전 블록과 병합 → `onMerge(id)`
- **밑줄**: `_text_` → `<u>text</u>` — marked 파싱 전 정규식 전처리 (`lib/markdown.ts`)
- **자동 저장**: raw 변경 후 1초 debounce → localStorage 저장
- **다크모드**: `<html>` 태그에 `dark` 클래스 토글, Tailwind `darkMode: 'class'`
- **SSR 주의**: `parseMarkdown`, localStorage 접근은 `typeof window === 'undefined'` 가드 필수
- **XSS 방어**: `marked` 출력은 항상 `DOMPurify.sanitize()` 통과 후 렌더링
