# markdown-editor Gap Analysis

> **Date**: 2026-03-13
> **Design Ref**: `docs/02-design/features/markdown-editor.design.md`
> **Match Rate**: 88% → **100%** (Act-1 수정 후)

---

## 분석 결과 요약

| 항목 | 설계 | 구현 | 상태 |
|------|------|------|:----:|
| LinerEditor (블록 분리/병합/포커스) | ✅ | ✅ | ✅ |
| EditorBlock (편집/렌더 전환) | ✅ | ✅ | ✅ |
| Toolbar (파일명/저장/초기화/테마) | ✅ | ✅ | ✅ |
| StatusBar (자동저장 시각/글자 수) | ✅ | ✅ | ⚠️ |
| markdown.ts (밑줄 전처리 + sanitize) | ✅ | ✅ | ✅ |
| storage.ts (6개 함수) | ✅ | ✅ | ✅ |
| 자동 저장 1초 debounce | ✅ | ✅ | ✅ |
| MD 파일 다운로드 | ✅ | ✅ | ✅ |
| 다크/라이트 테마 | ✅ | ✅ | ✅ |
| 코드 품질 | — | — | ⚠️ |

---

## Gap 목록

### GAP-01 · 미사용 함수 (LinerEditor.tsx:37)
- **위치**: `LinerEditor.tsx` line 37–40
- **내용**: `update(next: Block[])` 함수가 정의되어 있으나 어디에서도 호출되지 않음 (dead code)
- **영향**: 기능적 문제 없음, 코드 품질
- **조치**: 삭제

### GAP-02 · 미사용 import (LinerEditor.tsx:3)
- **위치**: `LinerEditor.tsx` line 3
- **내용**: `useId`가 React에서 import되어 있으나 사용되지 않음
- **영향**: 없음, lint 경고
- **조치**: import에서 제거

### GAP-03 · Block 인터페이스 중복 정의
- **위치**: `LinerEditor.tsx:6`, `EditorBlock.tsx:6`
- **내용**: `Block` 인터페이스가 두 파일에 각각 정의됨. 설계의 Starter 구조에서는 `lib/` 또는 별도 types에서 공유해야 함
- **영향**: 타입 불일치 위험, 유지보수성
- **조치**: `lib/types.ts`로 분리 후 양쪽에서 import

### GAP-04 · StatusBar 상대 시각 미갱신
- **위치**: `StatusBar.tsx`
- **내용**: `formatRelativeTime(date)`는 렌더 시점 기준으로 계산되므로, 저장 후 30초가 지나도 "방금 전"이 그대로 표시됨. 부모에서 re-render가 없으면 업데이트 안 됨
- **영향**: UX — 저장 시각이 실시간으로 갱신되지 않음
- **조치**: `StatusBar` 내부에 `setInterval`(30초) 로 강제 re-render 추가

---

## 수정 불필요 항목

- `rawToBlocks('')` 결과 뒤의 `|| [...]` fallback — `rawToBlocks`는 항상 최소 1개 블록을 반환하므로 실제로 실행되지 않지만 방어 코드로 허용
- `EditorBlock`에서 포커스 시 커서를 항상 끝으로 이동 — 설계 명세(`커서를 끝으로 이동`) 준수

---

## 조치 계획

| Gap | 우선순위 | 작업 |
|-----|:--------:|------|
| GAP-01 dead code | Medium | `update` 함수 삭제 |
| GAP-02 unused import | Low | `useId` import 제거 |
| GAP-03 타입 중복 | Medium | `lib/types.ts` 추출 |
| GAP-04 시각 미갱신 | Medium | `StatusBar` 내 interval re-render |
