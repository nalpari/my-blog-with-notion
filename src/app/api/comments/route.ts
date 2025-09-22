import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCommentSchema } from '@/types/comment'
import { z } from 'zod'

// GET /api/comments - 댓글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postSlug = searchParams.get('post')
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor')

    if (!postSlug) {
      return NextResponse.json(
        { error: 'Post slug is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    let query = supabase
      .from('comments')
      .select('*')
      .eq('post_slug', postSlug)
      .or('is_deleted.is.null,is_deleted.eq.false')
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .limit(limit + 1)

    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    const { data: comments, error } = await query

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    const hasMore = comments && comments.length > limit
    const paginatedComments = hasMore ? comments.slice(0, -1) : comments

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      (paginatedComments || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select('*')
          .eq('parent_id', comment.id)
          .or('is_deleted.is.null,is_deleted.eq.false')
          .order('created_at', { ascending: true })

        return {
          ...comment,
          replies: replies || []
        }
      })
    )

    return NextResponse.json({
      comments: commentsWithReplies,
      hasMore,
      cursor: hasMore ? paginatedComments[paginatedComments.length - 1].created_at : null
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/comments - 댓글 작성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createCommentSchema.parse(body)

    const supabase = await createClient()

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser()

    const commentData = {
      post_slug: validatedData.postSlug,
      parent_id: validatedData.parentId || null,
      content: validatedData.content,
      user_id: user?.id || null,
      user_email: user?.email || validatedData.userEmail || null,
      user_name: user?.user_metadata?.name || validatedData.userName || 'Anonymous',
      user_avatar: user?.user_metadata?.avatar_url || null,
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert(commentData)
      .select()
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: comment,
      message: 'Comment created successfully'
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

// DELETE /api/comments - 댓글 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Get comment to verify ownership
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .single()

    if (fetchError || !comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if user can delete (owner or admin)
    const canDelete = user && (
      comment.user_id === user.id ||
      user.user_metadata?.role === 'admin'
    )

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this comment' },
        { status: 403 }
      )
    }

    // Helper function to recursively get all descendant comment IDs
    async function getAllDescendantIds(parentId: string): Promise<string[]> {
      const { data: children } = await supabase
        .from('comments')
        .select('id')
        .eq('parent_id', parentId)

      if (!children || children.length === 0) {
        return []
      }

      let allDescendantIds = children.map(c => c.id)

      // Recursively get descendants of each child
      for (const child of children) {
        const descendants = await getAllDescendantIds(child.id)
        allDescendantIds = allDescendantIds.concat(descendants)
      }

      return allDescendantIds
    }

    // Get all descendant comment IDs
    const descendantIds = await getAllDescendantIds(commentId)

    // Prepare all IDs to delete (parent + all descendants)
    const allIdsToDelete = [commentId, ...descendantIds]

    // Delete all comments in a single operation
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .in('id', allIdsToDelete)

    if (deleteError) {
      console.error('Error deleting comments:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete comment and its replies' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Comment and ${descendantIds.length} replies deleted successfully`,
      deletedCount: allIdsToDelete.length,
      deletedIds: allIdsToDelete
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}