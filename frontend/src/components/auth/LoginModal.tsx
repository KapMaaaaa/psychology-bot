import { Lock, Mail, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config'
import ModalShell from '../ui/ModalShell'
import { authTranslations, type AuthTheme, type Language } from './authTranslations'

type LoginModalProps = {
  lang: Language
  onClose: () => void
  onSuccess: (token: string, userId: number, username: string) => void
  onOpenRegister: () => void
  theme: AuthTheme
}

export default function LoginModal({
  lang,
  onClose,
  onSuccess,
  onOpenRegister,
  theme
}: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const t = authTranslations[lang]

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/url`)
      const data = await response.json()

      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2

      const popup = window.open(
        data.url,
        'Google Login',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      const checkPopup = setInterval(async () => {
        if (popup?.closed) {
          clearInterval(checkPopup)
          return
        }

        try {
          const url = popup?.location.href
          if (url?.includes('id_token=')) {
            const idToken = new URLSearchParams(url.split('#')[1]).get('id_token')
            if (idToken) {
              popup.close()
              clearInterval(checkPopup)

              const authResponse = await fetch(`${API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_token: idToken })
              })

              const authData = await authResponse.json()
              if (authResponse.ok) {
                onSuccess(authData.access_token, authData.user_id, authData.username)
                onClose()
              } else {
                setError(authData.detail || t.error)
              }
            }
          }
        } catch {
          // cross-origin until redirect
        }
      }, 500)

      window.addEventListener('message', async (event) => {
        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS' && event.data.id_token) {
          const authResponse = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: event.data.id_token })
          })

          const authData = await authResponse.json()
          if (authResponse.ok) {
            onSuccess(authData.access_token, authData.user_id, authData.username)
            onClose()
          } else {
            setError(authData.detail || t.error)
          }
        }
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.error)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      errors.email = t.emailInvalid
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
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || t.error)
      }

      onSuccess(data.access_token, data.user_id, data.username)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.error)
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
          {t.loginTitle}
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
          {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
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
            }}
            placeholder={t.password}
            required
            minLength={8}
            autoComplete="current-password"
            className={`w-full bg-white/5 border rounded-2xl px-12 py-4 outline-none transition-all focus:border-[var(--accent-color)] ${
              fieldErrors.password ? 'border-red-500' : 'border-[var(--border-color)]'
            }`}
            style={{ color: theme.colors.text }}
          />
          {fieldErrors.password && (
            <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
          )}
        </div>

        {error && <div className="text-red-400 text-sm text-center">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full text-white uppercase tracking-widest text-[10px] font-bold transition-all disabled:opacity-50"
          style={{ backgroundColor: theme.colors.accent }}
        >
          {loading ? t.loading : t.login}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: theme.colors.border }} />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span
              style={{
                color: theme.colors.textMuted,
                backgroundColor: theme.colors.cardBg,
                padding: '0 1rem'
              }}
            >
              {t.orSeparator}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 rounded-full border uppercase tracking-widest text-[10px] font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{
            borderColor: theme.colors.border,
            color: theme.colors.text,
            backgroundColor: 'transparent'
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {t.continueWithGoogle}
        </button>

        <button
          type="button"
          onClick={onOpenRegister}
          className="w-full text-center text-sm uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: theme.colors.textMuted }}
        >
          {t.switchToRegister}
        </button>
      </form>
    </ModalShell>
  )
}
