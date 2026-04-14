import { motion } from 'framer-motion'
import { Calendar, CreditCard, Crown, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { API_BASE_URL } from './config'
import ModalShell from './components/ui/ModalShell'

type Language = 'ru' | 'kz' | 'en'

const translations = {
    ru: {
        accountSettings: "Настройки аккаунта",
        subscription: "Подписка",
        status: "Статус",
        active: "Активна",
        expired: "Истекла",
        cancelled: "Отменена",
        none: "Нет подписки",
        expiresAt: "Действует до",
        cancelSubscription: "Отменить подписку",
        cancelConfirm: "Подписка будет отменена в конце текущего периода",
        cancel: "Отменить",
        confirm: "Подтвердить",
        loading: "Загрузка...",
        error: "Ошибка",
        success: "Успешно",
        subscriptionCancelled: "Подписка будет отменена",
        manageSubscription: "Управление подпиской",
        subscribe: "Подписаться",
        subscribeNow: "Оформить подписку",
        reactivateSubscription: "Восстановить подписку",
        price: "399 ₸/месяц"
    },
    kz: {
        accountSettings: "Аккаунт параметрлері",
        subscription: "Жазылым",
        status: "Күйі",
        active: "Белсенді",
        expired: "Мерзімі өткен",
        cancelled: "Бас тартылған",
        none: "Жазылым жоқ",
        expiresAt: "Действует до",
        cancelSubscription: "Жазылымды тоқтату",
        cancelConfirm: "Жазылым ағымдағы кезеңнің соңында тоқтатылады",
        cancel: "Бас тарту",
        confirm: "Растау",
        loading: "Жүктелуде...",
        error: "Қате",
        success: "Сәтті",
        subscriptionCancelled: "Жазылым тоқтатылады",
        manageSubscription: "Жазылымды басқару",
        subscribe: "Жазылу",
        subscribeNow: "Жазылымды рәсімдеу",
        reactivateSubscription: "Жазылымды қалпына келтіру",
        price: "399 ₸/ай"
    },
    en: {
        accountSettings: "Account Settings",
        subscription: "Subscription",
        status: "Status",
        active: "Active",
        expired: "Expired",
        cancelled: "Cancelled",
        none: "No subscription",
        expiresAt: "Expires at",
        cancelSubscription: "Cancel Subscription",
        cancelConfirm: "Subscription will be cancelled at the end of current period",
        cancel: "Cancel",
        confirm: "Confirm",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        subscriptionCancelled: "Subscription will be cancelled",
        manageSubscription: "Manage Subscription",
        subscribe: "Subscribe",
        subscribeNow: "Get Subscription",
        reactivateSubscription: "Reactivate Subscription",
        price: "399 ₸/month"
    }
}

interface AccountSettingsProps {
    lang: Language
    onClose: () => void
    theme: {
        colors: {
            bg: string
            text: string
            textMuted: string
            accent: string
            border: string
            cardBg: string
        }
    }
    isAuthenticated: boolean
    onSubscriptionUpdate?: () => void
}

export default function AccountSettings({ lang, onClose, theme, isAuthenticated, onSubscriptionUpdate }: AccountSettingsProps) {
    const [subscriptionStatus, setSubscriptionStatus] = useState<{ status: string, expires_at: string | null } | null>(null)
    const [loading, setLoading] = useState(false)
    const [subscribeLoading, setSubscribeLoading] = useState(false)
    const [reactivateLoading, setReactivateLoading] = useState(false)
    const [error, setError] = useState('')
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)
    const t = translations[lang]

    useEffect(() => {
        if (isAuthenticated) {
            loadSubscriptionStatus()
        }
    }, [isAuthenticated])

    const loadSubscriptionStatus = async () => {
        if (!isAuthenticated) return
        try {
            const response = await fetch(`${API_BASE_URL}/subscription/status`, {
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                setSubscriptionStatus(data)
            }
        } catch (error) {
            console.error('Failed to load subscription status:', error)
        }
    }

    const handleSubscribe = async () => {
        if (!isAuthenticated) return

        setSubscribeLoading(true)
        setError('')

        try {
            const response = await fetch(`${API_BASE_URL}/subscription/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })

            const data = await response.json()

            if (response.ok && data.checkout_url) {
                window.location.href = data.checkout_url
            } else {
                setError(data.detail || t.error)
            }
        } catch (err: any) {
            setError(err.message || t.error)
        } finally {
            setSubscribeLoading(false)
        }
    }

    const handleReactivate = async () => {
        if (!isAuthenticated) return

        setReactivateLoading(true)
        setError('')

        try {
            const response = await fetch(`${API_BASE_URL}/subscription/reactivate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })

            const data = await response.json()

            if (response.ok) {
                if (data.requires_payment && data.checkout_url) {
                    // Need to go through checkout again
                    window.location.href = data.checkout_url
                } else {
                    // Reactivated successfully
                    await loadSubscriptionStatus()
                    if (onSubscriptionUpdate) {
                        onSubscriptionUpdate()
                    }
                }
            } else {
                setError(data.detail || t.error)
            }
        } catch (err: any) {
            setError(err.message || t.error)
        } finally {
            setReactivateLoading(false)
        }
    }

    const handleCancelSubscription = async () => {
        if (!isAuthenticated) return

        setLoading(true)
        setError('')

        try {
            const response = await fetch(`${API_BASE_URL}/subscription/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })

            const data = await response.json()

            if (response.ok) {
                setShowCancelConfirm(false)
                await loadSubscriptionStatus()
                if (onSubscriptionUpdate) {
                    onSubscriptionUpdate()
                }
            } else {
                setError(data.detail || t.error)
            }
        } catch (err: any) {
            setError(err.message || t.error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return '#10b981' // green
            case 'expired':
            case 'cancelled':
                return '#ef4444' // red
            default:
                return theme.colors.textMuted
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'kz' ? 'kk-KZ' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch {
            return dateString
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
                        {t.accountSettings}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                        style={{ color: theme.colors.textMuted }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Subscription Status */}
                    <div className="p-6 rounded-2xl border" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.cardBg }}>
                        <div className="flex items-center gap-3 mb-4">
                            <Crown style={{ color: theme.colors.accent }} size={24} />
                            <h4 className="font-serif text-lg" style={{ color: theme.colors.text }}>
                                {t.subscription}
                            </h4>
                        </div>

                        {subscriptionStatus && subscriptionStatus.status !== 'none' ? (
                            <>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm" style={{ color: theme.colors.textMuted }}>
                                        {t.status}:
                                    </span>
                                    <span
                                        className="text-sm font-bold uppercase"
                                        style={{ color: getStatusColor(subscriptionStatus.status) }}
                                    >
                                        {subscriptionStatus.status === 'active' ? t.active :
                                            subscriptionStatus.status === 'expired' ? t.expired :
                                                subscriptionStatus.status === 'cancelled' ? t.cancelled :
                                                    subscriptionStatus.status}
                                    </span>
                                </div>

                                {subscriptionStatus.expires_at && subscriptionStatus.status === 'active' && (
                                    <div className="flex items-center gap-2 mt-4">
                                        <Calendar size={16} style={{ color: theme.colors.textMuted }} />
                                        <span className="text-xs" style={{ color: theme.colors.textMuted }}>
                                            {t.expiresAt}: {formatDate(subscriptionStatus.expires_at)}
                                        </span>
                                    </div>
                                )}

                                {(subscriptionStatus.status === 'cancelled' || subscriptionStatus.status === 'expired') && (
                                    <button
                                        onClick={handleReactivate}
                                        disabled={reactivateLoading || !isAuthenticated}
                                        className="mt-4 w-full py-3 rounded-full uppercase tracking-widest text-[10px] font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        style={{ backgroundColor: theme.colors.accent }}
                                    >
                                        <CreditCard size={16} />
                                        {reactivateLoading ? t.loading : t.reactivateSubscription}
                                    </button>
                                )}

                                {subscriptionStatus.status === 'active' && (
                                    <button
                                        onClick={() => setShowCancelConfirm(true)}
                                        className="mt-4 w-full py-3 rounded-full border uppercase tracking-widest text-[10px] font-bold transition-all hover:opacity-80"
                                        style={{
                                            borderColor: '#ef4444',
                                            color: '#ef4444'
                                        }}
                                    >
                                        {t.cancelSubscription}
                                    </button>
                                )}
                            </>
                        ) : (
                            <div>
                                <p className="text-sm mb-4" style={{ color: theme.colors.textMuted }}>
                                    {t.none}
                                </p>
                                <button
                                    onClick={handleSubscribe}
                                    disabled={subscribeLoading || !isAuthenticated}
                                    className="w-full py-3 rounded-full uppercase tracking-widest text-[10px] font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    style={{ backgroundColor: theme.colors.accent }}
                                >
                                    <CreditCard size={16} />
                                    {subscribeLoading ? t.loading : t.subscribeNow}
                                </button>
                                <p className="text-xs mt-2 text-center" style={{ color: theme.colors.textMuted }}>
                                    {t.price}
                                </p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <p className="text-sm text-center" style={{ color: '#ef4444' }}>{error}</p>
                        </div>
                    )}

                    {/* Cancel Confirmation */}
                    {showCancelConfirm && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl border"
                            style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.cardBg }}
                        >
                            <p className="text-sm mb-4" style={{ color: theme.colors.text }}>
                                {t.cancelConfirm}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="flex-1 py-3 rounded-full border uppercase tracking-widest text-[10px] font-bold"
                                    style={{
                                        borderColor: theme.colors.border,
                                        color: theme.colors.textMuted
                                    }}
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={loading}
                                    className="flex-1 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold text-white transition-all disabled:opacity-50"
                                    style={{ backgroundColor: '#ef4444' }}
                                >
                                    {loading ? t.loading : t.confirm}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
        </ModalShell>
    )
}

