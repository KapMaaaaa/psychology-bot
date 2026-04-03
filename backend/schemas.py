from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    history: List[Message]
    # Если фронт не прислал (undefined в JSON), не падаем 422 — дефолтная личность
    psych_id: str = "psychologist"
    custom_desc: Optional[str] = None
    lang: str = "ru"


class UserRegisterEnhanced(BaseModel):
    email: EmailStr
    username: str
    password: str
    password_confirm: str
    verification_code: str


class GoogleAuthRequest(BaseModel):
    id_token: str


class SubscriptionStatus(BaseModel):
    status: str
    expires_at: Optional[datetime] = None
    stripe_subscription_id: Optional[str] = None


class CrisisDetectionRequest(BaseModel):
    message: str


class CrisisDetectionResponse(BaseModel):
    is_crisis: bool
    confidence: float
    message: str


class CrisisSessionRequest(BaseModel):
    preferred_time: Optional[datetime] = None
    payment_intent_id: Optional[str] = None


class EmailVerificationRequest(BaseModel):
    email: EmailStr
    code: str


class SendVerificationCodeRequest(BaseModel):
    email: EmailStr


class SendVerificationCodeResponse(BaseModel):
    message: str
    code: str  # ТОЛЬКО ДЛЯ РАЗРАБОТКИ!