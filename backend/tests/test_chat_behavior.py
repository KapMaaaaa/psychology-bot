"""
Lightweight verification for chat analysis, trimming, and stream fallback.

Run from backend/:  python -m unittest tests.test_chat_behavior -v

Expected behavior (see tests below):
- No empty stream on pre-yield failure: client receives SUPPORT_FALLBACK_MESSAGE.
- DB save failures during user persist: logged, stream still returns model output.
- Trimmed history: when the last message in history is user, that message stays in the window.

Manual checks:
- Set LOG_LEVEL=DEBUG (or configure root logger) to see `chat selection:` with
  response_mode, risk_level, needs_human, analysis_reason, trimmed_count, last_user_len.
- needs_human=True also emits a WARNING with response_mode and risk_level.
"""

from __future__ import annotations

import unittest
from unittest.mock import MagicMock, patch

from schemas import Message

# Import after path is ok when run as python -m unittest from backend/


class TestAnalyzeScenarios(unittest.TestCase):
    """Expected modes / risk from analyze_response_for_chat (rule-based)."""

    def test_normal_support(self) -> None:
        from response_analysis import analyze_response_for_chat

        a = analyze_response_for_chat("Привет, как дела?")
        self.assertEqual(a.response_mode, "support")
        self.assertEqual(a.risk_level, "low")
        self.assertFalse(a.needs_human)
        self.assertIn("default", a.reason)

    def test_reflective_message(self) -> None:
        from response_analysis import analyze_response_for_chat

        a = analyze_response_for_chat("почему я так поступил, не понимаю")
        self.assertEqual(a.response_mode, "reflection")
        self.assertEqual(a.risk_level, "low")
        self.assertFalse(a.needs_human)

    def test_high_risk_message(self) -> None:
        from response_analysis import analyze_response_for_chat

        a = analyze_response_for_chat("хочу умереть")
        self.assertEqual(a.risk_level, "high")
        self.assertEqual(a.response_mode, "escalation")
        self.assertTrue(a.needs_human)


class TestTrimming(unittest.TestCase):
    def test_latest_user_always_in_window_when_last_is_user(self) -> None:
        from chat_service import trim_messages_for_api

        # Длинная история, последнее сообщение — user (чётный индекс)
        msgs = [
            Message(role="user" if i % 2 == 0 else "bot", content=str(i))
            for i in range(25)
        ]
        self.assertEqual(msgs[-1].role, "user")
        trimmed = trim_messages_for_api(msgs)
        self.assertTrue(trimmed)
        self.assertIs(trimmed[-1], msgs[-1])
        self.assertEqual(trimmed[-1].role, "user")


class TestStreamFallback(unittest.IsolatedAsyncioTestCase):
    async def test_pre_yield_failure_emits_fallback_not_empty(self) -> None:
        from chat_service import SUPPORT_FALLBACK_MESSAGE, generate_stream
        from response_analysis import ChatResponseAnalysis

        client = MagicMock()
        client.chat.completions.create.side_effect = RuntimeError("forced pre-stream failure")

        analysis = ChatResponseAnalysis(
            risk_level="low",
            response_mode="support",
            needs_human=False,
            reason="default support",
        )
        msgs = [Message(role="user", content="hi")]

        chunks: list[str] = []
        async for part in generate_stream(
            client,
            msgs,
            psych_id="naruto",
            custom_desc=None,
            lang="ru",
            analysis=analysis,
            user_id=None,
            background_tasks=None,
        ):
            chunks.append(part)

        self.assertTrue(chunks, "stream must not be empty")
        self.assertEqual(chunks[0], SUPPORT_FALLBACK_MESSAGE)

    async def test_db_save_failure_does_not_break_stream(self) -> None:
        from chat_service import generate_stream
        from response_analysis import ChatResponseAnalysis

        client = MagicMock()
        # Длина ответа >= MIN_RESPONSE_CHARS, иначе сработает текстовый fallback
        stream_iter = iter(
            [
                MagicMock(
                    choices=[
                        MagicMock(delta=MagicMock(content="okay response"))
                    ]
                )
            ]
        )

        def _create(**kwargs):
            return stream_iter

        client.chat.completions.create = _create

        analysis = ChatResponseAnalysis(
            risk_level="low",
            response_mode="support",
            needs_human=False,
            reason="default support",
        )
        msgs = [Message(role="user", content="hi")]

        with patch("chat_service.crud.save_chat_message", side_effect=OSError("disk full")):
            chunks: list[str] = []
            async for part in generate_stream(
                client,
                msgs,
                psych_id="naruto",
                custom_desc=None,
                lang="ru",
                analysis=analysis,
                user_id=42,
                background_tasks=None,
            ):
                chunks.append(part)

        self.assertEqual("".join(chunks).replace("**", ""), "okay response")


if __name__ == "__main__":
    unittest.main()
