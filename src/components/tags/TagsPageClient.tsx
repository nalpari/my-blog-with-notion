'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTags } from '@/hooks/useTags'
import { PostsLoading } from '@/components/posts/PostsLoading'
import { cn } from '@/lib/utils'

/**
 * Client-side Tags Page Component
 * Redesigned with Linear Design System principles: Grid layout, glassmorphism, and minimal typography.
 */
export function TagsPageClient() {
  const { tags, loading, error, refreshTags } = useTags()
  const [searchQuery, setSearchQuery] = React.useState('')

  // Filter tags based on search query
  const filteredTags = React.useMemo(() => {
    if (!searchQuery) return tags
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [tags, searchQuery])

  // Sort tags by count (descending) for the "Featured" section
  const featuredTags = React.useMemo(() => {
    return [...tags].sort((a, b) => b.count - a.count).slice(0, 4)
  }, [tags])

  // Sort remaining tags alphabetically
  const allTagsSorted = React.useMemo(() => {
    return [...filteredTags].sort((a, b) => a.name.localeCompare(b.name))
  }, [filteredTags])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-20 space-y-12">
        <div className="space-y-4 text-center">
          <div className="h-10 w-48 bg-muted rounded-lg mx-auto animate-pulse" />
          <div className="h-6 w-96 bg-muted/50 rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto px-4 py-32 text-center space-y-6">
        <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10 inline-block">
          <svg className="w-12 h-12 text-destructive/50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Failed to load tags</h3>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
        <button
          onClick={refreshTags}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Background patterns */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-muted/20 to-transparent pointer-events-none" />

      <div className="container max-w-6xl mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Explore Topics
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover articles by category. From development guides to personal thoughts.
            </p>
          </motion.div>

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative max-w-md mx-auto"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Filter tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-all outline-none backdrop-blur-sm"
            />
          </motion.div>
        </div>

        {/* Featured Tags Section (Only show if no search filter) */}
        {!searchQuery && featuredTags.length > 0 && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mb-20"
          >
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Popular Topics
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredTags.map((tag) => (
                <motion.div key={tag.id} variants={itemVariants}>
                  <Link href={`/tags/${tag.slug}`}>
                    <div className="group h-full p-6 bg-card/40 hover:bg-card/80 border border-border/40 hover:border-border/80 rounded-2xl transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-1">
                      <div className="flex flex-col h-full justify-between gap-4">
                        <div className="flex items-start justify-between">
                          <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground group-hover:bg-muted/80 transition-colors">
                            {tag.count} posts
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {tag.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* All Tags Grid */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex items-center gap-3 mb-6 px-1">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {searchQuery ? 'Search Results' : 'All Topics'}
            </h2>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          {allTagsSorted.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No tags found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {allTagsSorted.map((tag) => (
                <motion.div key={tag.id} variants={itemVariants}>
                  <Link href={`/tags/${tag.slug}`}>
                    <div className="group flex items-center justify-between p-3.5 bg-card/30 hover:bg-card/70 border border-border/30 hover:border-border/70 rounded-xl transition-all duration-200">
                      <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground truncate pr-2">
                        {tag.name}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {tag.count}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}