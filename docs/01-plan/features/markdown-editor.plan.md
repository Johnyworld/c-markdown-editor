# markdown-editor Planning Document

> **Summary**: 에디터와 렌더러가 통합된 마크다운 편집 웹사이트 — 작성한 내용을 MD 파일로 저장
>
> **Project**: test-claude-markdown-editor
> **Version**: 0.1.0
> **Author**: gimjaehwan
> **Date**: 2026-03-13
> **Status**: Draft

---

## Executive Summary

| Perspective            | Content                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Problem**            | 마크다운을 작성하면서 동시에 렌더링 결과를 확인하고 싶지만, 별도의 도구 없이 간편하게 사용할 수 있는 통합 에디터가 없음 |
| **Solution**           | 좌측 에디터 + 우측 실시간 미리보기가 통합된 단일 페이지 웹앱으로, MD 파일 다운로드 기능 제공                            |
| **Function/UX Effect** | 실시간 양방향 편집 경험 — 타이핑과 동시에 렌더링 결과 확인, 클릭 한 번으로 파일 저장                                    |
| **Core Value**         | 설치 없이 브라우저에서 바로 사용하는 가볍고 빠른 마크다운 편집 환경                                                     |

---

## 1. Overview

### 1.1 Purpose

마크다운 문서를 작성하면서 실시간으로 렌더링 결과를 확인하고, 완성된 내용을 `.md` 파일로 저장할 수 있는 통합 웹 에디터를 제공한다.

### 1.2 Background

README, 기술 문서, 블로그 포스트 등 마크다운으로 작성하는 콘텐츠가 늘어남에 따라, 별도 앱 설치 없이 브라우저에서 즉시 사용 가능한 경량 에디터에 대한 필요성이 있다.

### 1.3 Related Documents

- 없음 (신규 프로젝트)

---

## 2. Scope

### 2.1 In Scope

- [x] 단일 패널 마크다운 텍스트 입력 에디터 (Content editable)
- [x] 작성한 내용을 `.md` 파일로 다운로드
- [x] 기본 마크다운 문법 지원 (헤딩, 굵기, 기울임, 목록, 코드블록, 링크, 이미지, 표, 인용)
- [x] 로컬 스토리지를 통한 자동 저장 (새로고침 후에도 내용 유지)
- [x] 파일 이름 지정 후 저장
- [x] 기본 마크다운 문법에는 없지만, underscore 하나를 텍스트 양쪽에 사용하면 밑줄을 그려준다.
- [ ] 코드 블록 내에 있는 underscore 는 HTML 태그로 변환하지 않는다.
- [x] 다크/라이트 테마 전환

### 2.2 Out of Scope

- 사용자 계정 및 서버 측 저장
- 실시간 협업 편집
- 플러그인 시스템
- 이미지 업로드 (URL 방식만 지원)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID    | Requirement                                                                        | Priority | Status  |
| ----- | ---------------------------------------------------------------------------------- | -------- | ------- |
| FR-01 | 마크다운을 입력하면서 단일 패널에 실시간으로 에디터에 반영 (content editable 사용) | High     | Pending |
| FR-02 | "저장" 버튼 클릭 시 `.md` 파일 다운로드                                            | High     | Pending |
| FR-03 | 파일 저장 시 파일 이름 입력 (기본값: `document.md`)                                | Medium   | Pending |
| FR-04 | 로컬 스토리지 자동 저장 (타이핑 멈춤 후 1초 내)                                    | Medium   | Pending |
| FR-05 | 에디터 초기화 버튼 (내용 전체 삭제 + 확인 다이얼로그)                              | Low      | Pending |

### 3.2 Non-Functional Requirements

| Category      | Criteria                               | Measurement Method |
| ------------- | -------------------------------------- | ------------------ |
| Performance   | 타이핑 후 렌더링 지연 < 100ms          | 수동 확인          |
| Accessibility | 키보드로 에디터 완전 조작 가능         | 키보드 테스트      |
| Compatibility | Chrome, Firefox, Safari 최신 버전 지원 | 브라우저 테스트    |
| Bundle Size   | 초기 로드 < 500KB (gzip)               | Lighthouse         |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 모든 FR 구현 완료
- [ ] 주요 브라우저에서 동작 확인
- [ ] 코드 리뷰 완료

