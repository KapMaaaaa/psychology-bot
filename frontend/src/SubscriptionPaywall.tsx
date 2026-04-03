import React, { useState } from 'react'
import { X, Crown, Check } from 'lucide-react'
import { API_BASE_URL } from './config'
import ModalShell from './components/ui/ModalShell'

type Language = 'ru' | 'kz' | 'en'

const translations = {
  ru: {
    title: "Разблокировать всех ботов",
    price: "399 ₸/месяц",
    features: [
      "Доступ ко всем ботам",
      "Сохранение истории чатов",
      "Приоритетная поддержка"
    ],
    subscribe: "Подписаться",
    cancel: "Отмена",
    loading: "Загрузка...",
    success: "Подписка активирована!",
    error: "Ошибка при создании подписки",
    required: "Требуется подписка",
    message: "Для продолжения общения необходима подписка",
    freeLimit: "Бесплатных сообщений осталось"
  },
  kz: {
    title: "Барлық боттарды ашу",
    price: "399 ₸/ай",
    features: [
      "Барлық боттарға қолжетімділік",
      "Чат тарихын сақтау",
      "Басымдықтық қолдау"
    ],
    subscribe: "Жазылу",
    cancel: "Бас тарту",
    loading: "Жүктелуде...",
    success: "Жазылым белсендірілді!",
    error: "Жазылым жасау кезінде қате",
    required: "Жазылым қажет",
    message: "Қосымша сөйлесу үшін жазылым қажет",
    freeLimit: "Тегін хабарламалар қалды"
  },
  en: {
    title: "Unlock All Bots",
    price: "399 ₸/month",
    features: [
      "Access to all bots",
      "Chat history saving",
      "Priority support"
    ],
    subscribe: "Subscribe",
    cancel: "Cancel",
    loading: "Loading...",
    success: "Subscription activated!",
    error: "Error creating subscription",
    required: "Subscription Required",
    message: "Subscription required to continue chatting",
    freeLimit: "Free messages remaining"
  }
}

interface SubscriptionPaywallProps {
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
  token: string | null
  messageCount?: number
  freeLimit?: number
}

export default function SubscriptionPaywall({
  lang,
  onClose,
  theme,
  token,
  messageCount,
  freeLimit = 5,
}: SubscriptionPaywallProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const t = translations[lang]

  const handleSubscribe = async () => {
    if (!token) {
      setError("Please log in first")
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/subscription/create`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
          <div className="flex items-center gap-3">
            <Crown style={{ color: theme.colors.accent }} size={24} />
            <h3 className="font-serif text-2xl italic" style={{ color: theme.colors.text }}>
              {t.required}
            </h3>
          </div>
          <button
            onClick={() => {
              if (messageCount !== undefined && messageCount >= freeLimit && token !== null) {
                return;
              }
              onClose();
            }}
            className="p-2 hover:bg-white/5 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: theme.colors.textMuted }}
            disabled={messageCount !== undefined && messageCount >= freeLimit && token !== null}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm mb-4 opacity-70" style={{ color: theme.colors.textMuted }}>
            {t.message}
          </p>
          {messageCount !== undefined && messageCount > 0 && (
            <p className="text-xs mb-4 opacity-50" style={{ color: theme.colors.textMuted }}>
              {t.freeLimit}: {Math.max(0, freeLimit - messageCount)}
            </p>
          )}
          <p className="text-3xl font-bold mb-2" style={{ color: theme.colors.text }}>
            {t.price}
          </p>
          <ul className="space-y-3 mt-4">
            {t.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <Check size={18} style={{ color: theme.colors.accent }} />
                <span style={{ color: theme.colors.textMuted }}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center mb-4">{error}</div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-center uppercase tracking-widest text-[10px] opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: theme.colors.textMuted }}
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubscribe}
            disabled={loading || !token}
            className="flex-1 py-4 rounded-full text-white uppercase tracking-widest text-[10px] font-bold transition-all disabled:opacity-50"
            style={{ backgroundColor: theme.colors.accent }}
          >
            {loading ? t.loading : t.subscribe}
          </button>
        </div>
    </ModalShell>
  )
}

