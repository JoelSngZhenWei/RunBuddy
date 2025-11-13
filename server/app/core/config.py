from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    NEXT_PUBLIC_ONEMAP_TOKEN: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
