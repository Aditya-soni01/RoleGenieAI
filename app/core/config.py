from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables with type validation.
    Uses Pydantic v2 BaseSettings for configuration management.
    """

    # Security
    secret_key: str = Field(
        ..., min_length=32, description="Secret key for JWT token signing"
    )
    algorithm: str = Field(default="HS256", description="JWT algorithm")

    # Database
    database_url: str = Field(
        default="sqlite:///./ai_job_assistant.db",
        description="SQLAlchemy database URL",
    )
    db_echo: bool = Field(
        default=False, description="Enable SQLAlchemy query logging"
    )

    # JWT Authentication
    access_token_expire_minutes: int = Field(
        default=30, ge=1, description="Access token expiration in minutes"
    )
    refresh_token_expire_days: int = Field(
        default=7, ge=1, description="Refresh token expiration in days"
    )

    # CORS
    allowed_origins: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ],
        description="Comma-separated list of allowed CORS origins",
    )

    # Application
    app_name: str = Field(default="AI Job Assistant API", description="Application name")
    app_env: str = Field(
        default="development", description="Application environment (development|staging|production)"
    )
    debug: bool = Field(default=False, description="Debug mode enabled")
    log_level: str = Field(default="INFO", description="Logging level")

    # API Metadata
    api_version: str = Field(default="1.0.0", description="API version string")

    # API Documentation
    docs_url: str = Field(default="/docs", description="Swagger UI documentation URL")
    redoc_url: str = Field(default="/redoc", description="ReDoc documentation URL")
    openapi_url: str = Field(default="/openapi.json", description="OpenAPI schema URL")

    # Rate Limiting
    rate_limit_enabled: bool = Field(
        default=False, description="Enable rate limiting"
    )
    rate_limit_requests: int = Field(
        default=100, ge=1, description="Number of requests allowed per period"
    )
    rate_limit_period_seconds: int = Field(
        default=60, ge=1, description="Rate limit period in seconds"
    )

    # External APIs
    openai_api_key: str = Field(
        default="", description="OpenAI API key for AI integrations"
    )
    anthropic_api_key: str = Field(
        default="", description="Anthropic API key for Claude integrations"
    )

    # OAuth — Google
    google_client_id: str = Field(default="", description="Google OAuth client ID")
    google_client_secret: str = Field(default="", description="Google OAuth client secret")

    # OAuth — GitHub
    github_client_id: str = Field(default="", description="GitHub OAuth client ID")
    github_client_secret: str = Field(default="", description="GitHub OAuth client secret")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: str | List[str]) -> List[str]:
        """Parse comma-separated string of origins into list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @field_validator("app_env")
    @classmethod
    def validate_app_env(cls, v: str) -> str:
        """Validate that app_env is one of allowed values."""
        allowed_envs = {"development", "staging", "production"}
        if v.lower() not in allowed_envs:
            raise ValueError(
                f"app_env must be one of {allowed_envs}, got {v}"
            )
        return v.lower()

    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate that log_level is a valid logging level."""
        valid_levels = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if v.upper() not in valid_levels:
            raise ValueError(
                f"log_level must be one of {valid_levels}, got {v}"
            )
        return v.upper()

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.app_env == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.app_env == "development"


settings = Settings()