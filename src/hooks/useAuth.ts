'use client'

import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: Error | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const supabase = getSupabaseClient()

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error

        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          error: error as Error,
        })
      }
    }

    getSession()

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          error: null,
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUpWithEmail = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    if (error) throw error
    return data
  }

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // Google OAuth에 대한 추가 scope 설정
        ...(provider === 'google' && {
          scopes: 'https://www.googleapis.com/auth/userinfo.email'
        })
      },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    ...authState,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
  }
}