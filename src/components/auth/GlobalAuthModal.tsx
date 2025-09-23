'use client'

import { useAuthModal } from '@/contexts/AuthModalContext'
import { AuthModal } from './AuthModal'
import { useToast } from '@/components/ui/toast-provider'

/**
 * Validate and sanitize redirect URL to prevent open redirect attacks
 * Only allows relative paths or same-origin URLs
 */
function isValidRedirect(url: string): boolean {
  // Allow relative paths starting with '/'
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true
  }

  // Parse and validate absolute URLs
  try {
    const parsedUrl = new URL(url, window.location.origin)
    // Only allow same-origin URLs
    return parsedUrl.origin === window.location.origin
  } catch {
    // Invalid URL format
    return false
  }
}

export function GlobalAuthModal() {
  const { isOpen, closeAuthModal, redirectTo } = useAuthModal()
  const { showToast } = useToast()

  const handleSuccess = () => {
    closeAuthModal()
    showToast('로그인되었습니다!', 'success')

    // Validate redirectTo before navigating
    if (redirectTo && isValidRedirect(redirectTo)) {
      window.location.href = redirectTo
    } else if (redirectTo) {
      // Log invalid redirect attempt for security monitoring
      console.warn('Invalid redirect attempt blocked:', redirectTo)
      // Redirect to safe default route
      window.location.href = '/'
    }
  }

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={closeAuthModal}
      onSuccess={handleSuccess}
    />
  )
}