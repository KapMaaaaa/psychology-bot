"""SMTP email sending via fastapi-mail (ConnectionConfig from environment)."""

from __future__ import annotations

import logging
import os
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import SecretStr

logger = logging.getLogger(__name__)


def _env_bool(key: str, default: bool) -> bool:
    raw = os.getenv(key)
    if raw is None:
        return default
    return raw.strip().lower() in ("1", "true", "yes", "on")


def _parse_port() -> int:
    raw = os.getenv("MAIL_PORT", "587").strip()
    try:
        return int(raw)
    except ValueError:
        return 587


def build_connection_config() -> ConnectionConfig:
    """Build ConnectionConfig from MAIL_* environment variables."""
    port = _parse_port()
    # Default: STARTTLS on 587 (Gmail), SSL on 465
    default_starttls = port == 587
    default_ssl = port == 465

    suppress = _env_bool("MAIL_SUPPRESS_SEND", False)

    mail_from = os.getenv("MAIL_FROM", "").strip()
    if not mail_from:
        if suppress:
            mail_from = "noreply@example.com"
        else:
            raise ValueError("MAIL_FROM is not set")

    username = os.getenv("MAIL_USERNAME", "").strip()
    password_raw = os.getenv("MAIL_PASSWORD", "").strip()
    server = os.getenv("MAIL_SERVER", "").strip()

    if not suppress and (not username or not password_raw or not server):
        raise ValueError(
            "MAIL_USERNAME, MAIL_PASSWORD, and MAIL_SERVER are required when MAIL_SUPPRESS_SEND is not enabled"
        )

    # Dummy placeholders when suppressed (library may still instantiate config)
    if suppress:
        username = username or "noreply@example.com"
        password_raw = password_raw or "unused"
        server = server or "localhost"

    from_name = os.getenv("MAIL_FROM_NAME", "").strip() or None

    return ConnectionConfig(
        MAIL_USERNAME=username,
        MAIL_PASSWORD=SecretStr(password_raw),
        MAIL_FROM=mail_from,
        MAIL_FROM_NAME=from_name,
        MAIL_PORT=port,
        MAIL_SERVER=server,
        MAIL_STARTTLS=_env_bool("MAIL_STARTTLS", default_starttls),
        MAIL_SSL_TLS=_env_bool("MAIL_SSL_TLS", default_ssl),
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True,
        SUPPRESS_SEND=1 if suppress else 0,
    )


async def send_verification_email(to_email: str, code: str) -> None:
    """
    Send a 6-digit verification code to the recipient.
    Raises on SMTP / configuration errors (caller maps to HTTP 503).
    """
    cfg = build_connection_config()

    if cfg.SUPPRESS_SEND == 1:
        logger.info(
            "MAIL_SUPPRESS_SEND: skipping SMTP; verification code for %s: %s",
            to_email,
            code,
        )
        return

    subject = "Код подтверждения регистрации"
    plain = (
        f"Ваш код подтверждения: {code}\n\n"
        f"Код действителен 10 минут. Если вы не запрашивали регистрацию, проигнорируйте это письмо."
    )
    html = f"""\
<html>
<body style="font-family: sans-serif;">
  <p>Ваш код подтверждения:</p>
  <p style="font-size: 24px; letter-spacing: 4px; font-weight: bold;">{code}</p>
  <p style="color: #666; font-size: 14px;">Код действителен 10 минут.</p>
  <p style="color: #666; font-size: 14px;">Если вы не запрашивали регистрацию, проигнорируйте это письмо.</p>
</body>
</html>"""

    message = MessageSchema(
        subject=subject,
        recipients=[to_email],
        body=html,
        alternative_body=plain,
        subtype=MessageType.html,
    )

    fm = FastMail(cfg)
    await fm.send_message(message)
