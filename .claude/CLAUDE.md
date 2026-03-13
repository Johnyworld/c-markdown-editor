# 프로젝트: Markdowner

에디터와 렌더러가 통합된 마크다운 편집 웹사이트 — 작성한 내용을 MD 파일로 저장

## 코드 스타일

- TypeScript strict 모드 사용, `any` 타입 금지
- default export 대신 named export 사용
- CSS: Tailwind 유틸리티 클래스 사용, 커스텀 CSS 파일 금지

## 명령어

- `npm run dev`: 개발 서버 시작 (포트 3000)
- `npm run test`: Jest 테스트 실행
- `npm run test:e2e`: Playwright end-to-end 테스트 실행
- `npm run lint`: ESLint 검사
- `npm run db:migrate`: Prisma 마이그레이션 실행

## 아키텍처

- `/app`: Next.js App Router 페이지 및 레이아웃
- `/components/ui`: 재사용 가능한 UI 컴포넌트
- `/lib`: 유틸리티 및 공유 로직
- `/app/api`: API 라우트

## 중요 사항

- .env 파일은 절대 커밋하지 마세요
- 제품 이미지는 로컬이 아닌 Cloudinary에 저장됩니다
- 인증 플로우에 대한 자세한 내용은 @docs/authentication.md를 참고하세요
