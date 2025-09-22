# 🏗️ Supabase 실시간 댓글 시스템 구현 계획

Supabase의 Authentication과 Realtime 기능을 활용한 실시간 댓글 시스템 설계 문서입니다. RLS는 off로 설정하고 애플리케이션 레벨에서 보안을 처리합니다.

## 📊 시스템 아키텍처

### 1. **기술 스택 구성**
```
Frontend: Next.js 15 + React 19 + TypeScript
Backend: Supabase (Auth, Realtime, Database)
State: React hooks + Optimistic Updates
Real-time: Supabase Broadcast Channel
```

### 2. **데이터 플로우**
```
User Action → Optimistic Update → Supabase DB → Broadcast → All Clients
```

## 🔧 구현 단계별 계획

### **Phase 1: Supabase 프로젝트 설정 (Week 1)**

#### 1.1 프로젝트 초기화
- Supabase 프로젝트 생성 및 환경변수 설정
- Authentication 프로바이더 설정 (Email, OAuth)
- RLS 비활성화 설정

#### 1.2 데이터베이스 스키마
```sql
-- comments 테이블 구조
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  user_email TEXT,
  user_avatar TEXT,
  parent_id UUID REFERENCES comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- 인덱스 설정
CREATE INDEX idx_comments_post_slug ON comments(post_slug);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

### **Phase 2: 인증 시스템 구축 (Week 1-2)**

#### 2.1 Auth 컴포넌트
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### 2.2 인증 플로우
- 로그인/회원가입 모달 컴포넌트
- OAuth 소셜 로그인 (Google, GitHub)
- 세션 관리 및 자동 갱신
- 익명 사용자 댓글 지원

### **Phase 3: 댓글 API 개발 (Week 2)**

#### 3.1 API 엔드포인트
```typescript
// /api/comments 구조
POST   /api/comments          - 댓글 작성
GET    /api/comments?post=slug - 댓글 목록 조회
PUT    /api/comments/:id      - 댓글 수정
DELETE /api/comments/:id      - 댓글 삭제 (soft delete)
```

#### 3.2 서버 사이드 검증
- 사용자 권한 확인
- 입력 데이터 검증
- Rate limiting 적용

### **Phase 4: Realtime 기능 구현 (Week 2-3)**

#### 4.1 Broadcast Channel 설정
```typescript
// Realtime 채널 구조
const channel = supabase
  .channel(`comments:${postSlug}`, {
    config: {
      broadcast: { self: true, ack: true },
      presence: { key: userId }
    }
  })
  .on('broadcast', { event: 'comment:new' }, handleNewComment)
  .on('broadcast', { event: 'comment:update' }, handleUpdateComment)
  .on('broadcast', { event: 'comment:delete' }, handleDeleteComment)
  .subscribe()
```

#### 4.2 이벤트 핸들링
- 새 댓글 실시간 추가
- 댓글 수정 실시간 반영
- 댓글 삭제 실시간 처리
- 타이핑 인디케이터 (선택사항)

### **Phase 5: UI 컴포넌트 개발 (Week 3)**

#### 5.1 댓글 컴포넌트 구조
```typescript
// 컴포넌트 계층 구조
<CommentsSection>
  <CommentForm />
  <CommentList>
    <Comment>
      <CommentActions />
      <CommentReplies />
    </Comment>
  </CommentList>
</CommentsSection>
```

#### 5.2 UI/UX 기능
- 중첩 댓글 (replies) 지원
- 마크다운 에디터
- 이모지 반응
- 댓글 수 실시간 업데이트
- 무한 스크롤 페이지네이션

### **Phase 6: 최적화 및 안정성 (Week 3-4)**

#### 6.1 성능 최적화
```typescript
// Optimistic Updates 구현
const addComment = async (comment) => {
  // 1. UI 즉시 업데이트
  setComments(prev => [...prev, optimisticComment])

  // 2. 서버 요청
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)

  // 3. 실제 데이터로 교체
  if (data) replaceOptimisticComment(data)
  if (error) rollbackOptimisticComment()
}
```

#### 6.2 에러 처리
- 네트워크 실패 시 재시도
- 연결 끊김 시 자동 재연결
- 충돌 해결 (Conflict Resolution)
- 사용자 피드백 UI

## 📋 기술적 고려사항

### 보안 (RLS OFF 상태)
```typescript
// 애플리케이션 레벨 보안
- JWT 토큰 검증
- API 라우트에서 권한 체크
- Input sanitization
- XSS 방지
- Rate limiting
```

### 확장성
```typescript
// 대용량 처리 전략
- 댓글 페이지네이션 (cursor-based)
- 채널별 구독 분리
- 댓글 캐싱 전략
- CDN 활용
```

### 모니터링
```typescript
// 실시간 모니터링
- Supabase Dashboard 활용
- 에러 로깅 (Sentry)
- 성능 메트릭스
- 사용자 행동 분석
```

## 🎯 예상 결과물

### 핵심 기능
✅ 실시간 댓글 작성/수정/삭제
✅ 중첩 댓글 지원
✅ 사용자 인증 (소셜 로그인)
✅ 익명 댓글 옵션
✅ 실시간 업데이트
✅ 타이핑 인디케이터
✅ 댓글 수 실시간 표시

### 성능 목표
- 댓글 로딩: <500ms
- 실시간 업데이트: <100ms
- 동시 접속자: 1000+ 지원
- 가용성: 99.9%

## 🚀 다음 단계

1. Supabase 프로젝트 생성 및 환경변수 설정
2. 데이터베이스 스키마 생성
3. Authentication 설정
4. 댓글 API 개발
5. Realtime 기능 구현
6. UI 컴포넌트 개발
7. 테스트 및 최적화