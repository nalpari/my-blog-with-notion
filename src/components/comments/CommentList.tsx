'use client'

import { CommentWithReplies } from '@/types/supabase'
import { Comment } from './Comment'
import { cn } from '@/lib/utils'

interface CommentListProps {
  comments: CommentWithReplies[]
  onReply?: (commentId: string, userName: string) => void
  onReplySubmit?: (content: string, parentId: string) => Promise<void>
  onEdit?: (commentId: string, content: string) => Promise<void>
  onDelete?: (commentId: string) => Promise<void>
  currentUserId?: string | null
  level?: number
  className?: string
}

export function CommentList({
  comments,
  onReply,
  onReplySubmit,
  onEdit,
  onDelete,
  currentUserId,
  level = 0,
  className
}: CommentListProps) {
  const maxNestingLevel = 3 // Maximum nesting level for replies

  return (
    <div
      className={cn(
        'space-y-4',
        level > 0 && 'ml-6 sm:ml-12 mt-4',
        className
      )}
      role="list"
      aria-label={level === 0 ? 'Comments' : 'Replies'}
    >
      {comments.map((comment) => (
        <div key={comment.id} role="listitem">
          <Comment
            comment={comment}
            onReply={level < maxNestingLevel ? onReply : undefined}
            onReplySubmit={onReplySubmit}
            onEdit={onEdit}
            onDelete={onDelete}
            currentUserId={currentUserId}
          />

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <CommentList
              comments={comment.replies}
              onReply={onReply}
              onReplySubmit={onReplySubmit}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={currentUserId}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  )
}