### 4.2 Quality Criteria

- [ ] Lint 에러 없음
- [ ] 빌드 성공
- [ ] 마크다운 문법 렌더링 정확성 검증

---

## 5. Risks and Mitigation

| Risk                                 | Impact | Likelihood | Mitigation                                                     |
| ------------------------------------ | ------ | ---------- | -------------------------------------------------------------- |
| marked.js XSS 취약점                 | High   | Medium     | DOMPurify로 sanitize 처리 필수                                 |
| 대용량 문서 입력 시 렌더링 성능 저하 | Medium | Low        | debounce 적용 (300ms), 가상 스크롤 미지원으로 사이즈 제한 안내 |
| 로컬 스토리지 용량 초과              | Low    | Low        | 저장 실패 시 사용자에게 경고 표시                              |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level          | Characteristics                                    | Recommended For                         | Selected |
| -------------- | -------------------------------------------------- | --------------------------------------- | :------: |
| **Starter**    | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages |    ✅    |
| **Dynamic**    | Feature-based modules, BaaS integration            | Web apps with backend, SaaS MVPs        |    ☐     |
| **Enterprise** | Strict layer separation, DI, microservices         | High-traffic systems                    |    ☐     |

> **Starter** 선택 — 백엔드 불필요, 순수 클라이언트 사이드 앱

### 6.2 Key Architectural Decisions

| Decision        | Options                                    | Selected                 | Rationale                    |
| --------------- | ------------------------------------------ | ------------------------ | ---------------------------- |
| Framework       | Next.js / React / Vanilla JS               | **Next.js (App Router)** | 빠른 구성, 향후 확장성       |
| Markdown Parser | marked.js / remark / markdown-it           | **marked.js**            | 경량, 빠름, 활성 유지보수    |
| XSS 방어        | DOMPurify / sanitize-html                  | **DOMPurify**            | 브라우저 네이티브 API 기반   |
| Styling         | Tailwind / CSS Modules / styled-components | **Tailwind CSS**         | 빠른 UI 구성                 |
| 상태 관리       | Context / Zustand / useState               | **useState**             | 단순한 앱 — 전역 상태 불필요 |
| Testing         | Jest / Vitest / 없음                       | **없음** (수동 검증)     | Starter 레벨, 단순 로직      |

### 6.3 Clean Architecture Approach

```
Selected Level: Starter

Folder Structure:
src/
├── app/
│   ├── page.tsx          # 메인 에디터 페이지
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Editor.tsx         # 마크다운 입력 텍스트에어리어
│   ├── Preview.tsx        # HTML 렌더링 미리보기
│   ├── Toolbar.tsx        # 저장/초기화 버튼
│   └── ResizablePanels.tsx # 좌우 분할 레이아웃
└── lib/
    ├── markdown.ts        # marked.js + DOMPurify 래퍼
    └── storage.ts         # 로컬 스토리지 자동 저장
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [ ] CLAUDE.md — 미존재 (신규 프로젝트)
- [ ] ESLint — Next.js 기본 설정 사용
- [ ] Prettier — 기본 설정 추가 예정
- [ ] TypeScript — strict 모드 활성화

### 7.2 Conventions to Define/Verify

| Category             | Current State | To Define                                | Priority |
| -------------------- | ------------- | ---------------------------------------- | :------: |
| **Naming**           | 미존재        | PascalCase 컴포넌트, camelCase 함수/변수 |   High   |
| **Folder structure** | 미존재        | Starter 레벨 구조 (위 6.3 참조)          |   High   |
| **Import order**     | 미존재        | React → 외부 라이브러리 → 내부 모듈 순   |  Medium  |

### 7.3 Environment Variables Needed

없음 — 순수 클라이언트 사이드 앱, 환경변수 불필요

---

## 8. Next Steps

1. [ ] Design 문서 작성 (`markdown-editor.design.md`)
2. [ ] Next.js 프로젝트 초기화
3. [ ] 컴포넌트 구현 시작

---

## Version History

| Version | Date       | Changes       | Author     |
| ------- | ---------- | ------------- | ---------- |
| 0.1     | 2026-03-13 | Initial draft | gimjaehwan |
