'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
  onTyping?: () => void
  onCancel?: () => void
  isAuthenticated: boolean
  isLoading?: boolean
  placeholder?: string
  autoFocus?: boolean
  className?: string
  initialContent?: string
}

export function CommentForm({
  onSubmit,
  onTyping,
  onCancel,
  isAuthenticated,
  isLoading = false,
  placeholder = 'Write a comment...',
  autoFocus = false,
  className,
  initialContent = ''
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent)
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
  const characterLimit = 5000
  const remainingChars = characterLimit - content.length
  const isNearLimit = remainingChars <= 500 // Warn when 500 chars or less remain
  const isAtLimit = remainingChars <= 0

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
          maxLength={characterLimit}
          className={cn(
            'min-h-[100px] max-h-[400px] resize-none pr-12',
            'placeholder:text-muted-foreground/60',
            isDisabled && 'opacity-60 cursor-not-allowed'
          )}
          aria-label="Comment input"
          aria-describedby="char-count"
          aria-invalid={isAtLimit}
        />

        {/* Character count with accessibility */}
        <div
          id="char-count"
          className={cn(
            "absolute bottom-2 right-2 text-xs",
            isAtLimit && "text-destructive font-semibold",
            isNearLimit && !isAtLimit && "text-orange-500",
            !isNearLimit && "text-muted-foreground"
          )}
          aria-live={isNearLimit ? "polite" : "off"}
          aria-atomic="true"
        >
          <span className="sr-only">
            {isAtLimit
              ? "Character limit reached. "
              : isNearLimit
              ? `Warning: Only ${remainingChars} characters remaining. `
              : ""
            }
          </span>
          {content.length}/{characterLimit}
        </div>
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

        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
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
      </div>
    </form>
  )
}