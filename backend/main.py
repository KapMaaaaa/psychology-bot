import json
import logging
import os
import random
import string
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv

_repo_root = Path(__file__).resolve().parent.parent
load_dotenv(_repo_root / ".env")
load_dotenv()

import crud
# Импортируем модели, чтобы они зарегистрировались
import models  # noqa: F401
import schemas
import security
import stripe
import uvicorn
from database import SessionLocal, get_db, init_db
from fastapi import (BackgroundTasks, Depends, FastAPI, HTTPException, Request,
                     status)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.auth.transport import requests
from google.oauth2 import id_token
from openai import OpenAI
from prompts import CRISIS_DETECTION_SYSTEM, build_crisis_detection_user_prompt
from sqlalchemy.orm import Session

from email_mailer import send_verification_email

from chat_service import (
    CHAT_MODEL,
    generate_stream,
    get_last_user_message_text,
    trim_messages_for_api,
)
from response_analysis import analyze_response_for_chat
from schemas import ChatRequest


def _parse_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "").strip()
    if not raw:
        raise RuntimeError(
            "CORS_ORIGINS is not set. Set it to a comma-separated list of allowed origins "
            "(e.g. CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000)"
        )
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    if not origins:
        raise RuntimeError(
            "CORS_ORIGINS must contain at least one origin after parsing."
        )
    return origins


CORS_ORIGINS = _parse_cors_origins()

logger = logging.getLogger(__name__)

# Инициализация клиента OpenAI с твоим ключом
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Инициализация Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

app = FastAPI()

# Инициализация БД при старте


@app.on_event("startup")
async def startup_event():
    if not os.getenv("OPENAI_API_KEY", "").strip():
        logger.error(
            "OPENAI_API_KEY не задан: запросы к модели будут падать, в чате — запасная фраза."
        )
    try:
        init_db()
    except Exception as e:
        import traceback
        traceback.print_exc()

# CORS: список origin из CORS_ORIGINS (через запятую)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Security
security_scheme = HTTPBearer()

# Dependency для получения текущего пользователя


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
):
    try:
        token = credentials.credentials
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Токен не предоставлен",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = security.verify_token(token)
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный или истекший токен",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user = crud.get_user_by_id(db, user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Пользователь не найден",
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Ошибка аутентификации: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Функции для верификации email
def generate_verification_code() -> str:
    """Генерирует 6-значный код подтверждения"""
    return ''.join(random.choices(string.digits, k=6))


# Эндпоинты аутентификации

@app.post("/send-verification-code", response_model=None)
async def send_verification_code(
    request: schemas.SendVerificationCodeRequest,
    db: Session = Depends(get_db)
):
    """Отправить код подтверждения на email"""
    # Проверка существующего пользователя
    if crud.get_user_by_email(db, request.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        )
    
    # Генерируем код
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)  # Код действителен 10 минут
    
    # Сохраняем код в БД
    try:
        crud.create_verification_code(db, request.email, code, expires_at)
    except Exception as e:
        logger.exception("Ошибка при сохранении кода: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при сохранении кода: {str(e)}"
        )

    try:
        await send_verification_email(request.email, code)
    except ValueError as e:
        logger.error("Ошибка конфигурации почты: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка конфигурации отправки почты",
        )
    except Exception as e:
        logger.exception("Не удалось отправить письмо с кодом: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Не удалось отправить письмо. Повторите попытку позже.",
        )

    result: dict = {
        "message": "Код подтверждения отправлен на email",
    }
    if os.getenv("DEV_RETURN_VERIFICATION_CODE", "0") == "1":
        result["code"] = str(code)

    return result


@app.post("/verify-email", response_model=None)
async def verify_email(
    verification_data: schemas.EmailVerificationRequest,
    db: Session = Depends(get_db)
):
    """Проверить код подтверждения и завершить регистрацию"""
    # Проверяем код
    if not crud.verify_code(db, verification_data.email, verification_data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный или истекший код подтверждения"
        )
    
    # Код верный. Реально создание пользователя происходит в /register,
    # т.к. там есть username/password. Здесь подтверждаем email.
    return {
        "message": "Email успешно подтвержден",
        "email": verification_data.email,
    }


