import React, { useCallback, useState } from 'react'
import type { AuthTheme, Language } from './authTranslations'
import type { PendingRegistration } from './authTypes'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import VerifyCodeModal from './VerifyCodeModal'

type AuthFlowProps = {
  lang: Language
  onClose: () => void
  onSuccess: (token: string, userId: number, username: string) => void
  theme: AuthTheme
}

export default function AuthFlow({ lang, onClose, onSuccess, theme }: AuthFlowProps) {
  const [step, setStep] = useState<'login' | 'register' | 'verify'>('login')
  const [pending, setPending] = useState<PendingRegistration | null>(null)

  const resetFlow = useCallback(() => {
    setStep('login')
    setPending(null)
  }, [])

  const handleClose = useCallback(() => {
    resetFlow()
    onClose()
  }, [onClose, resetFlow])

  const handleOpenRegister = useCallback(() => {
    setPending(null)
    setStep('register')
  }, [])

  const handleSwitchToLogin = useCallback(() => {
    setPending(null)
    setStep('login')
  }, [])

  const handleCodeSent = useCallback((data: PendingRegistration) => {
    setPending(data)
    setStep('verify')
  }, [])

  const handleVerifyBack = useCallback(() => {
    setStep('register')
  }, [])

  if (step === 'verify' && pending) {
    return (
      <VerifyCodeModal
        lang={lang}
        theme={theme}
        pending={pending}
        onClose={handleClose}
        onBack={handleVerifyBack}
        onSuccess={onSuccess}
      />
    )
  }

  if (step === 'register') {
    return (
      <RegisterModal
        lang={lang}
        theme={theme}
        onClose={handleClose}
        onSwitchToLogin={handleSwitchToLogin}
        onCodeSent={handleCodeSent}
        initialValues={pending}
      />
    )
  }

  return (
    <LoginModal
      lang={lang}
      theme={theme}
      onClose={handleClose}
      onSuccess={onSuccess}
      onOpenRegister={handleOpenRegister}
    />
  )
}
