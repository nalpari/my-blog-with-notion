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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editContent, setEditContent] = useState(comment.content)
  const [isReplying, setIsReplying] = useState(false)

  const isAuthor = currentUserId && (
    comment.user_id === currentUserId ||
    comment.user_email === currentUserId
  )

  const userName = comment.user_name || 'Anonymous'
  const userInitial = userName[0].toUpperCase()

  // Handle edit submission
  const handleEditSubmit = async (content: string) => {
    if (onEdit) {
      await onEdit(comment.id, content)
      setIsEditing(false)
      setEditContent(content)
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
              isAuthenticated={true}
              placeholder="Edit your comment..."
              autoFocus
              className="mt-2"
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
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {children}
                      </a>
                    ),
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
                  ? () => {
                      setIsEditing(false)
                      setEditContent(comment.content)
                    }
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