@app.post("/register", response_model=schemas.Token)
async def register(
    user_data: schemas.UserRegisterEnhanced,
    db: Session = Depends(get_db)
):
    """Регистрация с проверкой кода подтверждения"""
    # Валидация пароля
    if user_data.password != user_data.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пароли не совпадают"
        )

    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пароль должен содержать минимум 8 символов"
        )

    # Проверка существующего пользователя
    if crud.get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        )
    if crud.get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Имя пользователя уже занято"
        )

    # Проверка кода подтверждения (обязательно)
    if not user_data.verification_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Код подтверждения обязателен"
        )
    
    if not crud.verify_code(db, user_data.email, user_data.verification_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный или истекший код подтверждения"
        )

    # Создание пользователя
    user = crud.create_user(db, user_data.email,
                            user_data.username, user_data.password)
    
    # Отмечаем email как подтвержденный
    crud.mark_email_verified(db, user_data.email)

    # Создание токена
    access_token = security.create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }


@app.post("/login", response_model=schemas.Token)
async def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = security.create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username
    }


@app.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username
    }


@app.get("/auth/google/url")
async def get_google_auth_url():
    """Returns Google OAuth URL for frontend"""
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI",
                             "http://localhost:3000/auth/google/callback")
    scope = "openid email profile"
    nonce = ''.join(
        random.choices(string.ascii_letters + string.digits, k=16)
    )
    return {
        "url": f"https://accounts.google.com/o/oauth2/v2/auth?client_id={client_id}&redirect_uri={redirect_uri}&response_type=id_token&scope={scope}&nonce={nonce}"
    }


@app.post("/auth/google", response_model=schemas.Token)
async def google_auth(auth_data: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    """Google OAuth callback handler"""
    try:
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not client_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth not configured"
            )

        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            auth_data.id_token, requests.Request(), client_id
        )

        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        google_id = idinfo['sub']
        email = idinfo.get('email')
        name = idinfo.get('name', 'User')

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )

        # Get or create user
        user = crud.get_or_create_user_by_google(db, google_id, email, name)

        # Create token
        access_token = security.create_access_token(data={"sub": user.id})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "username": user.username
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )


# Subscription endpoints
@app.post("/subscription/create")
async def create_subscription_checkout(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create Stripe checkout session for subscription"""
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'kzt',
                    'product_data': {
                        'name': 'Monthly Subscription - All Bots Access',
                    },
                    'recurring': {
                        'interval': 'month',
                    },
                    'unit_amount': 39900,  # 399 KZT in cents
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=os.getenv("FRONTEND_URL", "http://localhost:3000") +
            "/subscription/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=os.getenv(
                "FRONTEND_URL", "http://localhost:3000") + "/subscription/cancel",
            client_reference_id=str(current_user.id),
            metadata={'user_id': str(current_user.id), 'type': 'subscription'}
        )
        return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating checkout session: {str(e)}"
        )


@app.get("/subscription/verify")
async def verify_subscription_session(
    session_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify Stripe checkout session and create subscription if not exists"""
    try:
        # Retrieve the checkout session
        checkout_session = stripe.checkout.Session.retrieve(session_id)

        # Check if session is completed and belongs to current user
        if checkout_session.status != 'complete':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Checkout session is not completed"
            )

        # Verify user matches
        metadata = checkout_session.get('metadata', {})
        session_user_id = int(metadata.get(
            'user_id', checkout_session.get('client_reference_id', 0)))
        if session_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Session does not belong to current user"
            )

        # Check if this is a subscription
        if checkout_session.mode == 'subscription' and checkout_session.payment_status == 'paid':
            subscription_id = checkout_session.subscription
            if subscription_id:
                # Check if subscription already exists
                existing = db.query(models.Subscription).filter(
                    models.Subscription.stripe_subscription_id == subscription_id
                ).first()

                try:
                    # Retrieve subscription from Stripe
                    subscription_obj = stripe.Subscription.retrieve(
                        subscription_id)

                    # Get end date, handle case when current_period_end might not be available
                    if hasattr(subscription_obj, 'current_period_end') and subscription_obj.current_period_end:
                        end_date = datetime.fromtimestamp(
                            subscription_obj.current_period_end)
                    else:
                        # Fallback: set end date to 30 days from now
                        end_date = datetime.now() + timedelta(days=30)
                        print(
                            f"Warning: current_period_end not found for subscription {subscription_id}, using fallback date", flush=True)

                    if not existing:
                        # Create subscription
                        crud.create_subscription(
                            db, current_user.id, subscription_id, end_date)
                        print(
                            f"Created subscription for user_id={current_user.id}, subscription_id={subscription_id}", flush=True)
                    else:
                        # Update existing subscription
                        crud.update_subscription(
                            db, existing.id, status="active", end_date=end_date)
                        print(
                            f"Updated subscription for user_id={current_user.id}, subscription_id={subscription_id}", flush=True)
                except stripe.error.StripeError as e:
                    print(
                        f"Error retrieving subscription from Stripe: {str(e)}", flush=True)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Error retrieving subscription: {str(e)}"
                    )

        return {"status": "success", "message": "Subscription verified"}
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        print(f"Error verifying subscription session: {str(e)}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying session: {str(e)}"
        )


