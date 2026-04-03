# Be Heard - AI Psychologist Platform

Платформа для общения с AI-психологами с поддержкой подписок и кризисных сессий.

## 🚀 Быстрый старт

### Требования

- Docker и Docker Compose
- Аккаунт OpenAI (для API ключа)
- Аккаунт Stripe (для платежей)
- Google Cloud проект (для OAuth)

### 1. Клонирование и настройка

```bash
git clone <repository-url>
cd alyb
```

### 2. Создание файла .env

Скопируйте `.env-example` в `.env`:

```bash
cp .env-example .env
```

Заполните все необходимые переменные (см. раздел "Настройка переменных окружения" ниже).

### 3. Запуск приложения

```bash
docker-compose up --build
```

Приложение будет доступно:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8001
- API документация: http://localhost:8001/docs

---

## 📋 Настройка переменных окружения

Создайте файл `.env` в корне проекта со следующим содержимым:

### Обязательные переменные

```env
# OpenAI API
OPENAI_API_KEY=sk-ваш_ключ_openai

# JWT Secret Key (любая случайная строка)
SECRET_KEY=ваш_случайный_секретный_ключ_для_jwt

# Database
DATABASE_URL=sqlite:///./app.db
DROP_EXISTING_TABLES=false

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Stripe (для платежей)

```env
STRIPE_SECRET_KEY=sk_test_ваш_секретный_ключ
STRIPE_WEBHOOK_SECRET=whsec_ваш_webhook_secret
```

**Как получить ключи Stripe** - см. раздел "Настройка Stripe" ниже.

### Google OAuth (опционально, для входа через Google)

```env
GOOGLE_CLIENT_ID=ваш_google_client_id
GOOGLE_CLIENT_SECRET=ваш_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

**Как настроить Google OAuth** - см. раздел "Настройка Google OAuth" ниже.

---

## 💳 Настройка Stripe

### Шаг 1: Регистрация в Stripe

1. Перейдите на https://stripe.com
2. Нажмите "Sign up" (Регистрация)
3. Зарегистрируйтесь с любым email
4. **Важно**: Stripe позволяет тестировать без верификации бизнеса в тестовом режиме

### Шаг 2: Получение тестовых ключей

1. После регистрации войдите в Dashboard: https://dashboard.stripe.com
2. Убедитесь, что переключены в **Test mode** (переключатель в правом верхнем углу)
3. Перейдите в **Developers** → **API keys**
4. Скопируйте:
   - **Secret key** (начинается с `sk_test_...`) - нажмите "Reveal test key"
   - Добавьте его в `.env` как `STRIPE_SECRET_KEY`

### Шаг 3: Настройка Webhook для локального тестирования

1. Установите Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux/Windows - скачайте с https://stripe.com/docs/stripe-cli
   ```

2. Авторизуйтесь:
   ```bash
   stripe login
   ```

3. Запустите webhook forwarding (в отдельном терминале):
   ```bash
   stripe listen --forward-to localhost:8001/payment/webhook
   ```
   
   Это даст вам **webhook signing secret** (начинается с `whsec_...`)
   Скопируйте его и добавьте в `.env` как `STRIPE_WEBHOOK_SECRET`

### Шаг 4: Тестовые карты Stripe

Stripe предоставляет тестовые карты для проверки:

**Успешная оплата:**
- Номер: `4242 4242 4242 4242`
- Дата: любая будущая (например: `12/34`)
- CVC: любые 3 цифры (например: `123`)
- ZIP: любые 5 цифр (например: `12345`)

**Другие сценарии:**
- **Отклонена карта**: `4000 0000 0000 0002`
- **Требуется аутентификация**: `4000 0025 0000 3155`
- **Недостаточно средств**: `4000 0000 0000 9995`

Полный список: https://stripe.com/docs/testing

### Важные замечания по Stripe

- ✅ **Тестовый режим** - все платежи виртуальные, деньги не списываются
- ✅ **Не требуется верификация бизнеса** для тестирования
- ✅ Можно тестировать все функции без реальных платежей
- ⚠️ **Не используйте тестовые ключи в продакшене**
- ⚠️ **Не публикуйте секретные ключи** в Git

---

## 🔐 Настройка Google OAuth

### Шаг 1: Создание проекта в Google Cloud

1. Перейдите на https://console.cloud.google.com
2. Создайте новый проект или выберите существующий
3. Включите **Google+ API**:
   - Перейдите в **APIs & Services** → **Library**
   - Найдите "Google+ API" и нажмите "Enable"

### Шаг 2: Создание OAuth 2.0 credentials

1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **Create Credentials** → **OAuth client ID**
3. Если появится запрос, настройте **OAuth consent screen**:
   - User Type: **External** (для тестирования)
   - App name: "Be Heard" (или любое другое)
   - User support email: ваш email
   - Developer contact: ваш email
   - Нажмите **Save and Continue**
   - Scopes: оставьте по умолчанию, нажмите **Save and Continue**
   - Test users: добавьте свой email, нажмите **Save and Continue**
   - Нажмите **Back to Dashboard**

4. Создайте OAuth Client ID:
   - Application type: **Web application**
   - Name: "Be Heard Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173`
   - Authorized redirect URIs:
     - `http://localhost:5173/auth/google/callback`
   - Нажмите **Create**

