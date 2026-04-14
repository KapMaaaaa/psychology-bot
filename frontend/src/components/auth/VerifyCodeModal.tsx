import { ArrowLeft, X } from 'lucide-react'
import React, { useState } from 'react'
import { API_BASE_URL } from '../../config'
import ModalShell from '../ui/ModalShell'
import { authTranslations, type AuthTheme, type Language } from './authTranslations'
import type { PendingRegistration } from './authTypes'
import { maskEmail } from './authUtils'

type VerifyCodeModalProps = {
  lang: Language
  theme: AuthTheme
  pending: PendingRegistration
  onClose: () => void
  onBack: () => void
  onSuccess: (token: string, userId: number, username: string) => void
}

export default function VerifyCodeModal({
  lang,
  theme,
  pending,
  onClose,
  onBack,
  onSuccess
}: VerifyCodeModalProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendHint, setResendHint] = useState('')

  const t = authTranslations[lang]

  const sendVerificationRequest = async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/send-verification-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: pending.email })
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(typeof data.detail === 'string' ? data.detail : t.error)
    }
  }

  const handleResend = async () => {
    setError('')
    setResendHint('')
    setResendLoading(true)
    try {
      await sendVerificationRequest()
      setResendHint(t.codeSent)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.error)
    } finally {
      setResendLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResendHint('')

    if (!verificationCode || verificationCode.length !== 6) {
      setError(t.codeRequired)
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: pending.email,
          username: pending.username,
          password: pending.password,
          password_confirm: pending.password_confirm,
          verification_code: verificationCode
        })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string' ? data.detail : t.error
        )
      }

      onSuccess(data.access_token, data.user_id, data.username)
      onClose()
    } catch (err: unknown) {
      if (
        err instanceof TypeError &&
        err.message.includes('fetch')
      ) {
        setError(
          `Не удалось подключиться к серверу (${API_BASE_URL}). Проверьте, что backend запущен.`
        )
      } else {
        setError(err instanceof Error ? err.message : t.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell
      onClose={onClose}
      cardStyle={{
        backgroundColor: theme.colors.cardBg,
        borderColor: theme.colors.border
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-full transition-colors -ml-2"
          style={{ color: theme.colors.textMuted }}
          aria-label={t.back}
        >
          <ArrowLeft size={22} />
        </button>
        <h3
          className="font-serif text-2xl italic flex-1 text-center pr-8"
          style={{ color: theme.colors.text }}
        >
          {t.verifyTitle}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
          style={{ color: theme.colors.textMuted }}
        >
          <X size={20} />
        </button>
      </div>

      <p className="text-sm text-center mb-2" style={{ color: theme.colors.textMuted }}>
        {maskEmail(pending.email)}
      </p>
      <p className="text-xs text-center mb-6" style={{ color: theme.colors.textMuted }}>
        {t.enterCode}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6)
              setVerificationCode(value)
            }}
            placeholder={t.verificationCode}
            required
            maxLength={6}
            autoComplete="one-time-code"
            className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 outline-none transition-all focus:border-[var(--accent-color)] text-center text-2xl tracking-widest"
            style={{ color: theme.colors.text }}
          />
        </div>

        {resendHint && (
          <div
            className="text-xs text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20"
            style={{ color: theme.colors.text }}
          >
            {resendHint}
          </div>
        )}

        {error && <div className="text-red-400 text-sm text-center">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full text-white uppercase tracking-widest text-[10px] font-bold transition-all disabled:opacity-50"
          style={{ backgroundColor: theme.colors.accent }}
        >
          {loading ? t.loading : t.completeRegistration}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendLoading || loading}
          className="w-full text-center text-sm uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity disabled:opacity-40"
          style={{ color: theme.colors.textMuted }}
        >
          {resendLoading ? t.loading : t.resendCode}
        </button>
      </form>
    </ModalShell>
  )
}
