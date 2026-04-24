from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import re

app = FastAPI()
client = OpenAI()

class ChatRequest(BaseModel):
    message: str
    mode: str  # support / analyst / hard


def build_prompt(mode, message):
    # Простая авто-детекция языка, чтобы не отвечать всегда только на русском
    lang_hint = "Russian" if re.search(r"[а-яА-ЯёЁ]", message or "") else "same language as user"

    if mode == "hard":
        return (
            f"You are a strict mentor. Reply in {lang_hint}. "
            "Be direct and useful. Do not ask more than one question.\n"
            f"User message: {message}"
        )
    elif mode == "analyst":
        return (
            f"You are an insightful analyst. Reply in {lang_hint}. "
            "Give concrete observations and 1 practical next step. "
            "Avoid endless follow-up questions.\n"
            f"User message: {message}"
        )
    else:
        return (
            f"You are a supportive companion. Reply in {lang_hint}. "
            "Be warm, specific, and helpful. Avoid repetitive template phrases.\n"
            f"User message: {message}"
        )


@app.post("/chat")
def chat(req: ChatRequest):
    prompt = build_prompt(req.mode, req.message)

    response = client.chat.completions.create(
        model="gpt-5.1-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return {"response": response.choices[0].message.content}