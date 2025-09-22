'use client'

import { Button } from '@/components/ui/button'
import { MessageSquare, Edit2, Trash2, X } from 'lucide-react'

interface CommentActionsProps {
  onReply?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onCancel?: () => void
}

export function CommentActions({
  onReply,
  onEdit,
  onDelete,
  onCancel
}: CommentActionsProps) {
  return (
    <div className="flex items-center gap-1 -ml-2">
      {onReply && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReply}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Reply
        </Button>
      )}

      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}

      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 px-2 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      )}

      {onCancel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      )}
    </div>
  )
}