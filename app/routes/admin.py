from datetime import datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, Token
from app.services.analytics_service import AnalyticsService
from app.services.auth_service import AuthService, get_current_admin

router = APIRouter()
auth_service = AuthService()


class AdminBootstrapRequest(BaseModel):
    token: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=255)
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    first_name: str = Field(default="Admin", min_length=1, max_length=100)
    last_name: str = Field(default="User", min_length=1, max_length=100)


class AdminUserStatusUpdate(BaseModel):
    is_active: bool


def _issue_token(user: User) -> Token:
    access_token = auth_service.create_access_token(
        data={"sub": str(user.id), "email": user.email, "is_admin": bool(user.is_admin)}
    )
    refresh_token = auth_service.create_refresh_token(
        data={"sub": str(user.id), "email": user.email, "is_admin": bool(user.is_admin)}
    )
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
    )


def _available_username(db: Session, email: str, preferred: Optional[str]) -> str:
    base = (preferred or email.split("@")[0] or "admin").strip().lower().replace(" ", "_")
    candidate = base[:50]
    suffix = 1
    while db.query(User).filter(User.username == candidate).first():
        suffix += 1
        candidate = f"{base[:45]}_{suffix}"
    return candidate


@router.post("/bootstrap", response_model=Token, status_code=status.HTTP_201_CREATED)
def bootstrap_first_admin(
    payload: AdminBootstrapRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    """Create or promote the first admin account using ADMIN_BOOTSTRAP_TOKEN."""
    if not settings.admin_bootstrap_token or payload.token != settings.admin_bootstrap_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin bootstrap token")

    if db.query(User).filter(User.is_admin.is_(True)).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An admin account already exists")

    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        user.is_admin = True
        user.is_active = True
        user.hashed_password = auth_service.hash_password(payload.password)
        user.first_name = user.first_name or payload.first_name
        user.last_name = user.last_name or payload.last_name
    else:
        user = User(
            email=payload.email,
            username=_available_username(db, payload.email, payload.username),
            hashed_password=auth_service.hash_password(payload.password),
            first_name=payload.first_name,
            last_name=payload.last_name,
            is_active=True,
            is_admin=True,
        )
        db.add(user)

    user.last_login_at = datetime.utcnow()
    user.last_activity_at = user.last_login_at
    db.commit()
    db.refresh(user)

    AnalyticsService.log_admin_action(
        db,
        admin_user_id=user.id,
        action="admin_bootstrap",
        target_user_id=user.id,
        request=request,
    )
    AnalyticsService.log_event(
        db,
        "login",
        user_id=user.id,
        funnel_step="login",
        metadata={"admin": True, "bootstrap": True},
        request=request,
    )
    return _issue_token(user)


@router.post("/login", response_model=Token)
def admin_login(
    credentials: LoginRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    """Authenticate an admin user with the existing JWT auth mechanism."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not auth_service.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin account is deactivated")
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")

    user.last_login_at = datetime.utcnow()
    user.last_activity_at = user.last_login_at
    db.commit()
    db.refresh(user)

    AnalyticsService.log_event(
        db,
        "login",
        user_id=user.id,
        funnel_step="login",
        metadata={"admin": True},
        request=request,
    )
    return _issue_token(user)


@router.get("/dashboard")
def get_dashboard_stats(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    return AnalyticsService.dashboard_stats(db)


@router.get("/users")
def list_users(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=25, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    plan_tier: Optional[str] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, pattern="^(active|inactive)$"),
    paid_filter: Optional[str] = Query(default=None, pattern="^(free|paid)$"),
    signup_from: Optional[datetime] = Query(default=None),
    signup_to: Optional[datetime] = Query(default=None),
):
    return AnalyticsService.list_users(
        db,
        page=page,
        per_page=per_page,
        search=search,
        plan_tier=plan_tier,
        status_filter=status_filter,
        paid_filter=paid_filter,
        signup_from=signup_from,
        signup_to=signup_to,
    )


@router.get("/users/{user_id}")
def get_user_detail(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    detail = AnalyticsService.user_detail(db, user_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return detail


@router.get("/users/{user_id}/activity")
def get_user_activity(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    detail = AnalyticsService.user_detail(db, user_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"recent_events": detail["recent_events"], "sessions": detail["sessions"]}


@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    payload: AdminUserStatusUpdate,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current_admin.id and not payload.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admins cannot deactivate themselves")

    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)

    AnalyticsService.log_admin_action(
        db,
        admin_user_id=current_admin.id,
        action="user_reactivated" if payload.is_active else "user_deactivated",
        target_user_id=user.id,
        metadata={"email": user.email},
        request=request,
    )
    return {"id": user.id, "is_active": user.is_active}


@router.get("/analytics/funnel")
def get_funnel_analytics(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    return {"funnel": AnalyticsService.funnel_summary(db)}


@router.get("/analytics/top-exit-pages")
def get_top_exit_pages(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
    limit: int = Query(default=10, ge=1, le=50),
):
    return {"top_exit_pages": AnalyticsService.top_exit_pages(db, limit=limit)}


@router.get("/subscriptions")
def get_subscriptions_summary(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    return AnalyticsService.subscriptions_summary(db)


@router.get("/events")
def get_recent_events(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
    limit: int = Query(default=25, ge=1, le=100),
):
    return {"events": AnalyticsService.recent_events(db, limit=limit)}


@router.get("/errors")
def get_errors_summary(
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(get_current_admin)],
):
    return AnalyticsService.errors_summary(db)


@router.get("/settings")
def get_admin_settings(current_admin: Annotated[User, Depends(get_current_admin)]):
    return {
        "app_env": settings.app_env,
        "admin_bootstrap_configured": bool(settings.admin_bootstrap_token),
        "current_admin": {
            "id": current_admin.id,
            "email": current_admin.email,
            "username": current_admin.username,
        },
    }