5. Скопируйте:
   - **Client ID** - добавьте в `.env` как `GOOGLE_CLIENT_ID`
   - **Client secret** - добавьте в `.env` как `GOOGLE_CLIENT_SECRET`

### Шаг 3: Настройка .env

```env
GOOGLE_CLIENT_ID=ваш_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=ваш_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

### Важные замечания по Google OAuth

- ⚠️ В тестовом режиме только добавленные test users могут войти
- ⚠️ Для продакшена нужно пройти верификацию приложения
- ✅ Для локального тестирования достаточно настроить OAuth consent screen

---

## 🛠️ Разработка

### Структура проекта

```
alyb/
├── backend/          # FastAPI backend
│   ├── main.py      # Основной файл приложения
│   ├── models.py    # SQLAlchemy модели
│   ├── crud.py      # CRUD операции
│   ├── schemas.py   # Pydantic схемы
│   └── ...
├── frontend/        # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx  # Главный компонент
│   │   └── ...
│   └── ...
└── docker-compose.yml
```

### Запуск в режиме разработки

```bash
# Запуск всех сервисов
docker-compose up

# Запуск только backend
docker-compose up backend

# Запуск только frontend
docker-compose up frontend

# Пересборка после изменений
docker-compose up --build

# Просмотр логов
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Остановка

```bash
docker-compose down

# С удалением volumes
docker-compose down -v
```

---

## 📝 API Документация

После запуска backend, документация доступна по адресу:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

---

## 🔧 Решение проблем

### Проблема: Frontend не запускается

**Решение:**
```bash
# Пересоберите frontend контейнер
docker-compose build frontend
docker-compose up frontend
```

### Проблема: Tailwind CSS не работает

**Решение:**
Убедитесь, что в `frontend/package.json` есть зависимости:
- `tailwindcss`
- `postcss`
- `autoprefixer`

И что существует файл `frontend/postcss.config.js`

### Проблема: Stripe webhook не работает

**Решение:**
1. Убедитесь, что Stripe CLI запущен: `stripe listen --forward-to localhost:8001/payment/webhook`
2. Проверьте, что `STRIPE_WEBHOOK_SECRET` в `.env` соответствует выводу Stripe CLI
3. Проверьте логи backend: `docker-compose logs -f backend`

### Проблема: Google OAuth не работает

**Решение:**
1. Проверьте, что в Google Cloud Console правильно настроены redirect URIs
2. Убедитесь, что ваш email добавлен в test users (для тестового режима)
3. Проверьте, что все переменные в `.env` заполнены правильно

### Проблема: База данных не создается

**Решение:**
```bash
# Удалите старую БД и пересоздайте
rm backend/app.db
docker-compose restart backend
```

---

## 🚀 Переход в продакшен

### Stripe

1. Переключитесь в **Live mode** в Stripe Dashboard
2. Получите **Live keys** (начинаются с `pk_live_` и `sk_live_`)
3. Обновите `.env` файл
4. Настройте реальные webhooks на ваш домен
5. Пройдите верификацию бизнеса в Stripe

### Google OAuth

1. В Google Cloud Console перейдите в OAuth consent screen
2. Заполните все обязательные поля
3. Отправьте приложение на верификацию
4. После одобрения обновите redirect URIs на продакшен домены

### Environment Variables

Обновите `.env` для продакшена:
- `FRONTEND_URL` - ваш продакшен домен
- `DATABASE_URL` - продакшен база данных (не SQLite!)
- `DROP_EXISTING_TABLES=false` - обязательно!

---

## 📚 Полезные ссылки

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Документация: https://stripe.com/docs
- Google Cloud Console: https://console.cloud.google.com
- OpenAI API: https://platform.openai.com
- FastAPI Документация: https://fastapi.tiangolo.com
- React Документация: https://react.dev

---

## 📄 Лицензия

[Укажите лицензию]

---

## 👥 Авторы

[Укажите авторов]