@app.get("/subscription/status")
async def get_subscription_status(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user subscription status"""
    print(
        f"DEBUG: Getting subscription status for user_id={current_user.id}", flush=True)
    subscription = crud.get_user_subscription(db, current_user.id)
    if not subscription:
        print(
            f"DEBUG: No subscription found for user_id={current_user.id}", flush=True)
        return {"status": "none", "expires_at": None}

    print(
        f"DEBUG: Found subscription: status={subscription.status}, end_date={subscription.end_date}", flush=True)
    return {
        "status": subscription.status,
        "expires_at": subscription.end_date.isoformat() if subscription.end_date else None,
        "stripe_subscription_id": subscription.stripe_subscription_id
    }


@app.post("/subscription/cancel")
async def cancel_subscription(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel user subscription"""
    subscription = crud.get_user_subscription(db, current_user.id)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )

    if subscription.stripe_subscription_id:
        try:
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=True
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error canceling subscription: {str(e)}"
            )

    crud.update_subscription(db, subscription.id, status="cancelled")
    return {"message": "Subscription will be cancelled at the end of billing period"}


@app.post("/subscription/reactivate")
async def reactivate_subscription(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reactivate cancelled or expired subscription"""
    subscription = crud.get_user_subscription(db, current_user.id)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No subscription found"
        )

    if subscription.status not in ['cancelled', 'expired']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subscription is not cancelled or expired"
        )

    if not subscription.stripe_subscription_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No Stripe subscription ID found"
        )

    try:
        # Retrieve subscription from Stripe
        stripe_subscription = stripe.Subscription.retrieve(
            subscription.stripe_subscription_id)

        # Check if subscription still exists in Stripe
        if stripe_subscription.status == 'canceled':
            # Subscription was fully cancelled, need to create a new one
            # Get customer ID from subscription
            customer_id = stripe_subscription.customer

            # Create new checkout session for reactivation
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'kzt',
                        'product_data': {
                            'name': 'Monthly Subscription - All Bots Access',
                        },
                        'recurring': {
                            'interval': 'month',
                        },
                        'unit_amount': 39900,  # 399 KZT in cents
                    },
                    'quantity': 1,
                }],
                mode='subscription',
                customer=customer_id,
            success_url=os.getenv("FRONTEND_URL", "http://localhost:3000") +
                "/subscription/success?session_id={CHECKOUT_SESSION_ID}",
                cancel_url=os.getenv(
                "FRONTEND_URL", "http://localhost:3000") + "/subscription/cancel",
                client_reference_id=str(current_user.id),
                metadata={'user_id': str(
                    current_user.id), 'type': 'subscription', 'reactivate': 'true'}
            )
            return {"checkout_url": checkout_session.url, "session_id": checkout_session.id, "requires_payment": True}
        else:
            # Subscription still exists, just reactivate it
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=False
            )

            # Update subscription status
            if hasattr(stripe_subscription, 'current_period_end') and stripe_subscription.current_period_end:
                end_date = datetime.fromtimestamp(
                    stripe_subscription.current_period_end)
            else:
                end_date = datetime.now() + timedelta(days=30)

            crud.update_subscription(
                db, subscription.id, status="active", end_date=end_date)
            return {"message": "Subscription reactivated successfully", "requires_payment": False}
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        print(f"Error reactivating subscription: {str(e)}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reactivating subscription: {str(e)}"
        )


# Crisis session endpoints
@app.post("/crisis/session/create")
async def create_crisis_session_checkout(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create Stripe checkout session for crisis session"""
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'kzt',
                    'product_data': {
                        'name': 'Crisis Support Session - 15 minutes',
                    },
                    'unit_amount': 199900,  # 1999 KZT in cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=os.getenv("FRONTEND_URL", "http://localhost:3000") +
            "/crisis/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=os.getenv(
                "FRONTEND_URL", "http://localhost:3000") + "/crisis/cancel",
            client_reference_id=str(current_user.id),
            metadata={'user_id': str(current_user.id),
                      'type': 'crisis_session'}
        )

        # Create payment record
        crud.create_payment(
            db, current_user.id, 1999.0, "KZT", "crisis_session",
            stripe_checkout_session_id=checkout_session.id
        )

        return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating checkout session: {str(e)}"
        )


