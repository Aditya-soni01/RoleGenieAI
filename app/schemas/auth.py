from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Request schema for login endpoint."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=1, description="User password")


class Token(BaseModel):
    """
    JWT token response schema.
    
    Returned to client after successful authentication.
    Contains access token and refresh token with their types.
    """

    access_token: str = Field(
        ..., description="JWT access token for API requests"
    )
    refresh_token: Optional[str] = Field(
        default=None, description="JWT refresh token for obtaining new access tokens"
    )
    token_type: str = Field(
        default="bearer", description="Token type (always 'bearer' for JWT)"
    )
    expires_in: int = Field(
        ..., description="Access token expiration time in seconds"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800,
            }
        }


class TokenData(BaseModel):
    """
    JWT token payload schema.
    
    Extracted from JWT token during authentication.
    Contains user identification and token metadata.
    """

    user_id: str = Field(..., description="Unique user identifier (string from JWT sub claim)")
    email: Optional[str] = Field(default=None, description="User email address")
    token_type: str = Field(
        default="access", description="Token type: 'access' or 'refresh'"
    )
    exp: Optional[datetime] = Field(
        default=None, description="Token expiration datetime"
    )
    iat: Optional[datetime] = Field(
        default=None, description="Token issued-at datetime"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "email": "user@example.com",
                "token_type": "access",
                "exp": "2024-01-15T12:30:00",
                "iat": "2024-01-15T12:00:00",
            }
        }


class LoginResponse(BaseModel):
    """
    Complete login response schema.
    
    Returned after successful authentication.
    Includes tokens, user info, and session metadata.
    """

    access_token: str = Field(
        ..., description="JWT access token for API requests"
    )
    refresh_token: Optional[str] = Field(
        default=None, description="JWT refresh token for obtaining new access tokens"
    )
    token_type: str = Field(
        default="bearer", description="Token type (always 'bearer' for JWT)"
    )
    expires_in: int = Field(
        ..., description="Access token expiration time in seconds"
    )
    user_id: int = Field(..., description="Authenticated user ID")
    email: str = Field(..., description="Authenticated user email")
    full_name: str = Field(..., description="Authenticated user full name")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800,
                "user_id": 1,
                "email": "user@example.com",
                "full_name": "John Doe",
            }
        }


class TokenRefreshRequest(BaseModel):
    """
    Request schema for refresh token endpoint.
    
    Used to obtain a new access token using a valid refresh token.
    """

    refresh_token: str = Field(
        ..., description="Valid refresh token from previous login"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            }
        }