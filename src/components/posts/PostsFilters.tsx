'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'
import { FILTER_CONFIG } from '@/config/constants'
import { MESSAGES } from '@/config/messages'

interface PostsFiltersProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  onSearch: (query: string) => void
}

export function PostsFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  onSearch,
}: PostsFiltersProps) {
  const [searchInput, setSearchInput] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchInput)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={MESSAGES.SEARCH_PLACEHOLDER}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="default">
          검색
        </Button>
      </form>

      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder={MESSAGES.FILTER_BY_CATEGORY} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={FILTER_CONFIG.ALL_CATEGORIES}>
            {MESSAGES.ALL_CATEGORIES}
          </SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}