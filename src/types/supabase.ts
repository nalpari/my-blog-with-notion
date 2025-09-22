export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      comments: {
        Row: {
          id: string
          post_slug: string
          parent_id: string | null
          user_id: string | null
          user_email: string | null
          user_name: string | null
          user_avatar: string | null
          content: string
          is_edited: boolean
          is_deleted: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_slug: string
          parent_id?: string | null
          user_id?: string | null
          user_email?: string | null
          user_name?: string | null
          user_avatar?: string | null
          content: string
          is_edited?: boolean
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_slug?: string
          parent_id?: string | null
          user_id?: string | null
          user_email?: string | null
          user_name?: string | null
          user_avatar?: string | null
          content?: string
          is_edited?: boolean
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "comments"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for comments
export type Comment = Database['public']['Tables']['comments']['Row']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']
export type CommentUpdate = Database['public']['Tables']['comments']['Update']

// Extended comment type with nested replies
export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[]
  user?: {
    id: string
    email: string | null
    name: string | null
    avatar: string | null
  }
}