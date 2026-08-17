from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    # To use Google Gemini:
    GOOGLE_API_KEY: str = ""
    # To use HuggingFace (optional):
    HUGGINGFACE_API_KEY: str = ""

    CHROMA_DB_DIR: str = "./chroma_db"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
