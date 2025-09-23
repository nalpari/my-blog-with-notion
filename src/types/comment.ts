import { z } from 'zod'

// Validation schemas
export const createCommentSchema = z.object({
  postSlug: z.string().min(1),
  parentId: z.string().uuid().optional().nullable(),
  content: z.string().min(1).max(5000),
  userId: z.string().uuid().optional().nullable(),  // Use userId instead of email for PII security
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

// Error Response type for API errors
export interface ErrorResponse {
  message: string
  status?: number
  error?: string
  details?: unknown
}

// Type guard for ErrorResponse
export function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as ErrorResponse).message === 'string'
  )
}

// HTTP Error with status
export interface HttpError extends Error {
  status?: number
}

// Strongly typed fetch error class
export class FetchError extends Error {
  public readonly status: number
  public readonly statusText?: string

  constructor(message: string, status: number, statusText?: string) {
    super(message)
    this.name = 'FetchError'
    this.status = status
    this.statusText = statusText

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError)
    }
  }

  // Type guard for FetchError
  static isFetchError(error: unknown): error is FetchError {
    return error instanceof FetchError
  }
}

import { CommentWithReplies } from '@/types/supabase'

export interface CommentsListResponse {
  comments: CommentWithReplies[]
  totalCount: number
  hasMore: boolean
  cursor?: string
}