@app.get("/crisis/session/status")
async def get_crisis_session_status(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user crisis sessions"""
    sessions = crud.get_crisis_sessions(db, current_user.id)
    return {
        "sessions": [
            {
                "id": s.id,
                "status": s.status,
                "scheduled_at": s.scheduled_at.isoformat() if s.scheduled_at else None,
                "created_at": s.created_at.isoformat()
            }
            for s in sessions
        ]
    }


# Stripe webhook handler
@app.post("/payment/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session.get('metadata', {})
        user_id = int(metadata.get(
            'user_id', session.get('client_reference_id', 0)))
        payment_type = metadata.get('type', '')

        if payment_type == 'subscription':
            # Create subscription
            subscription_id = session.get('subscription')
            if subscription_id:
                try:
                    subscription_obj = stripe.Subscription.retrieve(
                        subscription_id)
                    end_date = datetime.fromtimestamp(
                        subscription_obj.current_period_end)
                    # Check if subscription already exists
                    existing = db.query(models.Subscription).filter(
                        models.Subscription.stripe_subscription_id == subscription_id
                    ).first()
                    if not existing:
                        crud.create_subscription(
                            db, user_id, subscription_id, end_date)
                    else:
                        # Update existing subscription
                        crud.update_subscription(
                            db, existing.id, status="active", end_date=end_date)
                except Exception as e:
                    print(
                        f"Error processing subscription webhook: {str(e)}", flush=True)

        elif payment_type == 'crisis_session':
            # Update payment status
            payment = crud.get_payment_by_session_id(db, session['id'])
            if payment:
                # Idempotency: webhook может прийти несколько раз.
                existing_crisis_session = db.query(models.CrisisSession).filter(
                    models.CrisisSession.payment_id == payment.id
                ).first()
                if existing_crisis_session:
                    return {"status": "success"}

                if payment.status != "completed":
                    payment.status = "completed"
                    db.commit()

                # Create crisis session (только если её ещё нет для payment)
                crud.create_crisis_session(db, user_id, payment.id)

    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        # Find subscription by stripe_subscription_id
        subscription_obj = db.query(models.Subscription).filter(
            models.Subscription.stripe_subscription_id == subscription['id']
        ).first()
        if subscription_obj:
            if subscription['status'] == 'active':
                end_date = datetime.fromtimestamp(
                    subscription['current_period_end'])
                crud.update_subscription(
                    db, subscription_obj.id, status="active", end_date=end_date)
            else:
                crud.update_subscription(
                    db, subscription_obj.id, status="expired")

    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        subscription_obj = db.query(models.Subscription).filter(
            models.Subscription.stripe_subscription_id == subscription['id']
        ).first()
        if subscription_obj:
            crud.update_subscription(
                db, subscription_obj.id, status="cancelled")

    return {"status": "success"}


@app.get("/chat/history")
async def get_chat_history(
    psych_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history = crud.get_chat_history(db, current_user.id, psych_id)
    return {"history": history}


@app.get("/chat/list")
async def get_chat_list(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of all chats (psychologists) user has conversations with"""
    chats = crud.get_user_chats(db, current_user.id)
    return {"chats": chats}


@app.post("/crisis/detect", response_model=schemas.CrisisDetectionResponse)
async def detect_crisis(
    request_data: schemas.CrisisDetectionRequest,
    db: Session = Depends(get_db)
):
    """AI-based crisis detection"""
    try:
        detection_prompt = build_crisis_detection_user_prompt(request_data.message)

        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {"role": "system", "content": CRISIS_DETECTION_SYSTEM},
                {"role": "user", "content": detection_prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)

        return {
            "is_crisis": result.get("is_crisis", False),
            "confidence": float(result.get("confidence", 0.0)),
            "message": result.get("message", "")
        }
    except Exception as e:
        return {
            "is_crisis": False,
            "confidence": 0.0,
            "message": f"Error in detection: {str(e)}"
        }


@app.post("/chat")
async def chat(
    req: ChatRequest,
    request: Request,
    background_tasks: BackgroundTasks
):
    # Проверяем наличие токена (опционально для обратной совместимости)
    user_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        user_id = security.verify_token(token)
        
        # Если пользователь авторизован, проверяем лимит сообщений
        if user_id:
            db = SessionLocal()
            try:
                FREE_MESSAGE_LIMIT = 10
                message_count = crud.get_user_message_count(db, user_id)
                has_subscription = crud.has_active_subscription(db, user_id)
                
                # Если превышен лимит и нет подписки - возвращаем ошибку
                if message_count >= FREE_MESSAGE_LIMIT and not has_subscription:
                    return JSONResponse(
                        status_code=status.HTTP_402_PAYMENT_REQUIRED,
                        content={
                            "error": "subscription_required",
                            "message": "Вы исчерпали лимит бесплатных сообщений. Оформите подписку для продолжения.",
                            "free_limit": FREE_MESSAGE_LIMIT,
                            "current_count": message_count
                        }
                    )
            finally:
                db.close()

    last_user_text = get_last_user_message_text(req.history)
    analysis = analyze_response_for_chat(last_user_text)
    trimmed = trim_messages_for_api(req.history)
    logger.debug(
        "chat selection: response_mode=%s risk_level=%s needs_human=%s analysis_reason=%s "
        "trimmed_count=%s last_user_len=%s",
        analysis.response_mode,
        analysis.risk_level,
        analysis.needs_human,
        analysis.reason,
        len(trimmed),
        len(last_user_text or ""),
    )
    if analysis.needs_human:
        logger.warning(
            "chat: needs_human=True response_mode=%s risk_level=%s",
            analysis.response_mode,
            analysis.risk_level,
        )

    return StreamingResponse(
        generate_stream(
            client,
            req.history,
            req.psych_id,
            req.custom_desc,
            req.lang,
            analysis,
            user_id,
            background_tasks,
        ),
        media_type="text/plain"
    )

if __name__ == "__main__":
    # Запуск на порту 8000 (внутри Docker), проброшен на 8000 снаружи
    import os
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
