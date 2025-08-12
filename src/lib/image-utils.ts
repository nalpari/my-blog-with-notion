/**
 * 이미지 최적화 유틸리티
 */

interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'auto'
}

/**
 * 노션 이미지 URL 최적화
 * 노션 S3 이미지에 최적화 파라미터 추가
 */
export function optimizeNotionImageUrl(
  url: string | undefined,
  options: ImageOptimizationOptions = {}
): string | undefined {
  if (!url) return undefined

  const { width = 1200, quality = 75, format = 'webp' } = options

  // 노션 S3 이미지 URL 패턴
  if (url.includes('prod-files-secure.s3')) {
    const urlObj = new URL(url)
    
    // AWS S3 서명된 URL인 경우 파라미터 유지
    if (urlObj.searchParams.has('X-Amz-Signature')) {
      return url // 서명된 URL은 수정하지 않음
    }
    
    // 일반 S3 URL인 경우 최적화 파라미터 추가
    urlObj.searchParams.set('w', width.toString())
    urlObj.searchParams.set('q', quality.toString())
    urlObj.searchParams.set('fm', format)
    
    return urlObj.toString()
  }

  // Unsplash 이미지 최적화
  if (url.includes('images.unsplash.com')) {
    const urlObj = new URL(url)
    urlObj.searchParams.set('w', width.toString())
    urlObj.searchParams.set('q', quality.toString())
    urlObj.searchParams.set('auto', 'format')
    urlObj.searchParams.set('fit', 'crop')
    
    return urlObj.toString()
  }

  return url
}

/**
 * Blur Data URL 생성 (서버사이드에서 실행)
 * 실제 이미지를 기반으로 blur placeholder 생성
 */
export async function generateBlurDataURL(imageUrl: string): Promise<string> {
  // 기본 blur placeholder (회색)
  const defaultBlur = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  
  // 실제 구현 시에는 sharp 또는 plaiceholder 라이브러리 사용
  // const { base64 } = await getPlaiceholder(imageUrl, { size: 10 })
  // return base64
  
  return defaultBlur
}

/**
 * 이미지 사이즈 계산
 * 반응형 sizes 속성 생성
 */
export function getImageSizes(variant: 'card' | 'hero' | 'full' = 'card'): string {
  switch (variant) {
    case 'hero':
      return '100vw'
    case 'full':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
    case 'card':
    default:
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  }
}

/**
 * 이미지 로딩 우선순위 결정
 */
export function getImagePriority(index: number, threshold: number = 3): boolean {
  return index < threshold // 처음 3개 이미지만 priority 로딩
}

/**
 * 캐시 제어 헤더 생성
 */
export function getImageCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=86400, immutable', // 30일 캐싱 + 1일 stale-while-revalidate
    'CDN-Cache-Control': 'max-age=2592000, stale-while-revalidate=86400',
    'Vercel-CDN-Cache-Control': 'max-age=2592000, stale-while-revalidate=86400',
  }
}