import { useState, useEffect } from 'react'
import { FILTER_CONFIG } from '@/config/constants'

interface UseCategoriesResult {
  categories: string[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  loadCategories: () => Promise<void>
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(FILTER_CONFIG.ALL_CATEGORIES)

  const loadCategories = async () => {
    try {
      // 전체 포스트를 가져와서 카테고리 추출
      // TODO: 별도 카테고리 API 엔드포인트 생성하여 최적화
      const response = await fetch('/api/posts?limit=100')
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const data = await response.json()
      const posts = data.posts || []
      
      // 고유 카테고리 추출
      const uniqueCategories = Array.from(
        new Set(posts.map((post: { category?: { name?: string } }) => post.category?.name).filter(Boolean))
      ).sort() as string[]

      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    loadCategories,
  }
}