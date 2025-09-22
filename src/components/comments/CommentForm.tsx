'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
  onTyping?: () => void
  isAuthenticated: boolean
  isLoading?: boolean
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

export function CommentForm({
  onSubmit,
  onTyping,
  isAuthenticated,
  isLoading = false,
  placeholder = 'Write a comment...',
  autoFocus = false,
  className
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const adjustHeight = () => {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }

    adjustHeight()
  }, [content])

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)

    // Send typing indicator
    if (onTyping && isAuthenticated) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      onTyping()

      typingTimeoutRef.current = setTimeout(() => {
        // Typing stopped
      }, 1000)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedContent = content.trim()
    if (!trimmedContent || isSubmitting) return

    setIsSubmitting(true)

    try {
      await onSubmit(trimmedContent)
      setContent('')

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const isDisabled = !isAuthenticated || isLoading || isSubmitting

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          autoFocus={autoFocus}
          className={cn(
            'min-h-[100px] max-h-[400px] resize-none pr-12',
            'placeholder:text-muted-foreground/60',
            isDisabled && 'opacity-60 cursor-not-allowed'
          )}
          aria-label="Comment input"
        />

        {/* Character count */}
        {content.length > 0 && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {content.length}/5000
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {isAuthenticated ? (
            <span>
              Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">⌘</kbd> +
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ml-1">Enter</kbd> to submit
            </span>
          ) : (
            <span>Sign in to comment</span>
          )}
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={isDisabled || !content.trim()}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Post
            </>
          )}
        </Button>
      </div>
    </form>
  )
}