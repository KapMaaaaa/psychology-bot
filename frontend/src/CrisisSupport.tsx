import React, { useState } from 'react'
import { X, Heart, Calendar, Clock } from 'lucide-react'
import { API_BASE_URL } from './config'
import ModalShell from './components/ui/ModalShell'

type Language = 'ru' | 'kz' | 'en'

const translations = {
  ru: {
    title: "Мы здесь, чтобы помочь",
    subtitle: "Поговорите с реальным психологом",
    duration: "15 минут",
    price: "1 999 ₸",
    book: "Записаться на сессию",
    continueAi: "Продолжить с ИИ",
    loading: "Загрузка...",
    error: "Ошибка",
    scheduling: "Выберите удобное время",
    selectTime: "Выбрать время"
  },
  kz: {
    title: "Біз мұнда көмектесу үшін",
    subtitle: "Нағыз психологпен сөйлесіңіз",
    duration: "15 минут",
    price: "1 999 ₸",
    book: "Сессияға жазылу",
    continueAi: "Интеллектпен жалғастыру",
    loading: "Жүктелуде...",
    error: "Қате",
    scheduling: "Ыңғайлы уақытты таңдаңыз",
    selectTime: "Уақытты таңдау"
  },
  en: {
    title: "We're here to help",
    subtitle: "Talk to a real psychologist",
    duration: "15 minutes",
    price: "1 999 ₸",
    book: "Book Session",
    continueAi: "Continue with AI",
    loading: "Loading...",
    error: "Error",
    scheduling: "Choose a convenient time",
    selectTime: "Select Time"
  }
}

interface CrisisSupportProps {
  lang: Language
  onClose: () => void
  onContinue: () => void
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
}

export default function CrisisSupport({ lang, onClose, onContinue, theme, isAuthenticated }: CrisisSupportProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showScheduling, setShowScheduling] = useState(false)
  const t = translations[lang]

  const handleBookSession = async () => {
    if (!isAuthenticated) {
      setError("Please log in first")
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/crisis/session/create`, {
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
      setLoading(false)
    }
  }

  return (
    <ModalShell
      onClose={onClose}
      overlayClassName="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
      cardClassName="bg-[var(--card-bg)] border border-[var(--accent-color)] p-10 rounded-[3rem] w-full max-w-lg shadow-2xl"
      cardStyle={{
        backgroundColor: theme.colors.cardBg,
        borderColor: theme.colors.accent
      }}
    >
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart style={{ color: theme.colors.accent }} size={24} />
            <h3 className="font-serif text-2xl italic" style={{ color: theme.colors.text }}>
              {t.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
            style={{ color: theme.colors.textMuted }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 text-center">
          <p className="text-lg mb-4" style={{ color: theme.colors.textMuted }}>
            {t.subtitle}
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Clock size={18} style={{ color: theme.colors.accent }} />
              <span style={{ color: theme.colors.text }}>{t.duration}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: theme.colors.accent }}>
              {t.price}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center mb-4">{error}</div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleBookSession}
            disabled={loading || !isAuthenticated}
            className="w-full py-4 rounded-full text-white uppercase tracking-widest text-[10px] font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: theme.colors.accent }}
          >
            {loading ? t.loading : t.book}
          </button>
          <button
            onClick={onContinue}
            className="w-full py-3 text-center uppercase tracking-widest text-[10px] opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: theme.colors.textMuted }}
          >
            {t.continueAi}
          </button>
        </div>
    </ModalShell>
  )
}

