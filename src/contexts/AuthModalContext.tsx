'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthModalContextType {
  isOpen: boolean
  openAuthModal: (redirectTo?: string) => void
  closeAuthModal: () => void
  redirectTo?: string
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [redirectTo, setRedirectTo] = useState<string | undefined>()

  const openAuthModal = (redirectTo?: string) => {
    setRedirectTo(redirectTo)
    setIsOpen(true)
  }

  const closeAuthModal = () => {
    setIsOpen(false)
    setRedirectTo(undefined)
  }

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        openAuthModal,
        closeAuthModal,
        redirectTo,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider')
  }
  return context
}