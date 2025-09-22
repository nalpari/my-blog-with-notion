'use client'

import { useAuthModal } from '@/contexts/AuthModalContext'
import { AuthModal } from './AuthModal'
import { useToast } from '@/components/ui/toast-provider'

export function GlobalAuthModal() {
  const { isOpen, closeAuthModal, redirectTo } = useAuthModal()
  const { showToast } = useToast()

  const handleSuccess = () => {
    closeAuthModal()
    showToast('로그인되었습니다!', 'success')

    // redirectTo가 있으면 해당 페이지로 이동
    if (redirectTo) {
      window.location.href = redirectTo
    }
  }

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={closeAuthModal}
      onSuccess={handleSuccess}
      redirectTo={redirectTo}
    />
  )
}