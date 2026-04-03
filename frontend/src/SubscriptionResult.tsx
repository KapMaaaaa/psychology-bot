import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import React from 'react'
import ModalShell from './components/ui/ModalShell'

type Language = 'ru' | 'kz' | 'en'

const translations = {
    ru: {
        success: "Подписка активирована!",
        successMessage: "Спасибо за подписку! Теперь у вас есть доступ ко всем ботам.",
        cancel: "Оплата отменена",
        cancelMessage: "Вы отменили оформление подписки. Вы можете попробовать снова в любое время.",
        back: "Вернуться",
        goToSettings: "Настройки аккаунта"
    },
    kz: {
        success: "Жазылым белсенді!",
        successMessage: "Жазылымға рахмет! Енді сізде барлық боттарға қол жеткізу бар.",
        cancel: "Төлем бас тартылды",
        cancelMessage: "Сіз жазылымды рәсімдеуден бас тарттыңыз. Кез келген уақытта қайталап көре аласыз.",
        back: "Қайту",
        goToSettings: "Аккаунт параметрлері"
    },
    en: {
        success: "Subscription Activated!",
        successMessage: "Thank you for subscribing! You now have access to all bots.",
        cancel: "Payment Cancelled",
        cancelMessage: "You cancelled the subscription checkout. You can try again anytime.",
        back: "Go Back",
        goToSettings: "Account Settings"
    }
}

interface SubscriptionResultProps {
    lang: Language
    theme: any
    type: 'success' | 'cancel'
    onClose: () => void
    onGoToSettings?: () => void
}

export default function SubscriptionResult({ lang, theme, type, onClose, onGoToSettings }: SubscriptionResultProps) {
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

                <div className="flex gap-4 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-full border uppercase tracking-widest text-[10px] font-bold transition-all hover:opacity-80"
                        style={{
                            borderColor: theme.colors.border,
                            color: theme.colors.textMuted
                        }}
                    >
                        {t.back}
                    </button>

                    {type === 'success' && onGoToSettings && (
                        <button
                            onClick={onGoToSettings}
                            className="flex-1 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold text-white transition-all hover:opacity-80"
                            style={{ backgroundColor: theme.colors.accent }}
                        >
                            {t.goToSettings}
                        </button>
                    )}
                </div>
            </div>
        </ModalShell>
    )
}

