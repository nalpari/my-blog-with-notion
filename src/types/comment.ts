import { z } from 'zod'

// Validation schemas
export const createCommentSchema = z.object({
  postSlug: z.string().min(1),
  parentId: z.string().uuid().optional().nullable(),
  content: z.string().min(1).max(5000),
  userEmail: z.string().email().optional().nullable(),
  userName: z.string().min(1).max(100).optional().nullable(),
})

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
})

export const deleteCommentSchema = z.object({
  commentId: z.string().uuid(),
})

// Type exports
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>

// API Response types
export interface CommentResponse {
  success: boolean
  data?: unknown
  error?: string
  message?: string
}

import { CommentWithReplies } from '@/types/supabase'

export interface CommentsListResponse {
  comments: CommentWithReplies[]
  totalCount: number
  hasMore: boolean
  cursor?: string
}