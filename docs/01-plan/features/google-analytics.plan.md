# Google Analytics (GA4) Planning Document

> **Summary**: Next.js 블로그에 GA4를 통합하여 페이지 뷰, 참여 시간, 사용자 이벤트를 트래킹
>
> **Project**: my-blog-with-notion
> **Version**: 0.1.0
> **Author**: Developer
> **Date**: 2026-03-13
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

블로그 방문자의 행동 데이터(페이지 진입, 체류 시간, 버튼 클릭 등)를 수집하여 콘텐츠 전략 및 사용자 경험 개선에 활용한다.

### 1.2 Background

- 현재 블로그에 방문자 분석 기능이 전혀 없어 어떤 콘텐츠가 인기 있는지, 사용자가 어디서 이탈하는지 파악 불가
- GA4는 무료이며 Next.js 공식 지원 라이브러리(`@next/third-parties`)가 존재
- SPA 구조의 페이지 전환도 GA4 향상된 측정으로 자동 감지 가능

### 1.3 Related Documents

- References: [Next.js Third Parties - Google Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries#google-analytics)
- References: [GA4 향상된 측정](https://support.google.com/analytics/answer/9216061)

---

## 2. Scope

### 2.1 In Scope

- [x] `@next/third-parties` 라이브러리 설치 및 GA4 스크립트 삽입
- [x] 페이지 뷰 자동 트래킹 (GA4 향상된 측정 활용)
- [x] 커스텀 이벤트 전송 유틸리티 함수 구현
- [x] 환경변수 기반 측정 ID 관리 (개발/프로덕션 분리)

### 2.2 Out of Scope

- Google Tag Manager(GTM) 통합 (향후 확장 시 별도 계획)
- 서버사이드 이벤트 전송 (Measurement Protocol)
- GA4 대시보드/리포트 커스터마이징 (GA4 콘솔에서 직접 설정)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | GA4 스크립트를 루트 레이아웃에 삽입하여 전체 페이지에서 동작 | High | Pending |
| FR-02 | SPA 경로 전환 시 페이지 뷰 자동 기록 (향상된 측정) | High | Pending |
| FR-03 | `sendGAEvent` 유틸을 통한 커스텀 이벤트 전송 기능 | Medium | Pending |
| FR-04 | 개발 환경에서 GA 비활성화 (측정 ID 미설정 시 스크립트 미삽입) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | GA 스크립트로 인한 LCP 영향 < 50ms | Lighthouse 측정 |
| Performance | GA 스크립트 로딩이 메인 렌더링 차단하지 않음 | `afterInteractive` 전략 확인 |
| Privacy | 환경변수에 측정 ID 저장, 코드에 하드코딩 금지 | 코드 리뷰 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] `@next/third-parties` 설치 완료
- [x] `GoogleAnalytics` 컴포넌트가 루트 레이아웃에 조건부 렌더링
- [x] 커스텀 이벤트 전송 유틸 함수 구현
- [x] 빌드 성공 및 타입 에러 없음
- [x] 개발 환경에서 GA 스크립트 미삽입 확인

### 4.2 Quality Criteria

- [x] Zero lint errors
- [x] Build succeeds
- [x] TypeScript strict mode 준수 (no `any`)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| GA 스크립트가 페이지 로딩 성능 저하 | Medium | Low | `@next/third-parties`가 `afterInteractive` 전략으로 자동 처리 |
| 개발 환경에서 불필요한 GA 데이터 전송 | Low | Medium | 환경변수 미설정 시 컴포넌트 미렌더링 처리 |
| Ad blocker가 GA 스크립트 차단 | Low | High | 핵심 기능이 아니므로 graceful degradation |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites, portfolios | ☐ |
| **Dynamic** | Feature-based modules, services layer | Web apps with backend, SaaS MVPs | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| GA 라이브러리 | `@next/third-parties` / `react-ga4` / 수동 gtag | `@next/third-parties` | Next.js 공식 지원, 성능 최적화 내장 |
| 스크립트 위치 | 루트 layout / 개별 page | 루트 layout | 전체 페이지 트래킹 필요 |
| 이벤트 전송 | 직접 `gtag()` 호출 / `sendGAEvent` 래퍼 | `sendGAEvent` | 공식 API, 타입 안전 |

### 6.3 구현 구조

```
src/
├── app/
│   └── layout.tsx          # GoogleAnalytics 컴포넌트 추가
├── lib/
│   └── analytics.ts        # GA 이벤트 전송 유틸리티 (선택)
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration
- [x] TypeScript configuration (`tsconfig.json`)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **환경변수 네이밍** | exists | `NEXT_PUBLIC_GA_MEASUREMENT_ID` 추가 | High |
| **Third-party 통합** | missing | 서드파티 라이브러리는 루트 layout에서 관리 | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 측정 ID (G-XXXXXXXXXX) | Client | ☑ |

---

## 8. Next Steps

1. [x] Design 문서 작성 (`google-analytics.design.md`)
2. [ ] `@next/third-parties` 설치
3. [ ] 루트 레이아웃에 GA 컴포넌트 통합
4. [ ] 커스텀 이벤트 유틸 구현

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial draft | Developer |
