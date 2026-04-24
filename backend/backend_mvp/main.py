from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
from typing import Optional
import re

app = FastAPI()
client = OpenAI()

class ChatRequest(BaseModel):
    message: str
    mode: str  # support / analyst / hard
    previous_message: Optional[str] = None


def detect_language(text: str) -> str:
    ru = len(re.findall(r"[а-яА-ЯёЁ]", text or ""))
    en = len(re.findall(r"[a-zA-Z]", text or ""))
    if ru > 0 and en > 0:
        return "mixed"
    if ru > 0:
        return "russian"
    return "other"


def detect_tone(text: str) -> str:
    lower = (text or "").lower()
    serious_markers = [
        "серьезно", "важно", "проблема", "плохо", "тревожно",
        "help", "urgent", "serious", "problem", "anxious",
    ]
    playful_markers = ["ахах", "лол", "haha", "xd", ":)", "😂", "🤣"]

    if any(m in lower for m in serious_markers):
        return "serious"
    if any(m in lower for m in playful_markers):
        return "playful"
    return "neutral"


def build_prompt(mode, message, previous_message=None):
    # Простая авто-детекция языка, чтобы не отвечать всегда только на русском
    current_lang = detect_language(message)
    prev_lang = detect_language(previous_message or "")
    current_tone = detect_tone(message)
    prev_tone = detect_tone(previous_message or "")

    if current_lang == "russian":
        lang_hint = "Russian"
    elif current_lang == "mixed":
        lang_hint = "the dominant language of the latest user message"
    else:
        lang_hint = "same language as user"

    adaptation_hint = ""
    if previous_message:
        if prev_lang != current_lang:
            adaptation_hint += (
                "The user switched language. Follow the latest user language immediately. "
            )
        if prev_tone != current_tone:
            adaptation_hint += (
                "The user changed tone. Adapt your tone to the latest message without mentioning the switch. "
            )

    human_tone = (
        "Sound like a real person, not a bot. "
        "Use simple everyday language, short clear sentences, and a natural tone. "
        "No corporate wording, no generic disclaimers, no repetitive template phrases. "
        "Keep it concise and practical. "
        "Prefer 2-5 sentences unless user asks for details. "
        f"{adaptation_hint}"
    )

    if mode == "hard":
        return (
            f"You are a strict mentor. Reply in {lang_hint}. "
            f"{human_tone} "
            "Be direct and useful. Do not ask more than one question.\n"
            f"User message: {message}"
        )
    elif mode == "analyst":
        return (
            f"You are an insightful analyst. Reply in {lang_hint}. "
            f"{human_tone} "
            "Give concrete observations and 1 practical next step. "
            "Avoid endless follow-up questions.\n"
            f"User message: {message}"
        )
    else:
        return (
            f"You are a supportive companion. Reply in {lang_hint}. "
            f"{human_tone} "
            "Be warm, specific, and helpful.\n"
            f"User message: {message}"
        )


@app.post("/chat")
def chat(req: ChatRequest):
    prompt = build_prompt(req.mode, req.message, req.previous_message)

    response = client.chat.completions.create(
        model="gpt-5.1-mini",
        messages=[{"role": "user", "content": prompt}],
        max_completion_tokens=220
    )

    return {"response": response.choices[0].message.content}