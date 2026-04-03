"""Простая оценка риска по ключевым словам (без LLM), с нормализацией и меньшим числом ложных срабатываний."""

from __future__ import annotations

import re

_THIRD_PERSON_OR_NARRATIVE = re.compile(
    r"(^|[\s,.!?])(он|она|они)\s+"
    r"(сказал|сказала|говорит|думал|чувствует|хотел|попросил)|"
    r"\b(they|he|she)\s+(said|says|feels|thinks)\b|"
    r"(если\s+бы\s+кто|как\s+бы\s+если|представь(те)?\s*,?\s*что|"
    r"например\s+если|someone\s+else)",
    re.IGNORECASE | re.UNICODE,
)

_FIRST_PERSON = re.compile(
    r"(^|[\s,.!?«\"'])(я|мне|мной|мною|i\s|i'|me\b|my\b|myself)\b",
    re.IGNORECASE | re.UNICODE,
)

# Критичные формулировки — high даже при коротком сообщении
_HIGH_SELF_HARM_RU = re.compile(
    r"(хочу\s+умереть|не\s+хочу\s+жить|покончить\s+с\s+собой|"
    r"суицид|самоубийств|повешусь|зарежусь|резать\s+вен|нет\s+смысла\s+жить)",
    re.IGNORECASE | re.UNICODE,
)

_HIGH_EN = (
    "kill myself",
    "killing myself",
    "end my life",
    "want to die",
    "hang myself",
    "cut myself",
    "hurt myself",
)

_HIGH_GENERAL = ("suicide", "suicidal", "self harm", "self-harm")

_MEDIUM_SUBSTRINGS = (
    "panic",
    "депресси",
    "тревог",
    "боюсь",
    "страшно",
    "help me",
    "помогите",
    "на грани",
    "не справляюсь",
)


def normalize_for_checks(message: str) -> str:
    if not message:
        return ""
    t = message.lower().strip()
    t = re.sub(r"\s+", " ", t)
    t = re.sub(r"[^\w\s\u0400-\u04FF]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def _looks_like_third_person_or_quote(raw: str) -> bool:
    if _THIRD_PERSON_OR_NARRATIVE.search(raw):
        return True
    if raw.count('"') >= 2 or raw.count("«") >= 1:
        return True
    return False


def _has_first_person(raw: str, norm: str) -> bool:
    return bool(_FIRST_PERSON.search(raw) or _FIRST_PERSON.search(norm))


def simple_risk_check(message: str) -> str:
    """
    Возвращает 'low' | 'medium' | 'high'.
    """
    if not message or not message.strip():
        return "low"

    raw = message.strip()
    norm = normalize_for_checks(message)
    if not norm:
        return "low"

    narrative = _looks_like_third_person_or_quote(raw)
    fp = _has_first_person(raw, norm)

    # Явный суицидальный смысл по-русски — high
    if _HIGH_SELF_HARM_RU.search(norm):
        return "high"

    for kw in _HIGH_EN:
        if kw in norm:
            if narrative and not fp:
                continue
            return "high"

    for kw in _HIGH_GENERAL:
        if kw in norm:
            if narrative and not fp:
                continue
            return "high"

    for kw in _MEDIUM_SUBSTRINGS:
        if kw in norm:
            if narrative and not fp:
                continue
            return "medium"

    return "low"
