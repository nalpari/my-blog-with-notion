# 📋 Supabase 댓글 시스템 구현 실행 계획

## 🎯 프로젝트 목표

Next.js 15 블로그에 Supabase를 활용한 실시간 댓글 시스템 구현

## 📅 구현 일정

- 총 소요 기간: 3-4주
- 스키마 파일을 만들지 말고, mcp를 이욯애서 테이블을 직접 생성
- 필요하다면 mcp 를 적극 활용

---

## Phase 1: Supabase 프로젝트 설정 (1주차)

### 1.1 Supabase 프로젝트 초기화 ✅

- [x] Supabase 프로젝트 생성
- [x] 환경변수 설정 (.env.local)
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  ```
- [x] Authentication 프로바이더 설정 (Email, Google, GitHub)
- [x] RLS 비활성화 확인

### 1.2 데이터베이스 스키마 생성 ✅

- [x] comments 테이블 생성
- [x] 필수 인덱스 설정
- [x] 테이블 관계 설정

### 1.3 프로젝트 의존성 설치 ✅

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## Phase 2: 인증 시스템 구축 (1-2주차)

### 2.1 Supabase Client 설정 ✅

- [x] `/src/lib/supabase/client.ts` 생성
- [x] 브라우저 클라이언트 설정
- [x] 서버 클라이언트 설정

### 2.2 인증 컴포넌트 구현 ✅

- [x] `/src/components/auth/AuthModal.tsx` - 로그인/회원가입 모달
- [x] `/src/components/auth/AuthButton.tsx` - 인증 상태 버튼
- [x] `/src/components/auth/UserAvatar.tsx` - 사용자 아바타
- [x] `/src/hooks/useAuth.ts` - 인증 커스텀 훅

### 2.3 OAuth 설정 ✅

- [x] Google OAuth 설정
- [x] GitHub OAuth 설정
- [x] 리다이렉트 URL 설정

### 2.4 세션 관리 ✅

- [x] 세션 자동 갱신 구현
- [x] 로그아웃 기능
- [x] 익명 댓글 지원 옵션

---

## Phase 3: 댓글 API 개발 (2주차)

### 3.1 API 엔드포인트 구현 ✅

- [x] `POST /api/comments` - 댓글 작성
- [x] `GET /api/comments?post=slug` - 댓글 목록 조회
- [x] `PUT /api/comments/[id]` - 댓글 수정
- [x] `DELETE /api/comments/[id]` - 댓글 삭제 (soft delete)

### 3.2 서버 사이드 검증 ✅

- [x] 사용자 권한 확인 미들웨어
- [x] 입력 데이터 검증 (zod 활용)
- [x] Rate limiting 구현
- [x] 에러 핸들링

### 3.3 타입 정의 ✅

- [x] `/src/types/comment.ts` - Comment 인터페이스
- [x] API 응답 타입 정의

---

## Phase 4: Realtime 기능 구현 (2-3주차)

### 4.1 Broadcast Channel 설정 ✅

- [x] 포스트별 채널 구독 로직
- [x] 실시간 이벤트 핸들러 설정
- [x] 연결 상태 관리

### 4.2 실시간 이벤트 구현 ✅

- [x] `comment:new` - 새 댓글 실시간 추가
- [x] `comment:update` - 댓글 수정 실시간 반영
- [x] `comment:delete` - 댓글 삭제 실시간 처리
- [x] 타이핑 인디케이터 (선택사항)

### 4.3 Presence 기능 ✅

- [x] 현재 보고 있는 사용자 수 표시
- [x] 타이핑 중인 사용자 표시 (선택사항)

---

## Phase 5: UI 컴포넌트 개발 (3주차)

### 5.1 댓글 컴포넌트 구조 🎨

```
/src/components/comments/
├── CommentsSection.tsx      # 메인 컨테이너
├── CommentForm.tsx          # 댓글 작성 폼
├── CommentList.tsx          # 댓글 목록
├── Comment.tsx              # 개별 댓글
├── CommentActions.tsx       # 댓글 액션 (수정/삭제)
└── CommentReplies.tsx       # 답글 컴포넌트
```

### 5.2 UI 기능 구현 ✅

- [x] 마크다운 에디터 통합
- [ ] 이모지 반응 기능
- [x] 댓글 수 실시간 업데이트
- [x] 무한 스크롤 페이지네이션
- [ ] 댓글 정렬 (최신순, 인기순)

### 5.3 스타일링 ✅

- [x] 다크/라이트 모드 지원
- [x] 모바일 반응형 디자인
- [x] 로딩/에러 상태 UI
- [x] 애니메이션 효과

---

## Phase 6: 최적화 및 안정성 (3-4주차)

### 6.1 성능 최적화 🚀

- [x] Optimistic Updates 구현
- [x] 댓글 데이터 캐싱
- [x] 이미지 lazy loading
- [ ] 번들 사이즈 최적화

### 6.2 에러 처리 및 복구 🛡️

- [x] 네트워크 실패 재시도 로직
- [x] 연결 끊김 자동 재연결
- [ ] 충돌 해결 메커니즘
- [x] 사용자 피드백 토스트

### 6.3 보안 강화 🛡️

- [ ] XSS 방지 (DOMPurify)
- [ ] SQL Injection 방지
- [ ] Rate limiting 강화
- [ ] Input sanitization

### 6.4 테스팅 🧪

- [ ] 단위 테스트 작성
- [ ] 통합 테스트
- [ ] E2E 테스트 (Playwright)
- [ ] 성능 테스트

---

## 📊 성능 목표

| 지표                 | 목표   |
| -------------------- | ------ |
| 댓글 로딩 시간       | <500ms |
| 실시간 업데이트 지연 | <100ms |
| 동시 접속자 지원     | 1000+  |
| 시스템 가용성        | 99.9%  |

---

## 🔧 기술 스택

### Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- Supabase (Auth, Database, Realtime)
- PostgreSQL
- Edge Functions (필요시)

### 도구

- React Hook Form (폼 관리)
- Zod (검증)
- React Markdown (마크다운 렌더링)
- DOMPurify (XSS 방지)

---

## 📝 체크리스트

### 시작 전 준비사항

- [ ] Supabase 계정 생성
- [ ] 프로젝트 요구사항 최종 확인
- [ ] 기존 코드베이스 분석 완료

### 필수 구현 기능

- [ ] 사용자 인증 (소셜 로그인)
- [ ] 댓글 CRUD
- [ ] 실시간 업데이트
- [ ] 중첩 댓글 (답글)
- [ ] 댓글 수 표시

### 선택 구현 기능

- [ ] 타이핑 인디케이터
- [ ] 이모지 반응
- [ ] 댓글 좋아요
- [ ] 댓글 신고
- [ ] 관리자 모드

---

## 🚨 주의사항

1. **RLS 비활성화 상태**에서 애플리케이션 레벨 보안 철저히 구현
2. **환경변수 관리** 철저 (절대 커밋하지 않기)
3. **Rate Limiting** 필수 적용
4. **에러 로깅** 시스템 구축 (Sentry 활용 권장)
5. **백업 전략** 수립

---

## 📈 모니터링

- Supabase Dashboard 활용
- 에러 추적 (Sentry)
- 성능 모니터링 (Vercel Analytics)
- 사용자 행동 분석 (선택사항)

---

## 🎯 다음 단계

1. **즉시 시작**: Supabase 프로젝트 생성
2. **환경 설정**: 개발 환경 구성
3. **스키마 생성**: 데이터베이스 테이블 설정
4. **인증 구현**: 기본 로그인 기능부터 시작
5. **점진적 구현**: 핵심 기능부터 단계별로 구현

---

**예상 완료일**: 4주 후
**우선순위**: 높음
**담당자**: 개발팀
