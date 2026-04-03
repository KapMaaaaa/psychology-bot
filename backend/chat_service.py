"""Стриминг чата и сохранение сообщений в БД."""

import logging
import os
from typing import AsyncGenerator, List, Optional

from fastapi import BackgroundTasks
from openai import OpenAI

import crud
from database import SessionLocal
from prompts import (
    CORE_SYSTEM_PROMPT,
    PERSONALITIES,
    RESPONSE_MODE_FALLBACKS,
    RESPONSE_MODE_PROMPTS,
    SUPPORT_FALLBACK_MESSAGE,
)
from response_analysis import ChatResponseAnalysis
from schemas import Message

logger = logging.getLogger(__name__)

# Идентификатор модели API; переопределение: OPENAI_CHAT_MODEL в .env
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-5.1")
CHAT_TEMPERATURE = 0.8

# Ограничение числа сообщений в запросе к модели (не влияет на БД)
MAX_HISTORY_MESSAGES = 12
# Fallback только если модель не вернула текста (пустой стрим / только пробелы)


def get_last_user_message_text(messages: List[Message]) -> str:
    """Текст последнего сообщения пользователя в истории."""
    for m in reversed(messages):
        if m.role == "user":
            return m.content
    return ""


def save_bot_message(
    user_id: int,
    psych_id: str,
    content: str,
    response_mode: Optional[str] = None,
    risk_level: Optional[str] = None,
    analysis_reason: Optional[str] = None,
) -> None:
    """Сохранение сообщения бота в БД (используется в background task)."""
    db = SessionLocal()
    try:
        crud.save_chat_message(
            db,
            user_id,
            psych_id,
            "bot",
            content,
            response_mode=response_mode,
            risk_level=risk_level,
            analysis_reason=analysis_reason,
        )
    except Exception:
        logger.exception("chat: save_bot_message failed (non-fatal)")
    finally:
        db.close()


def _last_user_index(messages: List[Message]) -> Optional[int]:
    for i in range(len(messages) - 1, -1, -1):
        if messages[i].role == "user":
            return i
    return None


def _trim_history_for_api(messages: List[Message]) -> List[Message]:
    """
    Окно из не более MAX_HISTORY_MESSAGES сообщений для OpenAI:
    стартуем с последних cap сообщений; если из-за этого теряется последний user,
    сдвигаем начало к нему (до cap сообщений вперёд от него).
    Убираем ведущие ответы ассистента без своего user в окне, затем добираем
    более ранние сообщения слева, не превышая cap (предпочитая начинать с user).
    Если последнее сообщение в истории — user, окно всегда заканчивается на нём (suffix до n).
    """
    if not messages:
        return []
    cap = MAX_HISTORY_MESSAGES
    n = len(messages)
    u = _last_user_index(messages)

    # Типичный чат: последнее сообщение — user; всегда сохраняем суффикс до конца истории
    if messages[-1].role == "user":
        start = max(0, n - cap)
        end = n
        if u is not None and u < start:
            start = u
            end = n
    elif u is None:
        start = max(0, n - cap)
        end = n
    else:
        start = max(0, n - cap)
        end = n
        if u < start:
            start = u
            end = min(n, u + cap)

    while start < end and messages[start].role == "bot":
        start += 1

    guard = 0
    max_guard = n + cap * 3
    while guard < max_guard:
        guard += 1
        while start < end and messages[start].role == "bot":
            start += 1
        length = end - start
        if length > cap:
            start = max(0, end - cap)
            if u is not None and u < start:
                start = u
                end = min(n, u + cap)
            while start < end and messages[start].role == "bot":
                start += 1
            continue
        if length >= cap or start == 0:
            break
        next_start = start - 1
        if messages[next_start].role == "user":
            if end - next_start <= cap:
                start = next_start
            else:
                break
            continue
        j = next_start
        while j >= 0 and messages[j].role == "bot":
            j -= 1
        if j >= 0:
            if end - j <= cap:
                start = j
            else:
                break
        else:
            break

    result = list(messages[start:end])
    if not result and n:
        return list(messages[-min(cap, n) :])
    # Последнее сообщение — user: в окне должен быть тот же объект, что и в истории
    if messages[-1].role == "user" and result and result[-1] is not messages[-1]:
        tail = messages[u : n] if u is not None else messages[-min(cap, n) :]
        if len(tail) <= cap:
            return list(tail)
        return list(tail[-cap:])
    return result


