"""Структурированный анализ последнего user-сообщения для режима ответа и безопасности."""

from __future__ import annotations

from dataclasses import dataclass

from safety_service import simple_risk_check

# Сильный дистресс → escalation (если risk не перекрывает)
_STRONG_DISTRESS_SUBSTRINGS = (
    "не вынесу",
    "невыносимо",
    "не могу больше",
    "я на дне",
    "всё бессмысленно",
    "нет сил",
    "hopeless",
    "can't take",
    "can't cope",
    "break down",
    "разваливается",
    "хочется исчезнуть",
)

_REFLECTIVE_SUBSTRINGS = (
    "почему я",
    "задумался",
    "задумалась",
    "не понимаю что чувствую",
    "что со мной",
    "как так вышло",
    "что это значит",
    "размышляю",
    "i wonder",
    "why do i",
    "what does it mean",
    "who am i",
    "не знаю кто я",
)


@dataclass(frozen=True)
class ChatResponseAnalysis:
    """Единственное представление результата анализа (только атрибуты, без dict API)."""

    risk_level: str
    response_mode: str
    needs_human: bool
    reason: str


def has_severe_distress_patterns(last_user_message: str) -> bool:
    """Сильный дистресс по тем же маркерам, что поднимают режим к escalation."""
    text = (last_user_message or "").lower()
    if not text.strip():
        return False
    for s in _STRONG_DISTRESS_SUBSTRINGS:
        if s in text:
            return True
    return False


def detect_response_mode(last_user_message: str) -> str:
    """
    Режим по тексту: support | reflection | escalation.
    Сильный дистресс → escalation; рефлексия → reflection; иначе support.
    """
    text = (last_user_message or "").lower()
    if not text.strip():
        return "support"

    if has_severe_distress_patterns(last_user_message):
        return "escalation"

    for s in _REFLECTIVE_SUBSTRINGS:
        if s in text:
            return "reflection"

    return "support"


def _compose_reason(
    risk: str, detected: str, mode: str, upgraded: bool
) -> str:
    if risk == "high":
        return "high risk"
    if upgraded and risk == "medium" and detected == "support":
        return "distress + uncertainty"
    if mode == "escalation" and detected == "escalation":
        return "distress signals"
    if mode == "reflection":
        return "reflection cues" if detected == "reflection" else "distress + uncertainty"
    return "default support"


def analyze_response_for_chat(last_user_message: str) -> ChatResponseAnalysis:
    """
    Правила:
    - risk == high → mode escalation
    - risk == medium и detected == support → mode reflection
    - иначе mode = detected
    """
    risk = simple_risk_check(last_user_message)
    detected = detect_response_mode(last_user_message)

    upgraded = False
    if risk == "high":
        mode = "escalation"
    elif risk == "medium" and detected == "support":
        mode = "reflection"
        upgraded = True
    else:
        mode = detected

    reason = _compose_reason(risk, detected, mode, upgraded)

    # high → всегда; medium + явный сильный дистресс → да; иначе нет
    needs_human = risk == "high" or (
        risk == "medium" and has_severe_distress_patterns(last_user_message)
    )

    return ChatResponseAnalysis(
        risk_level=risk,
        response_mode=mode,
        needs_human=needs_human,
        reason=reason,
    )
