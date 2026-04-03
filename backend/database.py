import os
import sys

# Импортируем модели, чтобы они зарегистрировались в Base.metadata
import models  # noqa: F401
from models import Base
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session, sessionmaker

# Создание движка SQLite
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={
        "check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _check_table_schema(table_name, expected_columns):
    """Проверяет, соответствует ли схема таблицы ожидаемой"""
    inspector = inspect(engine)
    if not inspector.has_table(table_name):
        return False

    existing_columns = {col['name']
                        for col in inspector.get_columns(table_name)}
    expected_column_names = {col.name for col in expected_columns}

    return existing_columns == expected_column_names


def init_db():
    """Инициализация базы данных - создание таблиц"""
    try:
        inspector = inspect(engine)

        # Проверяем каждую таблицу на соответствие схеме
        for table_name, table in Base.metadata.tables.items():
            if inspector.has_table(table_name):
                existing_columns = {col['name']
                                    for col in inspector.get_columns(table_name)}
                expected_columns = {col.name for col in table.columns}
                if existing_columns != expected_columns:
                    break
            else:
                break

        Base.metadata.create_all(bind=engine)
        _migrate_chat_message_metadata()
    except Exception as e:
        print(f"Ошибка при создании таблиц: {e}", flush=True, file=sys.stderr)
        import traceback
        traceback.print_exc()
        raise


def _migrate_chat_message_metadata():
    """Добавляет колонки response_mode / risk_level / analysis_reason в SQLite."""
    try:
        inspector = inspect(engine)
        if not inspector.has_table("chat_messages"):
            return
        cols = {c["name"] for c in inspector.get_columns("chat_messages")}
        with engine.begin() as conn:
            if "response_mode" not in cols:
                conn.execute(
                    text(
                        "ALTER TABLE chat_messages ADD COLUMN response_mode VARCHAR"
                    )
                )
            if "risk_level" not in cols:
                conn.execute(
                    text("ALTER TABLE chat_messages ADD COLUMN risk_level VARCHAR")
                )
            if "analysis_reason" not in cols:
                conn.execute(
                    text("ALTER TABLE chat_messages ADD COLUMN analysis_reason TEXT")
                )
    except Exception as e:
        print(f"Миграция chat_messages: {e}", flush=True, file=sys.stderr)


def get_db():
    """Dependency для получения сессии БД"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
