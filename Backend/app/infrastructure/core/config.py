# app/infrastructure/core/config.py
import os
from pathlib import Path
from dotenv import load_dotenv  # pip install python-dotenv

# 1) Найти .env в корне проекта
BASE_DIR = Path(__file__).resolve().parents[3]
load_dotenv(BASE_DIR / ".env")    # <-- грузим все переменные в os.environ

from typing import Any
from pydantic import PostgresDsn, field_validator
from pydantic_core.core_schema import FieldValidationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    DATABASE_HOST: str
    DATABASE_PORT: int
    DATABASE_NAME: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    ACCESS_EXPIRE:int
    OWNER_EMAIL: str = "owner@example.com"
    OWNER_PASSWORD: str = "owner"
    ASYNC_DATABASE_URI: PostgresDsn | None = None

    # теперь не обязательно указывать env_file,
    # Pydantic возьмёт переменные из os.environ
    model_config = SettingsConfigDict()

    @field_validator("ASYNC_DATABASE_URI", mode="after")
    def assemble_db_connection(cls, v: str | None, info: FieldValidationInfo) -> Any:
        if not v:
            username = info.data["DATABASE_USER"]
            password = info.data["DATABASE_PASSWORD"]
            host = info.data["DATABASE_HOST"]
            port = info.data["DATABASE_PORT"]
            db_name = info.data["DATABASE_NAME"]
            return PostgresDsn.build(
                scheme="postgresql+asyncpg",
                username=username,
                password=password,
                host=host,
                port=port,
                path=f"{db_name}",
            )
        return v

settings = Settings()
