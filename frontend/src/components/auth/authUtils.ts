import type { AuthTranslation } from './authTranslations'

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePassword(
  pwd: string,
  t: Pick<
    AuthTranslation,
    'passwordTooShort' | 'passwordWeak'
  >
): { valid: boolean; error?: string } {
  if (pwd.length < 8) {
    return { valid: false, error: t.passwordTooShort }
  }
  if (!/[a-zA-Z]/.test(pwd) || !/[0-9]/.test(pwd)) {
    return { valid: false, error: t.passwordWeak }
  }
  return { valid: true }
}

export function validateUsername(
  uname: string,
  t: Pick<AuthTranslation, 'usernameTooShort' | 'usernameInvalid'>
): { valid: boolean; error?: string } {
  if (uname.length < 3) {
    return { valid: false, error: t.usernameTooShort }
  }
  if (!/^[a-zA-Z0-9]+$/.test(uname)) {
    return { valid: false, error: t.usernameInvalid }
  }
  return { valid: true }
}

/** e.g. ab***@domain.com */
export function maskEmail(email: string): string {
  const at = email.indexOf('@')
  if (at <= 0) return email
  const local = email.slice(0, at)
  const domain = email.slice(at)
  if (local.length <= 2) return `**${domain}`
  return `${local.slice(0, 2)}***${domain}`
}
