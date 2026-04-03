import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext

_repo_root = Path(__file__).resolve().parent.parent
load_dotenv(_repo_root / ".env")
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY environment variable is required. Set it in .env or the environment."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 дней

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # JWT expects exp as int timestamp (seconds since epoch)
    # Using utcnow() so we need to convert to timestamp
    expire_timestamp = int(expire.timestamp())
    to_encode.update({"exp": expire_timestamp})
    # jose library expects 'sub' to be a string, not int
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        raise


def verify_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[
                             ALGORITHM], options={"verify_exp": True})
        # 'sub' is stored as string in token, convert back to int
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            return None
        user_id_int = int(user_id_str)
        return user_id_int
    except JWTError as e:
        # Token expired or invalid
        return None
    except Exception as e:
        import traceback
        traceback.print_exc()
        return None
