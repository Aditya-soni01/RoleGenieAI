from typing import Annotated, Any, Optional

from fastapi import APIRouter, Depends, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.services.analytics_service import AnalyticsService
from app.services.auth_service import get_optional_current_user

router = APIRouter()


class ActivityEventCreate(BaseModel):
    event_name: str = Field(..., min_length=2, max_length=80)
    session_id: Optional[str] = Field(default=None, max_length=128)
    page_path: Optional[str] = Field(default=None, max_length=500)
    referrer_path: Optional[str] = Field(default=None, max_length=500)
    funnel_step: Optional[str] = Field(default=None, max_length=80)
    metadata: dict[str, Any] = Field(default_factory=dict)


@router.post("/events", status_code=status.HTTP_202_ACCEPTED)
def record_event(
    payload: ActivityEventCreate,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[Optional[User], Depends(get_optional_current_user)] = None,
):
    """Record a product analytics event from the frontend."""
    event = AnalyticsService.log_event(
        db,
        payload.event_name,
        user_id=current_user.id if current_user else None,
        session_id=payload.session_id,
        page_path=payload.page_path,
        referrer_path=payload.referrer_path,
        funnel_step=payload.funnel_step,
        metadata=payload.metadata,
        request=request,
    )
    return {"accepted": event is not None}
