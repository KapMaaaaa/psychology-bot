import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import React from 'react'
import ModalShell from './components/ui/ModalShell'

type Language = 'ru' | 'kz' | 'en'

const translations = {
    ru: {
        success: "Сессия забронирована!",
        successMessage: "Спасибо за оплату! Ваша сессия с психологом запланирована. Мы свяжемся с вами в ближайшее время.",
        cancel: "Оплата отменена",
        cancelMessage: "Вы отменили оплату сессии. Вы можете попробовать снова в любое время.",
        back: "Вернуться"
    },
    kz: {
        success: "Сессия брондалды!",
        successMessage: "Төлемге рахмет! Психологпен сессияңыз жоспарланды. Біз сізбен жақын арада байланысамыз.",
        cancel: "Төлем бас тартылды",
        cancelMessage: "Сіз сессия төлемінен бас тарттыңыз. Кез келген уақытта қайталап көре аласыз.",
        back: "Қайту"
    },
    en: {
        success: "Session Booked!",
        successMessage: "Thank you for payment! Your session with a psychologist has been scheduled. We will contact you shortly.",
        cancel: "Payment Cancelled",
        cancelMessage: "You cancelled the session payment. You can try again anytime.",
        back: "Go Back"
    }
}

interface CrisisResultProps {
    lang: Language
    theme: any
    type: 'success' | 'cancel'
    onClose: () => void
}

export default function CrisisResult({ lang, theme, type, onClose }: CrisisResultProps) {
    const t = translations[lang]

    return (
        <ModalShell
            onClose={onClose}
            onOverlayClick={null}
            cardStyle={{
                backgroundColor: theme.colors.cardBg,
                borderColor: theme.colors.border
            }}
        >
            <div className="flex flex-col items-center text-center">
                {type === 'success' ? (
                    <CheckCircle size={64} className="mb-6" style={{ color: '#10b981' }} />
                ) : (
                    <XCircle size={64} className="mb-6" style={{ color: '#ef4444' }} />
                )}

                <h2 className="font-serif text-2xl mb-4" style={{ color: theme.colors.text }}>
                    {type === 'success' ? t.success : t.cancel}
                </h2>

                <p className="text-sm mb-8" style={{ color: theme.colors.textMuted }}>
                    {type === 'success' ? t.successMessage : t.cancelMessage}
                </p>

                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-full uppercase tracking-widest text-[10px] font-bold text-white transition-all hover:opacity-80"
                    style={{ backgroundColor: theme.colors.accent }}
                >
                    {t.back}
                </button>
            </div>
        </ModalShell>
    )
}

