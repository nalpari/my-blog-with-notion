# Tags Renewal – Task 4.1 테스트 리포트

## 1. 기능 테스트 결과
- 실행 명령: `pnpm test`
- 적용 범위:
  - `ModernTagPage`의 로딩/에러/정상/무한 스크롤 트리거 동작 검증
  - 태그 통계 컴포넌트(트렌드 차트, 상관관계 레이더, 활동 히트맵) 렌더링 여부 확인
  - 사이드 카드(연관 태그, 인기 포스트, 태그 클라우드)의 데이터 정렬 및 슬라이싱 로직 검증
  - `react-wordcloud`, `usePostsByTag` 등 외부 의존성에 대한 목킹 처리로 회귀 방지
- 테스트 세부 사항:
  - `RelatedTagsCard` 정렬 순서가 상관관계 기준으로 보장되는지 확인 (코드 개선 포함)
  - 태그 클라우드가 전달받은 데이터 개수만큼 워드 클라우드에 전달되는지 확인
  - "더 많은 포스트 보기" 버튼 클릭 시 로딩 함수 호출 여부 검증

## 2. 접근성 테스트 결과
- 도구: `vitest-axe`
- 실행: `pnpm test`에 포함 (axe-core 기반 자동 검증)
- 결과: 위반 0건
- 개선 사항:
  - 통계/사이드 카드 헤딩 레벨을 `h2`/`h3`로 통일하여 헤딩 계층 위반 해결
  - 카드 이미지 링크에 `aria-label` 부여로 링크 이름 부족 경고 해결
  - 인기 포스트 항목 헤딩 레벨 조정(`h3`)으로 계층 불일치 해소
- 추가 권장 사항:
  - 실제 런타임 환경에서 스크린 리더(VoiceOver, NVDA)로 키보드 네비게이션 점검
  - 다크 모드 대비(contrast)가 디자인 시스템 가이드와 일치하는지 시각적 확인

## 3. 성능 테스트 계획
- 1차 정적 분석: `pnpm build` (build-checker 절차와 함께 수행 예정)
- Lighthouse 시나리오(권장):
  1. `pnpm build && pnpm start`
  2. `http://localhost:3000/tags/<slug>` 접속 후 Lighthouse Performance/A11y 측정
  3. 목표 지표: Performance 90+, TTI < 3.5s, FCP < 1.5s
- Core Web Vitals 추적: Chrome DevTools Performance 탭에서 Interaction to Next Paint(INP) 확인

## 4. 결론 및 다음 단계
- Vitest 기반 자동화 테스트 및 axe 접근성 검증을 통과했습니다.
- 테스트 과정에서 발견된 UI/접근성 이슈(헤딩 레벨, 링크 라벨)를 모두 수정했습니다.
- 남은 과제: 실제 브라우저 기반 Lighthouse 측정 및 스크린 리더 수동 테스트 수행.
