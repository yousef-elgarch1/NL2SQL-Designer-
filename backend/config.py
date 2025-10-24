"""
Configuration settings for NL2SQL Generator
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os
from pathlib import Path

# Get the directory where this file is located
BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    """Application settings"""

    # API Settings
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "NL2SQL Generator"
    VERSION: str = "1.0.0"

    # CORS Settings
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000"]

    # LLM Settings (Ollama - SLOW on CPU)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL_PRIMARY: str = "llama3.1:70b"  # For complex tasks
    OLLAMA_MODEL_SECONDARY: str = "llama3.1:8b"  # For simple tasks
    OLLAMA_TIMEOUT: int = 120  # seconds

    # LLM Settings (Groq - SUPER FAST!)
    GROQ_API_KEY: Optional[str] = None  # Get free key at https://console.groq.com
    USE_GROQ: bool = False  # Will be set to True from .env file

    # PlantUML Settings
    PLANTUML_SERVER_URL: str = "http://www.plantuml.com/plantuml"

    # Database Settings (for user databases, not our internal DB)
    SUPPORTED_DATABASES: list = ["postgresql", "mysql", "oracle", "sqlserver"]
    DEFAULT_DATABASE: str = "postgresql"

    # File Storage
    UPLOAD_DIR: str = "./uploads"
    EXPORT_DIR: str = "./exports"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    # Diagram Settings
    DEFAULT_DIAGRAM_FORMAT: str = "mermaid"  # "plantuml" or "mermaid"
    DIAGRAM_RENDER_TIMEOUT: int = 30  # seconds

    # Validation Settings
    MAX_ENTITIES: int = 50
    MAX_RELATIONSHIPS: int = 100
    MAX_ATTRIBUTES_PER_ENTITY: int = 30

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore'
    )


# Global settings instance
settings = Settings()

# Debug print
print(f"[CONFIG] Loaded .env from: {BASE_DIR / '.env'}")
print(f"[CONFIG] GROQ_API_KEY present: {bool(settings.GROQ_API_KEY)}")
print(f"[CONFIG] USE_GROQ: {settings.USE_GROQ}")
