"""
Central application configuration.

All configurable values (DB connection, JWT secret, CORS origins, tax rate)
come from environment variables, loaded from a `.env` file in local dev.
This means the exact same code works locally and in production — you just
point DATABASE_URL at a different PostgreSQL instance.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    CORS_ORIGINS: str = "http://localhost:5173"
    TAX_RATE: float = 0.08

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
