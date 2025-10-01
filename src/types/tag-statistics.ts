import type { Post, Tag } from './notion'

/**
 * 태그 통계 데이터 인터페이스
 * 태그 상세 페이지에서 사용되는 다양한 통계 정보를 담음
 */
export interface TagStatistics {
	/** 월별 포스트 트렌드 데이터 */
	monthlyTrend: MonthlyTrendData[]

	/** 연관 태그 목록 (상관관계 점수 포함) */
	relatedTags: RelatedTagData[]

	/** 포스트 분포 데이터 (일별/주별) */
	postDistribution: PostDistributionData[]

	/** 해당 태그의 인기 포스트 목록 */
	topPosts: Post[]
}

/**
 * 월별 트렌드 데이터
 * Area Chart 렌더링에 사용
 */
export interface MonthlyTrendData {
	/** 월 (예: "2024-01", "2024-02") */
	month: string

	/** 해당 월의 포스트 수 */
	count: number

	/** 전월 대비 증감률 (선택적) */
	growthRate?: number
}

/**
 * 연관 태그 데이터
 * 함께 사용된 빈도를 기반으로 한 상관관계 점수
 */
export interface RelatedTagData {
	/** 태그 정보 */
	tag: Tag

	/** 상관관계 점수 (0.0 ~ 1.0) */
	correlation: number

	/** 함께 사용된 포스트 수 */
	coOccurrenceCount: number
}

/**
 * 포스트 분포 데이터
 * 히트맵이나 타임라인 차트에 사용
 */
export interface PostDistributionData {
	/** 날짜 (ISO 8601 형식: "2024-01-15") */
	date: string

	/** 해당 날짜의 포스트 수 */
	posts: number

	/** 요일 (0: 일요일 ~ 6: 토요일) */
	dayOfWeek?: number
}

/**
 * 태그 통계 API 응답 타입
 */
export interface TagStatisticsResponse {
	/** 태그 정보 */
	tag: Tag

	/** 통계 데이터 */
	statistics: TagStatistics

	/** 전체 포스트 수 */
	totalPostCount: number

	/** 데이터 생성 시간 (캐시 관리용) */
	generatedAt: string
}

/**
 * 연관 태그 API 응답 타입
 */
export interface RelatedTagsResponse {
	/** 기준 태그 */
	tag: Tag

	/** 연관 태그 목록 */
	relatedTags: RelatedTagData[]

	/** 데이터 생성 시간 */
	generatedAt: string
}

/**
 * 차트 데이터 포인트 (Recharts 호환)
 */
export interface ChartDataPoint {
	/** X축 값 (날짜, 카테고리 등) */
	name: string

	/** Y축 값 */
	value: number

	/** 추가 데이터 (툴팁 등에 사용) */
	[key: string]: string | number | undefined
}

/**
 * 워드 클라우드 데이터 포인트
 */
export interface WordCloudData {
	/** 단어 (태그 이름) */
	text: string

	/** 가중치 (포스트 수) */
	value: number

	/** 색상 (선택적) */
	color?: string

	/** 인덱스 시그니처 (react-wordcloud 호환성) */
	[key: string]: string | number | undefined
}
