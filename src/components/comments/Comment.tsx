'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { CommentWithReplies } from '@/types/supabase'
import { CommentActions } from './CommentActions'
import { CommentForm } from './CommentForm'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'

interface CommentProps {
  comment: CommentWithReplies
  onReply?: (commentId: string, userName: string) => void
  onReplySubmit?: (content: string, parentId: string) => Promise<void>
  onEdit?: (commentId: string, content: string) => Promise<void>
  onDelete?: (commentId: string) => Promise<void>
  currentUserId?: string | null
  className?: string
}

/**
 * Validate and sanitize href to prevent XSS attacks
 * Only allows safe protocols and relative paths
 */
function isSafeHref(href: string | undefined): boolean {
  if (!href) return false

  // Normalize the href:
  // 1. Trim whitespace
  let normalizedHref = href.trim()

  // 2. Reject empty strings after trimming
  if (!normalizedHref) return false

  // 3. Attempt to decode percent-encoded characters
  try {
    normalizedHref = decodeURIComponent(normalizedHref)
  } catch {
    // If decoding fails, the URL might be malformed or double-encoded
    // Continue with the original but be more cautious
  }

  // 4. Strip control characters and collapse whitespace
  // Remove zero-width characters, control characters, and normalize spaces
  normalizedHref = normalizedHref
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '') // Control chars
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()

  // 5. Reject if empty after normalization
  if (!normalizedHref) return false

  // Allow relative paths and fragment hashes
  if (normalizedHref.startsWith('/') || normalizedHref.startsWith('#')) {
    return true
  }

  // Check for suspicious patterns before URL parsing
  const suspiciousPatterns = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
    'blob:',
    'ws:',
    'wss:'
  ]

  const lowerHref = normalizedHref.toLowerCase()

  // Check at the beginning of the string (after normalization)
  if (suspiciousPatterns.some(pattern => lowerHref.startsWith(pattern))) {
    return false
  }

  // Also check if these patterns appear anywhere (e.g., after encoding tricks)
  if (suspiciousPatterns.some(pattern => lowerHref.includes(pattern))) {
    return false
  }

  // Parse and validate URL protocols
  try {
    const url = new URL(normalizedHref)
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']
    return allowedProtocols.includes(url.protocol)
  } catch {
    // If URL parsing fails, it might be a relative path without leading /
    // Be extra cautious and reject unless it's clearly safe
    // Only allow alphanumeric, dash, underscore, dot, and forward slash
    const safeRelativePattern = /^[a-zA-Z0-9\-_./]+$/
    return safeRelativePattern.test(normalizedHref)
  }
}

export function Comment({
  comment,
  onReply,
  onReplySubmit,
  onEdit,
  onDelete,
  currentUserId,
  className
}: CommentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)

  // Security fix: Only authenticated users can edit/delete their own comments
  // Anonymous comments cannot be edited/deleted
  const isAuthor = !!(currentUserId &&
    comment.user_id &&
    comment.user_id === currentUserId)

  const userName = comment.user_name || 'Anonymous'
  const userInitial = userName[0].toUpperCase()

  // Handle edit submission
  const handleEditSubmit = async (content: string) => {
    if (onEdit) {
      await onEdit(comment.id, content)
      setIsEditing(false)
    }
  }

  // Handle reply submission
  const handleReplySubmit = async (content: string) => {
    if (onReplySubmit) {
      try {
        await onReplySubmit(content, comment.id)
        setIsReplying(false)
      } catch (error) {
        console.error('Failed to submit reply:', error)
      }
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (onDelete && window.confirm('Are you sure you want to delete this comment?')) {
      await onDelete(comment.id)
    }
  }

  // Format date
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true
  })

  return (
    <article
      className={cn(
        'group relative',
        comment.is_deleted && 'opacity-60',
        className
      )}
      aria-label={`Comment by ${userName}`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={comment.user_avatar || undefined} alt={userName} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{userName}</span>
            {comment.user_id && (
              <Badge variant="secondary" className="text-xs">
                Member
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {timeAgo}
            </span>
            {comment.is_edited && !comment.is_deleted && (
              <span className="text-xs text-muted-foreground italic">
                (edited)
              </span>
            )}
          </div>

          {/* Comment body */}
          {isEditing ? (
            <CommentForm
              onSubmit={handleEditSubmit}
              onTyping={() => {}}
              onCancel={() => setIsEditing(false)}
              isAuthenticated={true}
              placeholder="Edit your comment..."
              autoFocus
              className="mt-2"
              initialContent={comment.content}
            />
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {comment.is_deleted ? (
                <p className="text-muted-foreground italic">
                  [This comment has been deleted]
                </p>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkBreaks]}
                  components={{
                    // Custom renderers for markdown elements
                    p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>,
                    a: ({ href, children }) => {
                      // Validate href to prevent XSS attacks
                      if (!isSafeHref(href)) {
                        // Render as non-clickable span for unsafe URLs
                        return (
                          <span className="text-muted-foreground" title="Unsafe link blocked">
                            {children}
                          </span>
                        )
                      }

                      // Normalize href for consistent handling
                      const normalizedHref = href?.trim() || ''

                      // Determine if link is external
                      const isHttpExternal = normalizedHref.startsWith('http://') || normalizedHref.startsWith('https://')
                      const isMailto = normalizedHref.startsWith('mailto:')
                      const isTel = normalizedHref.startsWith('tel:')
                      const isExternal = isHttpExternal || isMailto || isTel

                      // Build rel attribute for security
                      const relAttributes = []
                      if (isExternal) {
                        relAttributes.push('noopener') // Prevents window.opener access
                        relAttributes.push('noreferrer') // Prevents referrer leakage
                        relAttributes.push('nofollow') // Prevents SEO value transfer
                      }

                      return (
                        <a
                          href={normalizedHref}
                          // Only add target="_blank" for external http/https links
                          target={isHttpExternal ? "_blank" : undefined}
                          // Apply security attributes for all external links
                          rel={relAttributes.length > 0 ? relAttributes.join(' ') : undefined}
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          {children}
                        </a>
                      )
                    },
                    code: ({ children }) => {
                      const isInline = !String(children).includes('\n')
                      return isInline ? (
                        <code className="px-1 py-0.5 bg-muted rounded text-sm">
                          {children}
                        </code>
                      ) : (
                        <pre className="p-3 bg-muted rounded overflow-x-auto">
                          <code className="text-sm">{children}</code>
                        </pre>
                      )
                    },
                  }}
                >
                  {comment.content}
                </ReactMarkdown>
              )}
            </div>
          )}

          {/* Actions */}
          {!comment.is_deleted && !isEditing && (
            <CommentActions
              onReply={onReply ? () => setIsReplying(!isReplying) : undefined}
              onEdit={isAuthor && onEdit ? () => setIsEditing(true) : undefined}
              onDelete={isAuthor && onDelete ? handleDelete : undefined}
              onCancel={
                isEditing
                  ? () => setIsEditing(false)
                  : isReplying
                  ? () => setIsReplying(false)
                  : undefined
              }
            />
          )}

          {/* Reply form */}
          {isReplying && onReply && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReplySubmit}
                onTyping={() => {}}
                isAuthenticated={!!currentUserId}
                placeholder={`Reply to ${userName}...`}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}