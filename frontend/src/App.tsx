import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ChevronUp,
  HelpCircle,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Plus,
  Send,
  Shield,
  Sparkles,
  Sun,
  User,
  X
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import AccountSettings from './AccountSettings'
import Auth from './Auth'
import CrisisResult from './CrisisResult'
import CrisisSupport from './CrisisSupport'
import SubscriptionResult from './SubscriptionResult'
import { API_BASE_URL } from './config'
import MarkdownRenderer from './MarkdownRenderer'

// --- Types & Data ---
type Language = 'ru' | 'kz' | 'en'

type Theme = {
  id: string
  name: string
  mode: 'light' | 'dark'
  colors: {
    bg: string
    bgGradient?: string
    text: string
    textMuted: string
    accent: string
    accentGlow: string
    border: string
    cardBg: string
    cardHover: string
  }
}

const translations = {
  ru: {
    title: "Be Heard.",
    landingSubtitle: "AI-наставники и спокойное пространство для разговора — в вашем темпе и без осуждения.",
    landingPrimaryCta: "Начать диалог",
    landingSecondaryCta: "Выбрать наставника",
    landingFeature1Title: "Персональные наставники",
    landingFeature1Text: "Выбирайте готовых персонажей или создавайте собственного наставника под ваш стиль общения.",
    landingFeature2Title: "История и прогресс",
    landingFeature2Text: "Сохраняйте чаты и возвращайтесь к важным инсайтам в любой момент.",
    landingFeature3Title: "Поддержка в кризисе",
    landingFeature3Text: "При необходимости можно перейти к сессии с реальным специалистом.",
    landingStatMentors: "наставников",
    landingStatFree: "сообщений для старта",
    landingStatLanguages: "языков интерфейса",
    navFeatures: "Возможности",
    navHow: "Как это работает",
    navTrust: "Безопасность",
    navFaq: "FAQ",
    navStart: "Начать",
    navMenu: "Меню",
    heroEyebrow: "Платформа эмоциональной поддержки",
    sectionFeaturesTitle: "Почему Be Heard",
    sectionHowTitle: "Как это работает?",
    sectionTrustTitle: "Конфиденциальность",
    sectionFaqTitle: "Частые вопросы",
    howStep1Title: "Выберите наставника",
    howStep1Text: "Готовые персонажи или собственный наставник под ваш стиль.",
    howStep2Title: "Пишите в своём темпе",
    howStep2Text: "Без давления: отвечайте, когда вам комфортно.",
    howStep3Title: "Сохраняйте историю",
    howStep3Text: "С аккаунтом чаты хранятся в облаке и доступны с любого устройства.",
    howStep4Title: "Человек рядом",
    howStep4Text: "При необходимости можно обсудить дополнительную поддержку со специалистом.",
    trust1Title: "Вы контролируете диалог",
    trust1Text: "Делитесь тем, что готовы раскрыть, в удобном формате.",
    trust2Title: "Гибкость",
    trust2Text: "Темы и глубина общения — на ваших условиях.",
    trust3Title: "Все функции в одном месте",
    trust3Text: "Чат, история и настройки профиля — в одном интерфейсе.",
    faq1Q: "Это замена психологу?",
    faq1A: "Нет. ИИ дополняет поддержку; в кризисе важна помощь специалиста.",
    faq2Q: "Нужен ли аккаунт?",
    faq2A: "Гостевой режим возможен; аккаунт сохраняет историю чатов между визитами.",
    faq3Q: "Где настройки профиля?",
    faq3A: "В правом верхнем углу после входа — иконка профиля и параметры.",
    faq4Q: "Какие языки интерфейса?",
    faq4A: "Русский, қазақша и English — переключатель вверху страницы.",
    footerTagline: "Be Heard — пространство для честного разговора.",
    footerExplore: "Разделы",
    footerContact: "Контакты",
    footerContactSoon: "Контактные данные — вскоре",
    footerLegal: "Информация",
    footerDisclaimer: "Сервис не заменяет экстренную медицинскую помощь.",
    footerCopyright: "© 2026 Be Heard",
    ctaTitle: "Готовы начать?",
    ctaSubtitle: "Выберите наставника и откройте диалог.",
    ctaButton: "К наставникам",
    backToTop: "Наверх",
    begin: "Начать путь",
    back: "Назад",
    selectMentor: "Выберите наставника",
    addCustom: "Добавить",
    online: "В сети",
    listening: "Слушаю",
    clear: "Очистить",
    placeholder: "Поделитесь мыслями...",
    thinking: "Думает...",
    newMentor: "Новый наставник",
    name: "Имя",
    desc: "Описание личности...",
    cancel: "Отмена",
    create: "Создать",
    deepSession: "Глубокая сессия",
    book: "Записаться к специалисту",
    continueAi: "Продолжить с ИИ",
    breathe: "Дышите",
    guestReminder: "Создайте аккаунт, чтобы сохранить историю чата",
    createAccount: "Создать аккаунт",
    dismiss: "Закрыть",
    myChats: "Мои чаты",
    subscriptionRequired: "Требуется подписка",
    subscriptionMessage: "Для продолжения общения необходима подписка",
    subscribeNow: "Подписаться",
    freeMessagesLimit: "Free messages remaining",
    viewChats: "Chat History",
    settings: "Settings",
    logout: "Logout",
    privacyPolicy: "Политика конфиденциальности",
    termsOfUse: "Пользовательское соглашение"
  },
  kz: {
    title: "Be Heard.",
    landingSubtitle: "AI-тәлімгерлер және сөйлесуге арналған тыныш кеңістік — өз қарқыңызбен, айыптаусыз.",
    landingPrimaryCta: "Диалогты бастау",
    landingSecondaryCta: "Тәлімгерді таңдау",
    landingFeature1Title: "Жеке тәлімгерлер",
    landingFeature1Text: "Дайын кейіпкерлерді таңдаңыз немесе өзіңізге сай тәлімгер жасаңыз.",
    landingFeature2Title: "Тарих және прогресс",
    landingFeature2Text: "Чаттарды сақтап, маңызды ойларға кез келген уақытта қайта оралыңыз.",
    landingFeature3Title: "Дағдарыс кезіндегі қолдау",
    landingFeature3Text: "Қажет болса, нақты маманмен сессияға ауыса аласыз.",
    landingStatMentors: "тәлімгер",
    landingStatFree: "бастапқы хабарлама",
    landingStatLanguages: "интерфейс тілі",
    navFeatures: "Мүмкіндіктер",
    navHow: "Қалай жұмыс істейді",
    navTrust: "Қауіпсіздік",
    navFaq: "FAQ",
    navStart: "Бастау",
    navMenu: "Мәзір",
    heroEyebrow: "Эмоциялық қолдау платформасы",
    sectionFeaturesTitle: "Неге Be Heard",
    sectionHowTitle: "Қалай жұмыс істейді",
    sectionTrustTitle: "Құпиялылық",
    sectionFaqTitle: "Жиі қойылатын сұрақтар",
    howStep1Title: "Тәлімгерді таңдаңыз",
    howStep1Text: "Дайын кейіпкерлер немесе өз стиліңізге сай тәлімгер.",
    howStep2Title: "Өз қарқыныңызбен жазыңыз",
    howStep2Text: "Қысымсыз: ыңғайлы уақытта жауап беріңіз.",
    howStep3Title: "Тарихты сақтаңыз",
    howStep3Text: "Аккаунтпен чаттар бұлтта сақталады.",
    howStep4Title: "Адам қасыңызда",
    howStep4Text: "Қажет болса — маманмен қосымша қолдау туралы сөйлесуге болады.",
    trust1Title: "Диалогты сіз басқарасыз",
    trust1Text: "Бөлісетініңізді өзіңіз шешесіз.",
    trust2Title: "Икемділік",
    trust2Text: "Тақырып пен тереңдік — сіздің шарттарыңызбен.",
    trust3Title: "Барлығы бір орында",
    trust3Text: "Чат, тарих және профиль баптаулары — бір интерфейсте.",
    faq1Q: "Бұл психологтың орнына ма?",
    faq1A: "Жоқ. AI қолдауды толықтырады; дағдарыста маман маңызды.",
    faq2Q: "Аккаунт керек пе?",
    faq2A: "Қонақ режимі бар; аккаунт чат тарихын сақтайды.",
    faq3Q: "Профиль баптаулары қайда?",
    faq3A: "Кіруден кейін оң жоғарғы бұрышта — профиль белгішесі.",
    faq4Q: "Қандай тілдер бар?",
    faq4A: "Орыс, қазақ және ағылшын — жоғарыдағы ауыстырғыш.",
    footerTagline: "Be Heard — шын сөйлесу орны.",
    footerExplore: "Бөлімдер",
    footerContact: "Байланыс",
    footerContactSoon: "Байланыс деректері жақында",
    footerLegal: "Ақпарат",
    footerDisclaimer: "Қызмет жедел медициналық көмектің орнын баспайды.",
    footerCopyright: "© 2026 Be Heard",
    ctaTitle: "Бастаймыз ба?",
    ctaSubtitle: "Тәлімгерді таңдап, диалогты ашыңыз.",
    ctaButton: "Тәлімгерлерге",
    backToTop: "Жоғарыға",
    begin: "Жолды бастау",
    back: "Артқа",
    selectMentor: "Тәлімгерді таңдаңыз",
    addCustom: "Қосу",
    online: "Желіде",
    listening: "Тыңдап тұрмын",
    clear: "Тазалау",
    placeholder: "Ойыңызбен бөлісіңіз...",
    thinking: "Ойлануда...",
    newMentor: "Жаңа тәлімгер",
    name: "Есімі",
    desc: "Тұлға сипаттамасы...",
    cancel: "Бас тарту",
    create: "Жасау",
    deepSession: "Терең сессия",
    book: "Маманға жазылу",
    continueAi: "Интеллектпен жалғастыру",
    breathe: "Дем алыңыз",
    guestReminder: "Чат тарихын сақтау үшін аккаунт жасаңыз",
    createAccount: "Аккаунт жасау",
    dismiss: "Жабу",
    myChats: "Менің чаттарым",
    subscriptionRequired: "Жазылым қажет",
    subscriptionMessage: "Қосымша сөйлесу үшін жазылым қажет",
    subscribeNow: "Жазылу",
    freeMessagesLimit: "Тегін хабарламалар қалды",
    viewChats: "Чат тарихы",
    settings: "Параметрлер",
    logout: "Шығу",
    privacyPolicy: "Құпиялылық саясаты",
    termsOfUse: "Пайдаланушы келісімі"
  },
  en: {
    title: "Be Heard.",
    landingSubtitle: "AI mentors and a calm space to talk—at your pace, without judgment.",
    landingPrimaryCta: "Start Chatting",
    landingSecondaryCta: "Choose a Mentor",
    landingFeature1Title: "Personal Mentors",
    landingFeature1Text: "Pick from ready personas or create your own mentor tailored to your style.",
    landingFeature2Title: "History and Progress",
    landingFeature2Text: "Keep your conversations and return to meaningful insights anytime.",
    landingFeature3Title: "Crisis Support",
    landingFeature3Text: "When needed, escalate to a real specialist session directly from the app.",
    landingStatMentors: "mentors",
    landingStatFree: "starter messages",
    landingStatLanguages: "interface languages",
    navFeatures: "Features",
    navHow: "How it works",
    navTrust: "Safety",
    navFaq: "FAQ",
    navStart: "Start",
    navMenu: "Menu",
    heroEyebrow: "A space for emotional support",
    sectionFeaturesTitle: "Why Be Heard",
    sectionHowTitle: "How it works",
    sectionTrustTitle: "Privacy",
    sectionFaqTitle: "FAQ",
    howStep1Title: "Pick a mentor",
    howStep1Text: "Choose a persona or build your own mentor.",
    howStep2Title: "Write at your pace",
    howStep2Text: "No pressure—reply when it feels right.",
    howStep3Title: "Keep your history",
    howStep3Text: "With an account, chats sync securely for return visits.",
    howStep4Title: "Human support",
    howStep4Text: "When you need it, you can explore options for speaking with a specialist.",
    trust1Title: "You steer the dialogue",
    trust1Text: "Share what you are ready to share, on your terms.",
    trust2Title: "Flexibility",
    trust2Text: "Topics and depth follow your needs.",
    trust3Title: "Everything in one place",
    trust3Text: "Chat, history, and profile settings live in one simple interface.",
    faq1Q: "Is this a replacement for therapy?",
    faq1A: "No. AI complements support; crises need professional help.",
    faq2Q: "Do I need an account?",
    faq2A: "You can try as a guest; an account saves your chat history across visits.",
    faq3Q: "Where are profile settings?",
    faq3A: "After sign-in, use the profile icon in the top-right corner.",
    faq4Q: "Which languages?",
    faq4A: "Russian, Kazakh, and English—use the switcher at the top.",
    footerTagline: "Be Heard — a place for honest conversation.",
    footerExplore: "Explore",
    footerContact: "Contact",
    footerContactSoon: "Contact details coming soon",
    footerLegal: "Legal",
    footerDisclaimer: "Not a substitute for emergency medical care.",
    footerCopyright: "© 2026 Be Heard",
    ctaTitle: "Ready to begin?",
    ctaSubtitle: "Choose a mentor and open the conversation.",
    ctaButton: "Go to mentors",
    backToTop: "Back to top",
    begin: "Begin Journey",
    back: "Back",
    selectMentor: "Choose a Mentor",
    addCustom: "Add Custom",
    online: "Online",
    listening: "Listening",
    clear: "Clear",
    placeholder: "Share your thoughts...",
    thinking: "Thinking...",
    newMentor: "New Mentor",
    name: "Name",
    desc: "Personality description...",
    cancel: "Cancel",
    create: "Create",
    deepSession: "Deep Session",
    book: "Book Specialist",
    continueAi: "Continue with AI",
    breathe: "Breathe",
    guestReminder: "Create an account to save your chat history",
    createAccount: "Create Account",
    dismiss: "Dismiss",
    myChats: "My Chats",
    subscriptionRequired: "Subscription Required",
    subscriptionMessage: "Subscription required to continue chatting",
    subscribeNow: "Subscribe Now",
    freeMessagesLimit: "Free messages remaining",
    viewChats: "Chat History",
    settings: "Settings",
    logout: "Log out",
    privacyPolicy: "Privacy Policy",
    termsOfUse: "Terms of Service"
  }
}

