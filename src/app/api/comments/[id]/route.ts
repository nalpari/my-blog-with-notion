import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateCommentSchema } from '@/types/comment'
import { z } from 'zod'

// Select only public columns, excluding PII like user_email
const publicColumns = `
  id,
  post_slug,
  parent_id,
  user_id,
  user_name,
  user_avatar,
  content,
  is_edited,
  is_deleted,
  created_at,
  updated_at
`

// Sanitize comment data to ensure no PII is exposed
function sanitizeComment(comment: any) {
  if (!comment) return null

  // Only return safe, public fields
  return {
    id: comment.id,
    post_slug: comment.post_slug,
    parent_id: comment.parent_id,
    user_id: comment.user_id,
    user_name: comment.user_name,
    user_avatar: comment.user_avatar,
    content: comment.content,
    is_edited: comment.is_edited,
    is_deleted: comment.is_deleted,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    // Explicitly exclude: user_email, deleted_at, and any other PII
  }
}

// PUT /api/comments/[id] - 댓글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateCommentSchema.parse(body)

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user owns the comment and it's not deleted
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id, is_deleted')  // PII Security: Only fetch user_id, not email
      .eq('id', id)
      .single()

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Security fix: Don't allow editing deleted comments
    if (existingComment.is_deleted) {
      return NextResponse.json(
        { error: 'Cannot edit deleted comment' },
        { status: 403 }
      )
    }

    // Security fix: Only allow modification if user_id matches
    // Anonymous comments (without user_id) cannot be edited
    const isOwner = existingComment.user_id && existingComment.user_id === user.id

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this comment' },
        { status: 403 }
      )
    }

    // Update comment (with additional safety check)
    const { data: updatedComment, error } = await supabase
      .from('comments')
      .update({
        content: validatedData.content,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .or('is_deleted.is.null,is_deleted.eq.false')  // Extra safety: ensure we're not updating deleted comments
      .select(publicColumns)
      .single()

    if (error) {
      console.error('Error updating comment:', error)
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: 500 }
      )
    }

    // Sanitize response to ensure no PII is exposed
    const sanitizedComment = sanitizeComment(updatedComment)

    return NextResponse.json({
      success: true,
      data: sanitizedComment,
      message: 'Comment updated successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/comments/[id] - 댓글 삭제 (soft delete)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user owns the comment and it's not already deleted
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id, user_email, is_deleted')
      .eq('id', id)
      .single()

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Security fix: Don't allow deleting already deleted comments
    if (existingComment.is_deleted) {
      return NextResponse.json(
        { error: 'Comment already deleted' },
        { status: 403 }
      )
    }

    // Security fix: Only allow deletion if user_id matches
    // Anonymous comments (without user_id) cannot be deleted
    const isOwner = existingComment.user_id && existingComment.user_id === user.id

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this comment' },
        { status: 403 }
      )
    }

    // Soft delete comment
    const { error } = await supabase
      .from('comments')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        content: '[This comment has been deleted]'
      })
      .eq('id', id)

    if (error) {
      console.error('Error deleting comment:', error)
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}