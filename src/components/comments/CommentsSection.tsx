'use client'

import { useState } from 'react'
import { useComments } from '@/hooks/useComments'
import { useAuth } from '@/hooks/useAuth'
import { CommentForm } from './CommentForm'
import { CommentList } from './CommentList'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, MessageSquare, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/toast-provider'

interface CommentsSectionProps {
  postSlug: string
  postTitle: string
}

export function CommentsSection({ postSlug }: CommentsSectionProps) {
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal()
  const [replyToComment, setReplyToComment] = useState<{ id: string; userName: string } | null>(null)
  const { showToast } = useToast()

  const {
    comments,
    isLoading,
    error,
    hasMore,
    onlineCount,
    typingUsers,
    isRealtimeConnected,
    createComment,
    updateComment,
    deleteComment,
    sendTypingIndicator,
    loadMore,
    refresh
  } = useComments({
    postSlug,
    enableRealtime: true
  })

  // Handle comment submission
  const handleCommentSubmit = async (content: string, parentId?: string | null) => {
    if (!user && !parentId) {
      openAuthModal()
      return
    }

    try {
      await createComment(content, parentId)
      setReplyToComment(null)
      showToast('Comment posted successfully!', 'success')
    } catch (error) {
      console.error('Failed to create comment:', error)
      showToast('Failed to post comment. Please try again.', 'error')
    }
  }

  // Handle reply click
  const handleReply = (commentId: string, userName: string) => {
    if (!user) {
      openAuthModal()
      showToast('Please sign in to reply to comments', 'info')
      return
    }
    setReplyToComment({ id: commentId, userName })
  }

  // Handle cancel reply
  const handleCancelReply = () => {
    setReplyToComment(null)
  }

  // Calculate total comment count
  const totalComments = comments.reduce((count, comment) => {
    return count + 1 + (comment.replies?.length || 0)
  }, 0)

  return (
    <section className="mt-12 space-y-6" aria-label="Comments section">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Comments
            {totalComments > 0 && (
              <span className="text-muted-foreground">({totalComments})</span>
            )}
          </h2>

          {/* Online users and typing indicators */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {onlineCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{onlineCount} online</span>
              </div>
            )}

            {typingUsers.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="inline-flex gap-1">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse animation-delay-200">●</span>
                  <span className="animate-pulse animation-delay-400">●</span>
                </span>
                <span>
                  {typingUsers.slice(0, 2).join(', ')}
                  {typingUsers.length > 2 && ` and ${typingUsers.length - 2} more`}
                  {typingUsers.length === 1 ? ' is' : ' are'} typing...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Connection status */}
        {!isRealtimeConnected && (
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            <span>Live updates unavailable</span>
          </div>
        )}
      </div>

      {/* Comment form */}
      <div className="space-y-4">
        {replyToComment && (
          <Alert>
            <AlertDescription>
              Replying to <strong>{replyToComment.userName}</strong>
              <Button
                variant="link"
                size="sm"
                className="ml-2 h-auto p-0"
                onClick={handleCancelReply}
              >
                Cancel
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <CommentForm
          onSubmit={(content) => handleCommentSubmit(content, replyToComment?.id)}
          onTyping={sendTypingIndicator}
          isAuthenticated={!!user}
          isLoading={false}
          placeholder={
            replyToComment
              ? `Reply to ${replyToComment.userName}...`
              : user
              ? 'Write a comment...'
              : 'Sign in to comment...'
          }
        />
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || 'Failed to load comments'}
            <Button
              variant="link"
              size="sm"
              className="ml-2 h-auto p-0"
              onClick={refresh}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && comments.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments list */}
      {comments.length > 0 && (
        <CommentList
          comments={comments}
          onReply={handleReply}
          onReplySubmit={async (content: string, parentId: string) => {
            try {
              await createComment(content, parentId)
              showToast('Reply posted successfully!', 'success')
            } catch (error) {
              console.error('Failed to post reply:', error)
              showToast('Failed to post reply. Please try again.', 'error')
            }
          }}
          onEdit={async (id: string, content: string) => {
            try {
              await updateComment(id, content)
              showToast('Comment updated successfully!', 'success')
            } catch (error) {
              console.error('Failed to update comment:', error)
              showToast('Failed to update comment. Please try again.', 'error')
            }
          }}
          onDelete={async (id: string) => {
            try {
              await deleteComment(id)
              showToast('Comment deleted successfully!', 'success')
            } catch (error) {
              console.error('Failed to delete comment:', error)
              showToast('Failed to delete comment. Please try again.', 'error')
            }
          }}
          currentUserId={user?.id}
        />
      )}

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load more comments'}
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && comments.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      )}
    </section>
  )
}