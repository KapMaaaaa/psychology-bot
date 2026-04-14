export type Language = 'ru' | 'kz' | 'en'

export type AuthTheme = {
  colors: {
    bg: string
    text: string
    textMuted: string
    accent: string
    border: string
    cardBg: string
  }
}

export type AuthTranslation = {
  login: string
  register: string
  email: string
  username: string
  password: string
  passwordConfirm: string
  verificationCode: string
  sendCode: string
  codeSent: string
  enterCode: string
  loginTitle: string
  registerTitle: string
  verifyTitle: string
  switchToRegister: string
  switchToLogin: string
  back: string
  completeRegistration: string
  resendCode: string
  orSeparator: string
  error: string
  success: string
  loading: string
  emailInvalid: string
  passwordTooShort: string
  passwordWeak: string
  passwordMismatch: string
  usernameTooShort: string
  usernameInvalid: string
  codeRequired: string
  continueWithGoogle: string
  legalNotice: string
  privacyPolicy: string
  termsOfUse: string
}

export const authTranslations: Record<Language, AuthTranslation> = {
  ru: {
    login: 'Войти',
    register: 'Регистрация',
    email: 'Email',
    username: 'Имя пользователя',
    password: 'Пароль',
    passwordConfirm: 'Подтвердите пароль',
    verificationCode: 'Код подтверждения',
    sendCode: 'Отправить код',
    codeSent: 'Код отправлен на email',
    enterCode: 'Введите код из email',
    loginTitle: 'Вход',
    registerTitle: 'Регистрация',
    verifyTitle: 'Подтвердите email',
    switchToRegister: 'Нет аккаунта? Зарегистрироваться',
    switchToLogin: 'Уже есть аккаунт? Войти',
    back: 'Назад',
    completeRegistration: 'Завершить регистрацию',
    resendCode: 'Отправить код снова',
    orSeparator: 'или',
    error: 'Ошибка',
    success: 'Успешно',
    loading: 'Загрузка...',
    emailInvalid: 'Неверный формат email',
    passwordTooShort: 'Пароль должен содержать минимум 8 символов',
    passwordWeak: 'Пароль должен содержать буквы и цифры',
    passwordMismatch: 'Пароли не совпадают',
    usernameTooShort: 'Имя пользователя должно содержать минимум 3 символа',
    usernameInvalid: 'Имя пользователя должно содержать только буквы и цифры',
    codeRequired: 'Введите 6-значный код подтверждения',
    continueWithGoogle: 'Войти через Google',
    legalNotice: 'Продолжая, вы принимаете',
    privacyPolicy: 'Политику конфиденциальности',
    termsOfUse: 'Пользовательское соглашение'
  },
  kz: {
    login: 'Кіру',
    register: 'Тіркелу',
    email: 'Email',
    username: 'Пайдаланушы аты',
    password: 'Құпия сөз',
    passwordConfirm: 'Құпия сөзді растаңыз',
    verificationCode: 'Растау коды',
    sendCode: 'Код жіберу',
    codeSent: 'Код email-ге жіберілді',
    enterCode: 'Email-дегі кодты енгізіңіз',
    loginTitle: 'Кіру',
    registerTitle: 'Тіркелу',
    verifyTitle: 'Email растаңыз',
    switchToRegister: 'Аккаунт жоқ па? Тіркелу',
    switchToLogin: 'Аккаунт бар ма? Кіру',
    back: 'Артқа',
    completeRegistration: 'Тіркелуді аяқтау',
    resendCode: 'Кодты қайта жіберу',
    orSeparator: 'немесе',
    error: 'Қате',
    success: 'Сәтті',
    loading: 'Жүктелуде...',
    emailInvalid: 'Email форматы дұрыс емес',
    passwordTooShort: 'Құпия сөз кемінде 8 таңбадан тұруы керек',
    passwordWeak: 'Құпия сөзде әріптер мен сандар болуы керек',
    passwordMismatch: 'Құпия сөздер сәйкес келмейді',
    usernameTooShort: 'Пайдаланушы аты кемінде 3 таңбадан тұруы керек',
    usernameInvalid: 'Пайдаланушы аты тек әріптер мен сандардан тұруы керек',
    codeRequired: '6 таңбалы растау кодын енгізіңіз',
    continueWithGoogle: 'Google арқылы кіру',
    legalNotice: 'Жалғастыра отырып, сіз',
    privacyPolicy: 'Құпиялылық саясатын',
    termsOfUse: 'Пайдаланушы келісімін'
  },
  en: {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    username: 'Username',
    password: 'Password',
    passwordConfirm: 'Confirm Password',
    verificationCode: 'Verification Code',
    sendCode: 'Send Code',
    codeSent: 'Code sent to email',
    enterCode: 'Enter code from email',
    loginTitle: 'Login',
    registerTitle: 'Register',
    verifyTitle: 'Verify your email',
    switchToRegister: 'No account? Register',
    switchToLogin: 'Already have account? Login',
    back: 'Back',
    completeRegistration: 'Complete registration',
    resendCode: 'Resend code',
    orSeparator: 'or',
    error: 'Error',
    success: 'Success',
    loading: 'Loading...',
    emailInvalid: 'Invalid email format',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordWeak: 'Password must contain letters and numbers',
    passwordMismatch: 'Passwords do not match',
    usernameTooShort: 'Username must be at least 3 characters',
    usernameInvalid: 'Username must contain only letters and numbers',
    codeRequired: 'Enter the 6-digit verification code',
    continueWithGoogle: 'Continue with Google',
    legalNotice: 'By continuing, you agree to the',
    privacyPolicy: 'Privacy Policy',
    termsOfUse: 'Terms of Service'
  }
}
