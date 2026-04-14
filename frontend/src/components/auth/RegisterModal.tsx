import { Lock, Mail, User, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'
import ModalShell from '../ui/ModalShell'
import { authTranslations, type AuthTheme, type Language } from './authTranslations'
import type { PendingRegistration } from './authTypes'
import { validateEmail, validatePassword, validateUsername } from './authUtils'

type RegisterModalProps = {
  lang: Language
  theme: AuthTheme
  onClose: () => void
  onSwitchToLogin: () => void
  onCodeSent: (data: PendingRegistration) => void
  initialValues?: PendingRegistration | null
}

export default function RegisterModal({
  lang,
  theme,
  onClose,
  onSwitchToLogin,
  onCodeSent,
  initialValues
}: RegisterModalProps) {
  const [email, setEmail] = useState(initialValues?.email ?? '')
  const [username, setUsername] = useState(initialValues?.username ?? '')
  const [password, setPassword] = useState(initialValues?.password ?? '')
  const [passwordConfirm, setPasswordConfirm] = useState(
    initialValues?.password_confirm ?? ''
  )
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const t = authTranslations[lang]

  useEffect(() => {
    if (initialValues) {
      setEmail(initialValues.email)
      setUsername(initialValues.username)
      setPassword(initialValues.password)
      setPasswordConfirm(initialValues.password_confirm)
    }
  }, [initialValues])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!validateEmail(email)) {
      errors.email = t.emailInvalid
    }

    const usernameValidation = validateUsername(username, t)
    if (!usernameValidation.valid) {
      errors.username = usernameValidation.error || ''
    }

    const passwordValidation = validatePassword(password, t)
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error || ''
    }

    if (password !== passwordConfirm) {
      errors.passwordConfirm = t.passwordMismatch
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string' ? data.detail : t.error
        )
      }

      onCodeSent({
        email,
        username,
        password,
        password_confirm: passwordConfirm
      })
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-2xl italic" style={{ color: theme.colors.text }}>
          {t.registerTitle}
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail
            className="absolute left-4 top-1/2 -translate-y-1/2"
            size={18}
            style={{ color: theme.colors.textMuted }}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
            }}
            placeholder={t.email}
            required
            autoComplete="email"
            className={`w-full bg-white/5 border rounded-2xl px-12 py-4 outline-none transition-all focus:border-[var(--accent-color)] ${
              fieldErrors.email ? 'border-red-500' : 'border-[var(--border-color)]'
            }`}
            style={{ color: theme.colors.text }}
          />
          {fieldErrors.email && (
            <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
          )}
        </div>

        <div className="relative">
          <User
            className="absolute left-4 top-1/2 -translate-y-1/2"
            size={18}
            style={{ color: theme.colors.textMuted }}
          />
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: '' })
            }}
            placeholder={t.username}
            required
            autoComplete="username"
            className={`w-full bg-white/5 border rounded-2xl px-12 py-4 outline-none transition-all focus:border-[var(--accent-color)] ${
              fieldErrors.username ? 'border-red-500' : 'border-[var(--border-color)]'
            }`}
            style={{ color: theme.colors.text }}
          />
          {fieldErrors.username && (
            <p className="text-red-400 text-xs mt-1">{fieldErrors.username}</p>
          )}
        </div>

        <div className="relative">
          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2"
            size={18}
            style={{ color: theme.colors.textMuted }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' })
              if (fieldErrors.passwordConfirm && passwordConfirm) {
                setFieldErrors({ ...fieldErrors, passwordConfirm: '' })
              }
            }}
            placeholder={t.password}
            required
            minLength={8}
            autoComplete="new-password"
            className={`w-full bg-white/5 border rounded-2xl px-12 py-4 outline-none transition-all focus:border-[var(--accent-color)] ${
              fieldErrors.password ? 'border-red-500' : 'border-[var(--border-color)]'
            }`}
            style={{ color: theme.colors.text }}
          />
          {fieldErrors.password && (
            <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
          )}
        </div>

        <div className="relative">
          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2"
            size={18}
            style={{ color: theme.colors.textMuted }}
          />
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value)
              if (fieldErrors.passwordConfirm) {
                setFieldErrors({ ...fieldErrors, passwordConfirm: '' })
              }
            }}
            placeholder={t.passwordConfirm}
            required
            minLength={8}
            autoComplete="new-password"
            className={`w-full bg-white/5 border rounded-2xl px-12 py-4 outline-none transition-all focus:border-[var(--accent-color)] ${
              fieldErrors.passwordConfirm ? 'border-red-500' : 'border-[var(--border-color)]'
            }`}
            style={{ color: theme.colors.text }}
          />
          {fieldErrors.passwordConfirm && (
            <p className="text-red-400 text-xs mt-1">{fieldErrors.passwordConfirm}</p>
          )}
        </div>

        {error && <div className="text-red-400 text-sm text-center">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full text-white uppercase tracking-widest text-[10px] font-bold transition-all disabled:opacity-50"
          style={{ backgroundColor: theme.colors.accent }}
        >
          {loading ? t.loading : t.sendCode}
        </button>

        <p className="text-xs text-center leading-relaxed" style={{ color: theme.colors.textMuted }}>
          {t.legalNotice}{' '}
          <a
            href="/legal/privacy-policy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
            style={{ color: theme.colors.text }}
          >
            {t.privacyPolicy}
          </a>{' '}
          {lang === 'en' ? 'and' : lang === 'kz' ? 'және' : 'и'}{' '}
          <a
            href="/legal/terms-of-service.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
            style={{ color: theme.colors.text }}
          >
            {t.termsOfUse}
          </a>
          .
        </p>

        <button
          type="button"
          onClick={onSwitchToLogin}
          className="w-full text-center text-sm uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: theme.colors.textMuted }}
        >
          {t.switchToLogin}
        </button>
      </form>
    </ModalShell>
  )
}
