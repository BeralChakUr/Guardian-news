"""Configuration management for Guardian News Backend."""
import os
from typing import Optional
from functools import lru_cache


class Settings:
    """Application settings loaded from environment variables."""
    
    # MongoDB
    MONGO_URL: str = os.environ.get("MONGO_URL", "")
    DB_NAME: str = os.environ.get("DB_NAME", "guardian_news")
    
    # AI Services (optional)
    OPENAI_API_KEY: Optional[str] = os.environ.get("OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = os.environ.get("ANTHROPIC_API_KEY")
    EMERGENT_LLM_KEY: Optional[str] = os.environ.get("EMERGENT_LLM_KEY")
    
    # CORS
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    
    # App
    APP_NAME: str = "Guardian News API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.environ.get("DEBUG", "false").lower() == "true"
    
    def validate(self) -> list[str]:
        """Validate required environment variables."""
        errors = []
        if not self.MONGO_URL:
            errors.append("MONGO_URL is required")
        return errors
    
    @property
    def cors_origins(self) -> list[str]:
        """Get allowed CORS origins."""
        origins = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ]
        if self.FRONTEND_URL:
            origins.append(self.FRONTEND_URL)
            # Also allow www subdomain if applicable
            if self.FRONTEND_URL.startswith("https://"):
                domain = self.FRONTEND_URL.replace("https://", "")
                origins.append(f"https://www.{domain}")
        return origins


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