def trim_messages_for_api(messages: List[Message]) -> List[Message]:
    """Публичная обёртка для логирования и тестов (то же окно, что уходит в OpenAI)."""
    return _trim_history_for_api(messages)


async def generate_stream(
    client: OpenAI,
    messages: List[Message],
    psych_id: str,
    custom_desc: Optional[str],
    lang: str,
    analysis: ChatResponseAnalysis,
    user_id: Optional[int] = None,
    background_tasks: Optional[BackgroundTasks] = None,
) -> AsyncGenerator[str, None]:
    yielded_any = False
    try:
        response_mode = analysis.response_mode
        risk_level = analysis.risk_level
        analysis_reason = analysis.reason

        mode = response_mode if response_mode in RESPONSE_MODE_PROMPTS else "support"
        mode_prompt = RESPONSE_MODE_PROMPTS[mode]
        fallback = RESPONSE_MODE_FALLBACKS.get(mode, RESPONSE_MODE_FALLBACKS["support"])

        personality = PERSONALITIES.get(
            psych_id, custom_desc if custom_desc else "Профессиональный наставник"
        )

        system_content = (
            f"{mode_prompt}\n\n"
            f"{CORE_SYSTEM_PROMPT}\nЛичность: {personality}\nЯзык общения: {lang}.\n\n"
            "ВАЖНО: Не используй markdown форматирование (символы **, __, и т.д.). "
            "Отвечай обычным текстом без форматирования."
        )

        api_messages = [{"role": "system", "content": system_content}]

        trimmed = _trim_history_for_api(messages)
        for msg in trimmed:
            role = "assistant" if msg.role == "bot" else "user"
            api_messages.append({"role": role, "content": msg.content})

        if user_id and messages and messages[-1].role == "user":
            db = SessionLocal()
            try:
                crud.save_chat_message(
                    db, user_id, psych_id, "user", messages[-1].content
                )
            except Exception:
                logger.exception("chat: failed to persist user message (non-fatal)")
            finally:
                db.close()

        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=api_messages,
            temperature=CHAT_TEMPERATURE,
            stream=True,
        )

        accumulated_response = ""
        last_finish_reason: Optional[str] = None
        for chunk in response:
            if not chunk.choices:
                continue
            ch0 = chunk.choices[0]
            fr = getattr(ch0, "finish_reason", None)
            if fr:
                last_finish_reason = fr
            delta = ch0.delta
            if not delta:
                continue
            content = getattr(delta, "content", None)
            if not content:
                continue
            content = content.replace("**", "")
            accumulated_response += content
            yield content
            yielded_any = True

        final_text = accumulated_response.strip()
        if not final_text:
            logger.warning(
                "chat: пустой ответ модели (finish_reason=%s). "
                "Проверьте OPENAI_API_KEY, квоту и доступ к модели %s.",
                last_finish_reason,
                CHAT_MODEL,
            )
            accumulated_response = fallback
            yield fallback
            yielded_any = True

        cleaned_response = accumulated_response.replace("**", "").replace("__", "").strip()
        if user_id and cleaned_response and background_tasks:
            background_tasks.add_task(
                save_bot_message,
                user_id,
                psych_id,
                cleaned_response,
                response_mode=response_mode,
                risk_level=risk_level,
                analysis_reason=analysis_reason,
            )

    except Exception:
        logger.exception("chat generate_stream failed")
        if not yielded_any:
            yield SUPPORT_FALLBACK_MESSAGE
