from datetime import datetime
from typing import Optional

import models
from security import get_password_hash, verify_password
from sqlalchemy import desc
from sqlalchemy.orm import Session


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, email: str, username: str, password: str):
    hashed_password = get_password_hash(password)
    db_user = models.User(email=email, username=username,
                          hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def save_chat_message(
    db: Session,
    user_id: int,
    psych_id: str,
    role: str,
    content: str,
    response_mode: Optional[str] = None,
    risk_level: Optional[str] = None,
    analysis_reason: Optional[str] = None,
):
    message = models.ChatMessage(
        user_id=user_id,
        psych_id=psych_id,
        role=role,
        content=content,
        response_mode=response_mode,
        risk_level=risk_level,
        analysis_reason=analysis_reason,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_chat_history(db: Session, user_id: int, psych_id: str):
    messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.user_id == user_id,
        models.ChatMessage.psych_id == psych_id
    ).order_by(models.ChatMessage.created_at).all()
    out = []
    for msg in messages:
        row = {"role": msg.role, "content": msg.content}
        if getattr(msg, "response_mode", None) is not None:
            row["response_mode"] = msg.response_mode
        if getattr(msg, "risk_level", None) is not None:
            row["risk_level"] = msg.risk_level
        if getattr(msg, "analysis_reason", None) is not None:
            row["analysis_reason"] = msg.analysis_reason
        out.append(row)
    return out


def get_user_chats(db: Session, user_id: int):
    """Get list of unique psychologists user has chatted with"""
    from sqlalchemy import distinct

    # Get all distinct psych_ids for this user (including None for guest messages that were later associated)
    psych_ids = db.query(distinct(models.ChatMessage.psych_id)).filter(
        models.ChatMessage.user_id == user_id
    ).all()

    chats = []
    for (psych_id,) in psych_ids:
        if not psych_id:  # Skip None psych_ids
            continue
        last_message = db.query(models.ChatMessage).filter(
            models.ChatMessage.user_id == user_id,
            models.ChatMessage.psych_id == psych_id
        ).order_by(models.ChatMessage.created_at.desc()).first()

        message_count = db.query(models.ChatMessage).filter(
            models.ChatMessage.user_id == user_id,
            models.ChatMessage.psych_id == psych_id
        ).count()

        chats.append({
            "psych_id": psych_id,
            "last_message": last_message.content if last_message else "",
            "last_message_time": last_message.created_at.isoformat() if last_message else None,
            "message_count": message_count
        })

    return sorted(chats, key=lambda x: x["last_message_time"] or "", reverse=True)


def get_user_by_google_id(db: Session, google_id: str):
    return db.query(models.User).filter(models.User.google_id == google_id).first()


def get_or_create_user_by_google(db: Session, google_id: str, email: str, username: str):
    user = get_user_by_google_id(db, google_id)
    if user:
        return user
    db_user = models.User(google_id=google_id, email=email,
                          username=username, hashed_password=None)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_subscription(db: Session, user_id: int, stripe_subscription_id: str, end_date):
    subscription = models.Subscription(
        user_id=user_id,
        stripe_subscription_id=stripe_subscription_id,
        status="active",
        end_date=end_date
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


def get_user_subscription(db: Session, user_id: int):
    """Get user's most recent subscription (active or not)"""
    return db.query(models.Subscription).filter(
        models.Subscription.user_id == user_id
    ).order_by(models.Subscription.created_at.desc()).first()


def update_subscription(db: Session, subscription_id: int, **kwargs):
    subscription = db.query(models.Subscription).filter(
        models.Subscription.id == subscription_id).first()
    if subscription:
        for key, value in kwargs.items():
            setattr(subscription, key, value)
        db.commit()
        db.refresh(subscription)
    return subscription

def get_user_message_count(db: Session, user_id: int) -> int:
    """Получить общее количество сообщений пользователя (только от пользователя, не от бота)"""
    return db.query(models.ChatMessage).filter(
        models.ChatMessage.user_id == user_id,
        models.ChatMessage.role == "user"
    ).count()

def has_active_subscription(db: Session, user_id: int) -> bool:
    """Проверить, есть ли у пользователя активная подписка"""
    subscription = get_user_subscription(db, user_id)
    if not subscription:
        return False
    if subscription.status != "active":
        return False
    if subscription.end_date and subscription.end_date < datetime.utcnow():
        return False
    return True


def create_payment(db: Session, user_id: int, amount: float, currency: str, payment_type: str,
                   stripe_payment_intent_id: str = None, stripe_checkout_session_id: str = None):
    payment = models.Payment(
        user_id=user_id,
        amount=amount,
        currency=currency,
        payment_type=payment_type,
        stripe_payment_intent_id=stripe_payment_intent_id,
        stripe_checkout_session_id=stripe_checkout_session_id,
        status="pending"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def get_payment_by_intent_id(db: Session, intent_id: str):
    return db.query(models.Payment).filter(
        models.Payment.stripe_payment_intent_id == intent_id
    ).first()


def get_payment_by_session_id(db: Session, session_id: str):
    return db.query(models.Payment).filter(
        models.Payment.stripe_checkout_session_id == session_id
    ).first()


def create_crisis_session(db: Session, user_id: int, payment_id: int = None, scheduled_at=None):
    session = models.CrisisSession(
        user_id=user_id,
        payment_id=payment_id,
        scheduled_at=scheduled_at,
        status="pending"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_crisis_sessions(db: Session, user_id: int):
    return db.query(models.CrisisSession).filter(
        models.CrisisSession.user_id == user_id
    ).order_by(models.CrisisSession.created_at.desc()).all()


def create_verification_code(db: Session, email: str, code: str, expires_at: datetime):
    """Создать код подтверждения"""
    # Удаляем старые коды для этого email
    db.query(models.VerificationCode).filter(
        models.VerificationCode.email == email
    ).delete()
    
    verification_code = models.VerificationCode(
        email=email,
        code=code,
        expires_at=expires_at
    )
    db.add(verification_code)
    db.commit()
    db.refresh(verification_code)
    return verification_code


def verify_code(db: Session, email: str, code: str) -> bool:
    """Проверить код подтверждения"""
    verification = db.query(models.VerificationCode).filter(
        models.VerificationCode.email == email,
        models.VerificationCode.code == code
    ).first()
    
    if not verification:
        return False
    
    if verification.expires_at < datetime.utcnow():
        # Код истек, удаляем его
        db.delete(verification)
        db.commit()
        return False
    
    # Код валиден, удаляем его после использования
    db.delete(verification)
    db.commit()
    return True


def mark_email_verified(db: Session, email: str):
    """Отметить email как подтвержденный"""
    user = get_user_by_email(db, email)
    if user:
        user.email_verified = True
        db.commit()
        db.refresh(user)
    return user
