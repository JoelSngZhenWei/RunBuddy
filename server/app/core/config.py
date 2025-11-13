# server/app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # --- Server/Backend secrets (keep on server only) ---
    STRAVA_CLIENT_ID: str | None = None
    STRAVA_CLIENT_SECRET: str | None = None
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None

    OPENAI_API_KEY: str | None = None
    app_env: str = "development"

    SUPABASE_URL: str | None = None
    SUPABASE_SERVICE_KEY: str | None = None
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # <- prevents crash if stray keys exist
        case_sensitive=False,
    )

settings = Settings()