const themes: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    mode: 'light',
    colors: {
      bg: '#ffffff',
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      text: '#1e293b',
      textMuted: '#64748b',
      accent: '#3b82f6',
      accentGlow: 'rgba(59, 130, 246, 0.4)',
      border: 'rgba(0, 0, 0, 0.08)',
      cardBg: 'rgba(248, 250, 252, 0.6)',
      cardHover: 'rgba(241, 245, 249, 0.8)',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    mode: 'dark',
    colors: {
      bg: '#0a0a0a',
      bgGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      text: '#fafafa',
      textMuted: '#a3a3a3',
      accent: '#14b8a6',
      accentGlow: 'rgba(20, 184, 166, 0.6)',
      border: 'rgba(255, 255, 255, 0.1)',
      cardBg: 'rgba(255, 255, 255, 0.02)',
      cardHover: 'rgba(255, 255, 255, 0.04)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    mode: 'dark',
    colors: {
      bg: '#020617',
      bgGradient: 'linear-gradient(135deg, #020617 0%, #0c1a2e 100%)',
      text: '#f0f9ff',
      textMuted: '#bae6fd',
      accent: '#38bdf8',
      accentGlow: 'rgba(56, 189, 248, 0.6)',
      border: 'rgba(240, 249, 255, 0.1)',
      cardBg: 'rgba(255, 255, 255, 0.03)',
      cardHover: 'rgba(255, 255, 255, 0.06)',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    mode: 'dark',
    colors: {
      bg: '#0f0a15',
      bgGradient: 'linear-gradient(135deg, #0f0a15 0%, #1a0f25 100%)',
      text: '#faf5ff',
      textMuted: '#e9d5ff',
      accent: '#c084fc',
      accentGlow: 'rgba(192, 132, 252, 0.6)',
      border: 'rgba(250, 245, 255, 0.1)',
      cardBg: 'rgba(255, 255, 255, 0.03)',
      cardHover: 'rgba(255, 255, 255, 0.06)',
    },
  },
]

type Psychologist = {
  id: string
  name: string
  specialty: string
  image: string
  desc?: string
  character?: string
  initials?: string
  gradient?: string
  isCustom?: boolean
}

const DEFAULT_PSYCHOLOGISTS: Psychologist[] = [
  { id: 'conor', name: 'Конор Макгрегор', specialty: 'Мотивация', initials: 'КМ', gradient: 'from-orange-500 to-red-600', image: 'https://i.pinimg.com/1200x/47/b5/f1/47b5f127e6fb07577ff159288d6b20be.jpg' },
  { id: 'naruto', name: 'Обычный чел', specialty: 'Поддержка', initials: 'ОЧ', gradient: 'from-yellow-400 to-orange-500', image: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' },
  { id: 'ronaldo', name: 'Криштиану Роналду', specialty: 'Дисциплина', initials: 'КР', gradient: 'from-red-500 to-purple-600', image: 'https://i.pinimg.com/originals/5f/6d/e5/5f6de5b18f033fd2226ed07b9784b820.jpg' },
  { id: 'pro', name: 'Профессионал', specialty: 'Психология', initials: 'ПР', gradient: 'from-blue-400 to-indigo-600', image: 'https://i.pinimg.com/736x/62/d5/9e/62d59ed14cc28b96dff137ba84ea9b38.jpg' },
]

// User Menu Component
function UserMenu({ user, onChatsClick, onSettingsClick, onLogout, theme, t }: {
  user: { id: number, username: string },
  onChatsClick: () => void,
  onSettingsClick: () => void,
  onLogout: () => void,
  theme: Theme,
  t: any
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black/10 backdrop-blur-md flex items-center gap-2 rounded-full border border-[var(--border-color)] px-3 py-2 hover:bg-[var(--card-hover)] transition-all"
      >
        <User size={14} style={{ color: 'var(--text-muted)' }} />
        <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-color)' }}>
          {user.username}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full right-0 mt-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 min-w-[200px] overflow-hidden"
            style={{
              backgroundColor: theme.colors.cardBg,
              borderColor: theme.colors.border
            }}
          >
            <button
              onClick={() => { onChatsClick(); setIsOpen(false); }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--card-hover)] transition-colors text-left"
              style={{ color: 'var(--text-color)' }}
            >
              <MessageCircle size={16} />
              <span className="text-sm">{t.viewChats}</span>
            </button>
            <button
              onClick={() => { onSettingsClick(); setIsOpen(false); }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--card-hover)] transition-colors text-left"
              style={{ color: 'var(--text-color)' }}
            >
              <User size={16} />
              <span className="text-sm">{t.settings}</span>
            </button>
            <div className="h-px bg-[var(--border-color)]" />
            <button
              onClick={() => { onLogout(); setIsOpen(false); }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--card-hover)] transition-colors text-left"
              style={{ color: 'var(--text-color)' }}
            >
              <LogOut size={16} />
              <span className="text-sm">{t.logout}</span>
            </button>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<'landing' | 'selection' | 'chat'>('landing');
  const [lang, setLang] = useState<Language>('ru');
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.find(t => t.id === 'midnight') || themes[0]);
  const [psychs, setPsychs] = useState<Psychologist[]>([]);
  const [selectedPsych, setSelectedPsych] = useState<Psychologist | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [newAvatarPreview, setNewAvatarPreview] = useState('');
  const [newCharacter, setNewCharacter] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number, username: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showGuestReminder, setShowGuestReminder] = useState(false);
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{ status: string, expires_at: string | null } | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [userChats, setUserChats] = useState<Array<{ psych_id: string, last_message: string, message_count: number }>>([]);
  const [subscriptionResult, setSubscriptionResult] = useState<'success' | 'cancel' | null>(null);
  const [crisisResult, setCrisisResult] = useState<'success' | 'cancel' | null>(null);
  const [landingMenuOpen, setLandingMenuOpen] = useState(false);

  const t = translations[lang];
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    setLandingMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (view !== 'landing') setLandingMenuOpen(false);
  }, [view]);

  // Навигация с поддержкой истории браузера
  const navigateToView = (newView: 'landing' | 'selection' | 'chat', psychId?: string) => {
    setView(newView);
    // Обновляем URL без перезагрузки страницы
    const url = psychId ? `#${newView}/${psychId}` : `#${newView}`;
    window.history.pushState({ view: newView, psychId }, '', url);
  };

  // Обработка навигации назад/вперед
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        setView(event.state.view);
        if (event.state.psychId) {
          const psych = psychs.find(p => p.id === event.state.psychId);
          if (psych) {
            setSelectedPsych(psych);
          }
        } else if (event.state.view !== 'chat') {
          setSelectedPsych(null);
        }
      } else {
        // Если нет state, проверяем hash в URL
        const hash = window.location.hash.slice(1);
        if (hash === 'selection') {
          setView('selection');
          setSelectedPsych(null);
        } else if (hash === 'landing' || hash === '') {
          setView('landing');
          setSelectedPsych(null);
        } else if (hash.startsWith('chat/')) {
          const psychId = hash.split('/')[1];
          const psych = psychs.find(p => p.id === psychId);
          if (psych) {
            setView('chat');
            setSelectedPsych(psych);
          }
        }
      }
    };

    // Инициализация из URL при загрузке
    const hash = window.location.hash.slice(1);
    if (hash === 'selection') {
      setView('selection');
    } else if (hash.startsWith('chat/')) {
      const psychId = hash.split('/')[1];
      const psych = psychs.find(p => p.id === psychId);
      if (psych) {
        setView('chat');
        setSelectedPsych(psych);
      }
    } else {
      setView('landing');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [psychs]);

  const loadSubscriptionStatus = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  };

  const loadUserChats = async () => {
    if (!token) {
      setShowAuth(true);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/chat/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserChats(data.chats || []);
      } else if (response.status === 401) {
        // Token expired, try to get error details
        const errorData = await response.json().catch(() => ({}));
        console.error('Token expired or invalid:', errorData);
        // Don't auto-logout, just show error
        alert('Сессия истекла. Пожалуйста, войдите снова.');
        handleLogout();
      } else {
        console.error('Failed to load chats:', response.status, await response.text().catch(() => ''));
      }
    } catch (error) {
      console.error('Failed to load user chats:', error);
    }
  };

  useEffect(() => {
    if (selectedPsych) {
      // Если пользователь авторизован, загружаем историю из БД
      if (token && user) {
        loadChatHistory(selectedPsych.id);
      } else {
        // Иначе из localStorage
        const savedChat = localStorage.getItem(`chat_history_${selectedPsych.id}`);
        setMessages(savedChat ? JSON.parse(savedChat) : []);
      }
    }
  }, [selectedPsych, token, user]);

  const loadChatHistory = async (psychId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history?psych_id=${psychId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  // Load psychologists on mount
  useEffect(() => {
    const saved = localStorage.getItem('my_psychologists');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Psychologist[]
        setPsychs(
          parsed.map((p) => ({
            ...p,
            specialty: p.specialty ?? '',
            image: p.image ?? 'https://i.pinimg.com/736x/09/21/3d/09213d80309199aa75e8f6687d559400.jpg',
            character: p.character ?? '',
          }))
        )
      } catch (e) {
        setPsychs(DEFAULT_PSYCHOLOGISTS);
      }
    } else {
      setPsychs(DEFAULT_PSYCHOLOGISTS);
    }
  }, []);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Load subscription status
      loadSubscriptionStatus(savedToken);
    }
  }, []);

  // Check URL for subscription/crisis results on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;

    // Handle subscription results
    if (pathname === '/subscription/success') {
      const sessionId = urlParams.get('session_id');
      if (sessionId) {
        setSubscriptionResult('success');
        // Clean URL
        window.history.replaceState({}, '', '/');
        // Verify and create subscription if needed
        const savedToken = localStorage.getItem('auth_token') || token;
        if (savedToken) {
          // Verify session and create subscription
          fetch(`${API_BASE_URL}/subscription/verify?session_id=${sessionId}`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          }).then(() => {
            // Reload subscription status after verification
            loadSubscriptionStatus(savedToken);
          }).catch((error) => {
            console.error('Failed to verify subscription:', error);
            // Still reload status in case webhook already processed it
            loadSubscriptionStatus(savedToken);
          });
        }
      }
    } else if (pathname === '/subscription/cancel') {
      setSubscriptionResult('cancel');
      // Clean URL
      window.history.replaceState({}, '', '/');
    }

    // Handle crisis results
    if (pathname === '/crisis/success') {
      const sessionId = urlParams.get('session_id');
      if (sessionId) {
        setCrisisResult('success');
        // Clean URL
        window.history.replaceState({}, '', '/');
      }
    } else if (pathname === '/crisis/cancel') {
      setCrisisResult('cancel');
      // Clean URL
      window.history.replaceState({}, '', '/');
    }
  }, []); // Run only once on mount

  useEffect(() => {
    if (selectedPsych && messages.length > 0) {
      // Сохраняем в localStorage только если не авторизован
      if (!token) {
        localStorage.setItem(`chat_history_${selectedPsych.id}`, JSON.stringify(messages));
      }
      // Update message count
      const userMessages = messages.filter(m => m.role === 'user').length;
      setMessageCount(userMessages);
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, selectedPsych, token]);

  const handleToggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    const firstTheme = themes.find(t => t.mode === newMode);
    if (firstTheme) setCurrentTheme(firstTheme);
  };

  const handleClearChat = () => {
    setMessages([]);
    setMessageCount(0);
    if (!token && selectedPsych) {
      localStorage.removeItem(`chat_history_${selectedPsych.id}`);
    }
  };

  const handleAuthSuccess = (authToken: string, userId: number, username: string) => {
    setToken(authToken);
    setUser({ id: userId, username });
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('auth_user', JSON.stringify({ id: userId, username }));
    setShowGuestReminder(false);
    loadSubscriptionStatus(authToken);
    loadUserChats();
    // Перезагружаем историю чата из БД
    if (selectedPsych) {
      loadChatHistory(selectedPsych.id);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setMessages([]);
  };

  const addCustomPsych = () => {
    if (!newName || !newDesc) return;
    const finalAvatar = newAvatarPreview || newAvatar || 'https://i.pinimg.com/736x/09/21/3d/09213d80309199aa75e8f6687d559400.jpg';
    const newPsych = {
      id: `custom_${Date.now()}`,
      name: newName,
      specialty: newSpecialty || 'Personal Mentor',
      desc: newDesc,
      character: newCharacter,
      initials: newName.substring(0, 2).toUpperCase(),
      image: finalAvatar,
      isCustom: true
    };
    const newList = [...psychs, newPsych];
    setPsychs(newList);
    localStorage.setItem('my_psychologists', JSON.stringify(newList));
    setNewName('');
    setNewSpecialty('');
    setNewAvatar('');
    setNewAvatarPreview('');
    setNewCharacter('');
    setNewDesc('');
    setIsAdding(false);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewAvatarPreview(reader.result);
        setNewAvatar('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user' as const, content: input };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);
    setMessages((prev: { role: 'user' | 'bot', content: string }[]) => [...prev, { role: 'bot', content: '' }]);

    // Show guest reminder after first message if not logged in
    if (!token && !showGuestReminder && messages.length === 0) {
      setTimeout(() => setShowGuestReminder(true), 2000);
    }

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          history: updatedHistory,
          psych_id: selectedPsych?.id ?? 'psychologist',
          custom_desc: selectedPsych
            ? `${selectedPsych.desc ?? ''}\nХарактер: ${selectedPsych.character ?? ''}\nРоль: ${selectedPsych.specialty ?? ''}`.trim()
            : undefined,
          lang: lang // Передаем язык на бэкенд
        }),
      });

      // Проверяем статус 402 - требуется подписка
      if (response.status === 402) {
        const errorData = await response.json().catch(() => ({}));
        setMessages((prev: { role: 'user' | 'bot', content: string }[]) => [...prev.slice(0, -1)]);
        // Показываем предложение оформить подписку
        setShowAccountSettings(true);
        return;
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        let detail = errText.slice(0, 300);
        try {
          const j = JSON.parse(errText) as { detail?: unknown };
          if (j.detail !== undefined) {
            detail = typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail);
          }
        } catch {
          /* use raw */
        }
        setMessages((prev: { role: 'user' | 'bot', content: string }[]) => [
          ...prev.slice(0, -1),
          { role: 'bot', content: `Ошибка сервера (${response.status}). ${detail}` },
        ]);
        return;
      }

      if (!response.body) {
        setMessages((prev: { role: 'user' | 'bot', content: string }[]) => [...prev.slice(0, -1)]);
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      const pushBotText = (text: string) => {
        setMessages((prev: { role: 'user' | 'bot', content: string }[]) => {
          const newArr = [...prev];
          newArr[newArr.length - 1].content = text;
          return newArr;
        });
      };

      const revealChunk = async (chunkText: string) => {
        for (const ch of chunkText) {
          accumulatedText += ch;
          pushBotText(accumulatedText);
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        await revealChunk(chunk);
      }

      // Check if bot suggested psychologist (bot will say it in response)
      // Only show crisis support if bot explicitly mentions the session offer
      const crisisIndicators = [
        '1999',
        'сессия',
        'session',
        'профессиональный психолог',
        'professional psychologist',
        'реальному психологу',
        'психотерапевту',
        'real psychologist',
      ];
      const hasCrisisOffer = crisisIndicators.some(indicator =>
        accumulatedText.toLowerCase().includes(indicator.toLowerCase())
      );

      // Also check for explicit crisis language in bot's response
      const explicitCrisisPhrases = [
        'важно обратиться',
        'критической ситуации',
        'критическая ситуация',
        'important to seek',
        'critical situation'
      ];
      const hasExplicitCrisis = explicitCrisisPhrases.some(phrase =>
        accumulatedText.toLowerCase().includes(phrase.toLowerCase())
      );

      if (hasCrisisOffer && hasExplicitCrisis) {
        setTimeout(() => setShowCrisisSupport(true), 1500);
      }

    } catch (error) {
      setMessages((prev: { role: 'user' | 'bot', content: string }[]) => [...prev.slice(0, -1), { role: 'bot', content: 'Connection Error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className={`min-h-screen w-full flex flex-col items-center overflow-x-hidden relative transition-all duration-700 ease-in-out font-sans ${view === 'landing' ? 'justify-start overflow-y-auto' : 'justify-center'}`}
      style={{
        background: currentTheme.colors.bgGradient || currentTheme.colors.bg,
        ['--text-color' as string]: currentTheme.colors.text,
        ['--text-muted' as string]: currentTheme.colors.textMuted,
        ['--accent-color' as string]: currentTheme.colors.accent,
        ['--accent-glow' as string]: currentTheme.colors.accentGlow,
        ['--border-color' as string]: currentTheme.colors.border,
        ['--card-bg' as string]: currentTheme.colors.cardBg,
        ['--card-hover' as string]: currentTheme.colors.cardHover,
      } as React.CSSProperties & Record<string, string>}
    >
      {/* Controls: Mode & Language */}
      <div className="fixed top-[calc(0.75rem+env(safe-area-inset-top,0px))] left-[calc(0.75rem+env(safe-area-inset-left,0px))] sm:top-6 sm:left-6 z-50 flex items-center gap-2 sm:gap-3">
        <button onClick={handleToggleMode} className="bg-black/10 backdrop-blur-md p-2 sm:p-2.5 rounded-full border border-[var(--border-color)] text-[var(--text-color)]">
          {mode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <div className="bg-black/10 backdrop-blur-md flex rounded-full border border-[var(--border-color)] p-0.5 sm:p-1">
          {(['kz', 'ru', 'en'] as Language[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase transition-all ${lang === l ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--text-muted)]'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Auth & Theme Switcher - Top Right */}
      <div className="fixed top-[calc(0.75rem+env(safe-area-inset-top,0px))] right-[calc(0.75rem+env(safe-area-inset-right,0px))] sm:top-6 sm:right-6 z-50 flex items-center gap-2 sm:gap-3">
        {user ? (
          <div className="bg-black/10 backdrop-blur-md flex items-center gap-2 rounded-full border border-[var(--border-color)] px-3 py-2">
            <button
              onClick={() => { setShowChatHistory(true); loadUserChats(); }}
              className="p-1.5 hover:bg-white/5 rounded-full transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title={t.viewChats}
            >
              <MessageCircle size={16} />
            </button>
            <div className="w-px h-4 bg-[var(--border-color)]" />
            <button
              onClick={() => setShowAccountSettings(true)}
              className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded-full transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Настройки"
            >
              <User size={14} />
              <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-color)' }}>
                {user.username}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="p-1 hover:bg-white/5 rounded-full transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Выйти"
            >
              <LogOut size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="bg-black/10 backdrop-blur-md p-2.5 rounded-full border border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--card-hover)] transition-all"
            title="Войти"
          >
            <LogIn size={16} />
          </button>
        )}
        <div className="flex gap-1.5 sm:gap-2 bg-black/10 backdrop-blur-md p-1.5 sm:p-2 rounded-full border border-[var(--border-color)]">
          {themes.filter(th => th.mode === mode).map(th => (
            <button
              key={th.id}
              onClick={() => setCurrentTheme(th)}
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ${currentTheme.id === th.id ? 'border-white scale-125' : 'border-transparent'}`}
              style={{ backgroundColor: th.colors.accent }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full z-10"
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(3.5rem+env(safe-area-inset-top,0px))] pb-0">
              {/* Sticky landing navigation */}
              <nav
                className="sticky z-[35] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 mb-4 sm:mb-6 flex items-center justify-between gap-2 border-b border-[var(--border-color)] bg-[var(--card-bg)]/75 backdrop-blur-xl rounded-b-xl sm:rounded-b-2xl"
                style={{ top: 'calc(0.5rem + env(safe-area-inset-top, 0px))' }}
                aria-label="Landing"
              >
                <button
                  type="button"
                  onClick={() => scrollToSection('hero')}
                  className="font-serif text-base sm:text-lg italic tracking-tight shrink-0"
                  style={{ color: 'var(--text-color)' }}
                >
                  Be Heard
                </button>
                <div className="hidden lg:flex items-center gap-5 xl:gap-6">
                  {[
                    ['features', t.navFeatures],
                    ['how', t.navHow],
                    ['trust', t.navTrust],
                    ['faq', t.navFaq],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => scrollToSection(id)}
                      className="text-[9px] uppercase tracking-[0.18em] transition-opacity hover:opacity-100 opacity-70"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => { setLandingMenuOpen(false); navigateToView('selection'); }}
                    className="hidden sm:inline-flex px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    {t.navStart}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLandingMenuOpen((o) => !o)}
                    className="lg:hidden p-1.5 rounded-full border border-[var(--border-color)] bg-black/10"
                    style={{ color: 'var(--text-color)' }}
                    aria-expanded={landingMenuOpen}
                    aria-label={t.navMenu}
                  >
                    {landingMenuOpen ? <X size={16} /> : <Menu size={16} />}
                  </button>
                </div>
              </nav>
              {landingMenuOpen && (
                <div className="lg:hidden -mt-1 mb-5 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]/95 backdrop-blur-md p-3 flex flex-col gap-0.5">
                  {[
                    ['features', t.navFeatures],
                    ['how', t.navHow],
                    ['trust', t.navTrust],
                    ['faq', t.navFaq],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => scrollToSection(id)}
                      className="text-left py-2 px-2 rounded-lg text-xs uppercase tracking-wider"
                      style={{ color: 'var(--text-color)' }}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setLandingMenuOpen(false); navigateToView('selection'); }}
                    className="mt-1.5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.18em] text-white"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    {t.navStart}
                  </button>
                </div>
              )}

              {/* Hero */}
              <section id="hero" className="scroll-mt-24 sm:scroll-mt-28 pb-12 sm:pb-16 md:pb-20">
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.28em] mb-4 sm:mb-5" style={{ color: 'var(--accent-color)' }}>
                  {t.heroEyebrow}
                </p>
                <h1
                  className="font-serif italic tracking-tighter leading-[0.95] mb-4 sm:mb-6 max-w-[min(100%,20ch)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                  style={{ color: 'var(--text-color)' }}
                >
                  {t.title}
                </h1>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mb-6 sm:mb-8 font-light" style={{ color: 'var(--text-muted)' }}>
                  {t.landingSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-10 sm:mb-12">
                  <button
                    type="button"
                    onClick={() => navigateToView('selection')}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-white uppercase tracking-[0.2em] text-[10px] font-bold transition-all hover:opacity-90 shadow-md shadow-black/15"
                    style={{ backgroundColor: 'var(--accent-color)', boxShadow: `0 12px 32px -12px var(--accent-glow)` }}
                  >
                    {t.landingPrimaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('features')}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full border border-[var(--border-color)] text-[var(--text-muted)] uppercase tracking-[0.2em] text-[10px] hover:bg-[var(--card-hover)] transition-all"
                  >
                    {t.landingSecondaryCta}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl">
                  {[
                    [String(psychs.length), t.landingStatMentors],
                    ['5', t.landingStatFree],
                    ['3', t.landingStatLanguages],
                  ].map(([val, lab], i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 sm:p-5 min-h-[88px] sm:min-h-[96px] flex flex-col justify-center"
                    >
                      <p className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1" style={{ color: 'var(--text-color)' }}>
                        {val}
                      </p>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] leading-snug" style={{ color: 'var(--text-muted)' }}>
                        {lab}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Features */}
              <section id="features" className="scroll-mt-24 sm:scroll-mt-28 py-12 sm:py-16 md:py-20 border-t border-[var(--border-color)]">
                <div className="flex items-end gap-2.5 mb-6 sm:mb-8">
                  <Sparkles className="shrink-0 w-6 h-6 sm:w-7 sm:h-7" style={{ color: 'var(--accent-color)' }} aria-hidden />
                  <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl italic tracking-tight" style={{ color: 'var(--text-color)' }}>
                    {t.sectionFeaturesTitle}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                  {[
                    [t.landingFeature1Title, t.landingFeature1Text],
                    [t.landingFeature2Title, t.landingFeature2Text],
                    [t.landingFeature3Title, t.landingFeature3Text],
                  ].map(([title, text], i) => (
                    <div
                      key={i}
                      className="rounded-xl sm:rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 sm:p-6 min-h-[180px] sm:min-h-[200px] flex flex-col justify-center"
                    >
                      <h3 className="font-serif text-lg sm:text-xl italic mb-2 sm:mb-3" style={{ color: 'var(--text-color)' }}>
                        {title}
                      </h3>
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* How it works */}
              <section id="how" className="scroll-mt-24 sm:scroll-mt-28 py-12 sm:py-16 md:py-20 border-t border-[var(--border-color)]">
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl italic mb-8 sm:mb-10 md:mb-12 tracking-tight" style={{ color: 'var(--text-color)' }}>
                  {t.sectionHowTitle}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  {[
                    ['1', t.howStep1Title, t.howStep1Text],
                    ['2', t.howStep2Title, t.howStep2Text],
                    ['3', t.howStep3Title, t.howStep3Text],
                    ['4', t.howStep4Title, t.howStep4Text],
                  ].map(([num, title, text]) => (
                    <div key={num} className="flex gap-3 sm:gap-4">
                      <span
                        className="font-serif text-3xl sm:text-4xl italic opacity-30 shrink-0 leading-none pt-0.5"
                        style={{ color: 'var(--accent-color)' }}
                      >
                        {num}
                      </span>
                      <div>
                        <h3 className="font-serif text-base sm:text-lg italic mb-1.5" style={{ color: 'var(--text-color)' }}>
                          {title}
                        </h3>
                        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Trust */}
              <section id="trust" className="scroll-mt-24 sm:scroll-mt-28 py-12 sm:py-16 md:py-20 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-2.5 mb-6 sm:mb-8">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" style={{ color: 'var(--accent-color)' }} aria-hidden />
                  <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl italic tracking-tight" style={{ color: 'var(--text-color)' }}>
                    {t.sectionTrustTitle}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                  {[
                    [t.trust1Title, t.trust1Text],
                    [t.trust2Title, t.trust2Text],
                    [t.trust3Title, t.trust3Text],
                  ].map(([title, text], i) => (
                    <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]/80 p-4 sm:p-5">
                      <h3 className="font-serif text-sm sm:text-base italic mb-1.5" style={{ color: 'var(--text-color)' }}>{title}</h3>
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{text}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ */}
              <section id="faq" className="scroll-mt-24 sm:scroll-mt-28 py-12 sm:py-16 md:py-20 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-2.5 mb-6 sm:mb-8">
                  <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" style={{ color: 'var(--accent-color)' }} aria-hidden />
                  <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl italic tracking-tight" style={{ color: 'var(--text-color)' }}>
                    {t.sectionFaqTitle}
                  </h2>
                </div>
                <div className="max-w-2xl space-y-5 sm:space-y-6">
                  {[
                    [t.faq1Q, t.faq1A],
                    [t.faq2Q, t.faq2A],
                    [t.faq3Q, t.faq3A],
                    [t.faq4Q, t.faq4A],
                  ].map(([q, a], i) => (
                    <div key={i} className="border-b border-[var(--border-color)] pb-5 last:border-0">
                      <p className="font-serif text-sm sm:text-base italic mb-1.5" style={{ color: 'var(--text-color)' }}>{q}</p>
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{a}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <section id="cta" className="scroll-mt-24 sm:scroll-mt-28 py-12 sm:py-16 md:py-20 mb-6 border-t border-[var(--border-color)]">
                <div className="rounded-2xl sm:rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] px-5 sm:px-8 py-10 sm:py-12 md:py-14 text-center max-w-2xl mx-auto">
                  <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl italic mb-3 sm:mb-4" style={{ color: 'var(--text-color)' }}>{t.ctaTitle}</h2>
                  <p className="text-sm sm:text-base mb-6 sm:mb-7 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>{t.ctaSubtitle}</p>
                  <button
                    type="button"
                    onClick={() => navigateToView('selection')}
                    className="px-7 sm:px-9 py-2.5 sm:py-3 rounded-full text-white uppercase tracking-[0.2em] text-[10px] font-bold"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    {t.ctaButton}
                  </button>
                </div>
              </section>

              {/* Site footer */}
              <footer className="border-t border-[var(--border-color)] pt-10 sm:pt-12 pb-20 sm:pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mb-10">
                  <div className="lg:col-span-2">
                    <p className="font-serif text-xl sm:text-2xl italic mb-2" style={{ color: 'var(--text-color)' }}>Be Heard</p>
                    <p className="text-xs sm:text-sm max-w-md leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t.footerTagline}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--text-muted)' }}>{t.footerExplore}</p>
                    <ul className="space-y-1.5">
                      {[
                        ['features', t.navFeatures],
                        ['how', t.navHow],
                        ['trust', t.navTrust],
                        ['faq', t.navFaq],
                      ].map(([id, lab]) => (
                        <li key={id}>
                          <button type="button" onClick={() => scrollToSection(id)} className="text-xs hover:opacity-100 opacity-80 transition-opacity" style={{ color: 'var(--text-color)' }}>
                            {lab}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--text-muted)' }}>{t.footerContact}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t.footerContactSoon}</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] mt-5 mb-1" style={{ color: 'var(--text-muted)' }}>{t.footerLegal}</p>
                    <div className="flex flex-col gap-1">
                      <a
                        href="/legal/privacy-policy.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] leading-relaxed opacity-90 hover:opacity-100 underline"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {t.privacyPolicy}
                      </a>
                      <a
                        href="/legal/terms-of-service.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] leading-relaxed opacity-90 hover:opacity-100 underline"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {t.termsOfUse}
                      </a>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-80" style={{ color: 'var(--text-muted)' }}>{t.footerDisclaimer}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-[var(--border-color)]">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] opacity-60" style={{ color: 'var(--text-muted)' }}>
                    {t.footerCopyright}
                  </p>
                  <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-[var(--border-color)] hover:bg-[var(--card-hover)] transition-colors"
                    style={{ color: 'var(--text-color)' }}
                  >
                    <ChevronUp size={14} /> {t.backToTop}
                  </button>
                </div>
                <p className="text-center mt-8 text-[8px] sm:text-[9px] uppercase tracking-[0.4em] opacity-25 pointer-events-none" style={{ color: 'var(--text-color)' }}>
                  {t.breathe}
                </p>
              </footer>
            </div>
          </motion.div>
        )}

        {view === 'selection' && (
          <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-6xl px-4 sm:px-6 z-10 pt-[calc(4rem+env(safe-area-inset-top,0px))] sm:pt-0">
            <div className="flex items-center justify-between mb-8 sm:mb-12">
              <button onClick={() => navigateToView('landing')} className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] uppercase tracking-widest"><ArrowLeft size={14} /> {t.back}</button>
              <h2 className="font-serif text-xl sm:text-3xl italic text-center px-2" style={{ color: 'var(--text-color)' }}>{t.selectMentor}</h2>
              <div className="w-6 sm:w-10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {psychs.map((p: Psychologist) => (
                <div
                  key={p.id}
                  onClick={() => { setSelectedPsych(p); navigateToView('chat', p.id); }}
                  className="relative p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--card-bg)] hover:scale-[1.02] transition-all cursor-pointer group flex flex-col items-center"
                >
                  <img src={p.image} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mb-4 sm:mb-6 border-4 border-[var(--border-color)]" alt="" />
                  <h3 className="font-serif text-lg sm:text-xl text-center" style={{ color: 'var(--text-color)' }}>{p.name}</h3>
                  <p className="text-[9px] uppercase tracking-widest mt-2" style={{ color: 'var(--text-muted)' }}>{p.specialty}</p>
                </div>
              ))}
              <button onClick={() => setIsAdding(true)} className="border-2 border-dashed border-[var(--border-color)] rounded-[2rem] sm:rounded-[2.5rem] flex flex-col items-center justify-center p-6 sm:p-8 hover:bg-[var(--card-hover)] transition-all">
                <Plus style={{ color: 'var(--text-muted)' }} />
                <span className="text-[10px] uppercase tracking-widest mt-4" style={{ color: 'var(--text-muted)' }}>{t.addCustom}</span>
              </button>
            </div>
          </motion.div>
        )}

        {view === 'chat' && (
          <motion.div key="chat" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl h-[100dvh] sm:h-[85vh] flex flex-col rounded-none sm:rounded-[3rem] border-0 sm:border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-xl overflow-hidden shadow-none sm:shadow-2xl z-10">
            <div className="p-4 sm:p-6 border-b border-[var(--border-color)] flex items-center justify-between pt-[calc(4rem+env(safe-area-inset-top,0px))] sm:pt-6">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <button onClick={() => navigateToView('selection')} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[var(--text-color)]"><ArrowLeft size={18} /></button>
                <img src={selectedPsych?.image} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover" alt="" />
                <div>
                  <h4 className="font-serif italic text-base sm:text-lg leading-tight line-clamp-1" style={{ color: 'var(--text-color)' }}>{selectedPsych?.name}</h4>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-[8px] uppercase tracking-tighter opacity-50" style={{ color: 'var(--text-color)' }}>{t.listening}</span></div>
                </div>
              </div>
              <button onClick={handleClearChat} className="text-[8px] uppercase tracking-widest opacity-40 hover:opacity-100" style={{ color: 'var(--text-color)' }}>{t.clear}</button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-6">
              {messages.map((m: { role: 'user' | 'bot', content: string }, i: number) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] sm:max-w-[85%] px-4 sm:px-6 py-3 sm:py-4 rounded-[1.5rem] sm:rounded-[2rem] text-sm leading-relaxed ${m.role === 'user'
                    ? 'bg-[var(--accent-color)] text-white shadow-lg'
                    : 'bg-[var(--card-hover)] border border-[var(--border-color)]'
                    }`} style={{ color: m.role === 'user' ? '#fff' : 'var(--text-color)' }}>
                    {m.role === 'bot' ? (
                      <MarkdownRenderer 
                        content={m.content} 
                        style={{ color: 'inherit' }}
                      />
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && <div className="text-[10px] animate-pulse uppercase tracking-widest opacity-30" style={{ color: 'var(--text-color)' }}>{t.thinking}</div>}
            </div>

            <div className="p-4 sm:p-6 bg-black/5">
              {(subscriptionStatus?.status !== 'active' && messageCount >= 5 && !!token) && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-center" style={{ color: 'var(--text-color)' }}>
                    {t.subscriptionRequired}. {t.subscriptionMessage}
                  </p>
                </div>
              )}
              <div className="relative flex items-end gap-2 bg-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-1.5 sm:p-2 border border-[var(--border-color)] focus-within:border-[var(--accent-color)] transition-all">
                <textarea
                  value={input} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder={t.placeholder}
                  className="chat-composer-textarea flex-1 bg-transparent border-none px-4 sm:px-6 py-3 sm:py-4 outline-none text-sm resize-none disabled:opacity-50 rounded-[1.5rem] sm:rounded-[2rem] overflow-x-hidden overflow-y-auto"
                  style={{ color: 'var(--text-color)' }}
                  disabled={subscriptionStatus?.status !== 'active' && messageCount >= 5 && !!token}
                />
                <button
                  onClick={handleSend}
                  className="p-3 sm:p-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}
                  disabled={subscriptionStatus?.status !== 'active' && messageCount >= 5 && !!token}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showAuth && (
          <Auth
            lang={lang}
            onClose={() => setShowAuth(false)}
            onSuccess={handleAuthSuccess}
            theme={currentTheme}
          />
        )}


        {showCrisisSupport && (
          <CrisisSupport
            lang={lang}
            onClose={() => setShowCrisisSupport(false)}
            onContinue={() => setShowCrisisSupport(false)}
            theme={currentTheme}
            token={token}
          />
        )}

        {subscriptionResult && (
          <SubscriptionResult
            lang={lang}
            theme={currentTheme}
            type={subscriptionResult}
            onClose={() => {
              setSubscriptionResult(null);
              if (subscriptionResult === 'success' && token) {
                loadSubscriptionStatus(token);
              }
            }}
            onGoToSettings={() => {
              setSubscriptionResult(null);
              setShowAccountSettings(true);
            }}
          />
        )}

        {crisisResult && (
          <CrisisResult
            lang={lang}
            theme={currentTheme}
            type={crisisResult}
            onClose={() => setCrisisResult(null)}
          />
        )}

        {showAccountSettings && (
          <AccountSettings
            lang={lang}
            onClose={() => setShowAccountSettings(false)}
            theme={currentTheme}
            token={token}
            onSubscriptionUpdate={() => {
              if (token) {
                loadSubscriptionStatus(token);
              }
            }}
          />
        )}

        {showChatHistory && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-6"
            onClick={() => setShowChatHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 sm:p-10 rounded-[1.75rem] sm:rounded-[3rem] w-full max-w-2xl shadow-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl sm:text-2xl italic" style={{ color: 'var(--text-color)' }}>{t.myChats}</h3>
                <button
                  onClick={() => setShowChatHistory(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>
              {userChats.length === 0 ? (
                <p className="text-center text-sm opacity-50" style={{ color: 'var(--text-muted)' }}>
                  Нет сохраненных чатов
                </p>
              ) : (
                <div className="space-y-3">
                  {userChats.map((chat) => {
                    const psych = psychs.find(p => p.id === chat.psych_id) || DEFAULT_PSYCHOLOGISTS.find(p => p.id === chat.psych_id);
                    return (
                      <div
                        key={chat.psych_id}
                        onClick={() => {
                          if (psych) {
                            setSelectedPsych(psych);
                            navigateToView('chat', chat.psych_id);
                            setShowChatHistory(false);
                          }
                        }}
                        className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--card-hover)] hover:bg-[var(--card-bg)] cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-4">
                          {psych && <img src={psych.image} className="w-12 h-12 rounded-full object-cover" alt="" />}
                          <div className="flex-1">
                            <h4 className="font-serif text-lg" style={{ color: 'var(--text-color)' }}>
                              {psych?.name || chat.psych_id}
                            </h4>
                            <p className="text-xs opacity-60 mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                              {chat.last_message}
                            </p>
                            <p className="text-[10px] opacity-40 mt-1" style={{ color: 'var(--text-muted)' }}>
                              {chat.message_count} сообщений
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {isAdding && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-6">
            <div className="bg-[#111] border border-[var(--border-color)] p-5 sm:p-10 rounded-[1.75rem] sm:rounded-[3rem] w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="font-serif text-xl sm:text-2xl italic mb-5 sm:mb-6" style={{ color: '#fff' }}>{t.newMentor}</h3>
              <input value={newName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)} placeholder={t.name} className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 mb-4 outline-none text-white" />
              <input value={newSpecialty} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSpecialty(e.target.value)} placeholder={lang === 'ru' ? 'Роль / специализация' : lang === 'kz' ? 'Рөл / мамандану' : 'Role / specialty'} className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 mb-4 outline-none text-white" />
              <input value={newAvatar} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAvatar(e.target.value)} placeholder={lang === 'ru' ? 'Ссылка на аватар (URL)' : lang === 'kz' ? 'Аватар сілтемесі (URL)' : 'Avatar URL'} className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 mb-4 outline-none text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl px-4 py-3 mb-4 outline-none text-white file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-xs file:text-white" />
              {(newAvatarPreview || newAvatar) && (
                <div className="mb-4 flex items-center gap-3">
                  <img src={newAvatarPreview || newAvatar} className="w-14 h-14 rounded-full object-cover border border-[var(--border-color)]" alt="avatar preview" />
                  <button
                    type="button"
                    onClick={() => { setNewAvatar(''); setNewAvatarPreview(''); }}
                    className="text-xs uppercase tracking-widest opacity-70 hover:opacity-100"
                    style={{ color: '#fff' }}
                  >
                    {lang === 'ru' ? 'Очистить аватар' : lang === 'kz' ? 'Аватарды тазалау' : 'Clear avatar'}
                  </button>
                </div>
              )}
              <textarea value={newCharacter} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewCharacter(e.target.value)} placeholder={lang === 'ru' ? 'Характер персонажа (как он общается)' : lang === 'kz' ? 'Кейіпкер мінезі (қалай сөйлейді)' : 'Character style (how this persona speaks)'} className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 mb-4 h-24 outline-none text-white resize-none" />
              <textarea value={newDesc} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewDesc(e.target.value)} placeholder={t.desc} className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 mb-6 h-32 outline-none text-white resize-none" />
              <div className="flex gap-4">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-4 text-white/40 uppercase tracking-widest text-[10px]">{t.cancel}</button>
                <button onClick={addCustomPsych} className="flex-1 py-4 rounded-full text-white uppercase tracking-widest text-[10px] font-bold" style={{ backgroundColor: 'var(--accent-color)' }}>{t.create}</button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Guest Reminder Banner */}
      <AnimatePresence>
        {showGuestReminder && !token && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-3 right-3 sm:bottom-24 sm:left-auto sm:right-6 z-40 border border-[var(--border-color)] rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 shadow-lg w-auto sm:max-w-md"
            style={{ backgroundColor: currentTheme.colors.bg }}
          >
            <p className="text-sm flex-1" style={{ color: 'var(--text-color)' }}>
              {t.guestReminder}
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              {t.createAccount}
            </button>
            <button
              onClick={() => setShowGuestReminder(false)}
              className="p-1 hover:bg-white/5 rounded-full transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {view !== 'landing' && (
        <footer className="fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-8 text-[8px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.5em] opacity-20 pointer-events-none" style={{ color: 'var(--text-color)' }}>{t.breathe}</footer>
      )}
    </main>
  )
}