'use client'

import { Card, CardHeader, CardContent } from '@/components/ui/card'

interface PostsLoadingProps {
  count?: number
}

export function PostsLoading({ count = 6 }: PostsLoadingProps = {}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }, (_, i) => i + 1).map((i) => (
        <Card key={i} className="overflow-hidden p-0">
          <div className="relative h-48 w-full bg-muted animate-pulse" />
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <span>•</span>
              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-6 w-full bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
