from datetime import datetime, timedelta, timezone
from typing import Optional
import logging
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import ValidationError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.schemas.auth import TokenData

logger = logging.getLogger(__name__)

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """
    Authentication service handling password operations, JWT token creation/validation,
    and user authentication logic.
    
    This service is responsible for:
    - Hashing and verifying passwords securely
    - Creating JWT access and refresh tokens
    - Validating and decoding JWT tokens
    - Extracting user information from tokens
    """

    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a plaintext password using bcrypt.
        
        Args:
            password: The plaintext password to hash
            
        Returns:
            Hashed password string suitable for storage in database
            
        Raises:
            Exception: If hashing fails
        """
        try:
            return pwd_context.hash(password)
        except Exception as e:
            logger.error(f"Password hashing failed: {str(e)}")
            raise

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a plaintext password against its hashed counterpart.
        
        Args:
            plain_password: The plaintext password to verify
            hashed_password: The hashed password from the database
            
        Returns:
            True if password matches, False otherwise
        """
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            logger.error(f"Password verification failed: {str(e)}")
            return False

    @staticmethod
    def create_access_token(
        data: dict,
        expires_delta: Optional[timedelta] = None,
    ) -> str:
        """
        Create a JWT access token.
        
        Args:
            data: Dictionary containing token claims (e.g., {"sub": user_id})
            expires_delta: Optional custom expiration time. If None, uses settings default
            
        Returns:
            Encoded JWT token as string
            
        Raises:
            Exception: If token creation fails
        """
        try:
            to_encode = data.copy()
            
            if expires_delta:
                expire = datetime.now(timezone.utc) + expires_delta
            else:
                expire = datetime.now(timezone.utc) + timedelta(
                    minutes=settings.access_token_expire_minutes
                )
            
            to_encode.update({"exp": expire, "type": "access"})
            
            encoded_jwt = jwt.encode(
                to_encode,
                settings.secret_key,
                algorithm=settings.algorithm,
            )
            return encoded_jwt
        except Exception as e:
            logger.error(f"Access token creation failed: {str(e)}")
            raise

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """
        Create a JWT refresh token with extended expiration.
        
        Args:
            data: Dictionary containing token claims (e.g., {"sub": user_id})
            
        Returns:
            Encoded JWT refresh token as string
            
        Raises:
            Exception: If token creation fails
        """
        try:
            to_encode = data.copy()
            expire = datetime.now(timezone.utc) + timedelta(
                days=settings.refresh_token_expire_days
            )
            to_encode.update({"exp": expire, "type": "refresh"})
            
            encoded_jwt = jwt.encode(
                to_encode,
                settings.secret_key,
                algorithm=settings.algorithm,
            )
            return encoded_jwt
        except Exception as e:
            logger.error(f"Refresh token creation failed: {str(e)}")
            raise

    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Optional[TokenData]:
        """
        Verify and decode a JWT token.
        
        Args:
            token: The JWT token string to verify
            token_type: Expected token type ("access" or "refresh")
            
        Returns:
            TokenData object containing decoded token claims if valid, None otherwise
            
        Raises:
            JWTError: If token is invalid or signature verification fails
            ValidationError: If token claims don't match expected schema
        """
        try:
            payload = jwt.decode(
                token,
                settings.secret_key,
                algorithms=[settings.algorithm],
            )
            
            # Verify token type matches expected
            if payload.get("type") != token_type:
                logger.warning(f"Token type mismatch: expected {token_type}")
                return None
            
            user_id: str = payload.get("sub")
            if user_id is not None and not str(user_id).isdigit() and payload.get("user_id") is not None:
                user_id = str(payload.get("user_id"))
            if user_id is None:
                logger.warning("Token missing 'sub' claim")
                return None
            
            token_data = TokenData(user_id=str(user_id), email=payload.get("email"))
            return token_data
            
        except JWTError as e:
            logger.warning(f"JWT validation failed: {str(e)}")
            return None
        except ValidationError as e:
            logger.warning(f"Token data validation failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error during token verification: {str(e)}")
            return None

    @staticmethod
    def decode_token(token: str) -> Optional[dict]:
        """
        Decode a JWT token without strict validation (for introspection).
        
        Use this sparingly - prefer verify_token for security-critical operations.
        
        Args:
            token: The JWT token string to decode
            
        Returns:
            Dictionary of decoded claims if successful, None otherwise
        """
        try:
            payload = jwt.decode(
                token,
                settings.secret_key,
                algorithms=[settings.algorithm],
            )
            return payload
        except JWTError as e:
            logger.warning(f"Token decode failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error during token decode: {str(e)}")
            return None

    @staticmethod
    def get_token_expiry_timestamp(token: str) -> Optional[datetime]:
        """
        Extract token expiration timestamp without full verification.
        
        Args:
            token: The JWT token string
            
        Returns:
            datetime object of token expiration, or None if unable to extract
        """
        try:
            payload = jwt.decode(
                token,
                settings.secret_key,
                algorithms=[settings.algorithm],
            )
            exp_timestamp = payload.get("exp")
            if exp_timestamp:
                return datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
        except Exception as e:
            logger.warning(f"Could not extract expiry from token: {str(e)}")
        
        return None


# OAuth2 scheme — token URL matches the login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    FastAPI dependency that extracts and validates the JWT from the
    Authorization header, then loads the corresponding User from the DB.

    Raises HTTPException 401 if the token is missing, invalid, or the
    user no longer exists.
    """
    from app.models.user import User  # local import to avoid circular dependency

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_data = AuthService.verify_token(token, token_type="access")
    if token_data is None:
        raise credentials_exception

    try:
        user_id = int(token_data.user_id)
    except (TypeError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    return user


def get_optional_current_user(
    token: Optional[str] = Depends(optional_oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Return the authenticated user when a valid bearer token is present."""
    if not token:
        return None

    from app.models.user import User  # local import to avoid circular dependency

    token_data = AuthService.verify_token(token, token_type="access")
    if token_data is None:
        return None

    try:
        user_id = int(token_data.user_id)
    except (TypeError, ValueError):
        return None

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        return None

    return user


def get_current_admin(current_user=Depends(get_current_user)):
    """Require the current user to have admin privileges."""
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user
