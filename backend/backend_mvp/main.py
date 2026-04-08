from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI()
client = OpenAI()

class ChatRequest(BaseModel):
    message: str
    mode: str  # support / analyst / hard


def build_prompt(mode, message):
    if mode == "hard":
        return f"Ты строгий наставник. Говори жестко и по делу.\nСообщение: {message}"
    elif mode == "analyst":
        return f"Проанализируй поведение пользователя.\nСообщение: {message}"
    else:
        return f"Поддержи пользователя честно.\nСообщение: {message}"


@app.post("/chat")
def chat(req: ChatRequest):
    prompt = build_prompt(req.mode, req.message)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return {"response": response.choices[0].message.content}