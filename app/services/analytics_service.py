from datetime import datetime, timedelta
import logging
from typing import Any, Optional

from fastapi import Request
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from app.models.activity import ActivityEvent, AdminAuditLog, UserSession
from app.models.ai_request_log import AIRequestLog
from app.models.resume import Resume
from app.models.user import User

logger = logging.getLogger(__name__)


FUNNEL_EVENTS = [
    "signup_started",
    "signup_completed",
    "login",
    "resume_uploaded",
    "jd_pasted",
    "optimization_started",
    "optimization_completed",
    "preview_opened",
    "pdf_downloaded",
    "docx_downloaded",
    "pricing_viewed",
    "checkout_started",
    "payment_success",
]


class AnalyticsService:
    """Product analytics helpers for append-only events and admin reporting."""

    @staticmethod
    def _request_ip(request: Optional[Request]) -> Optional[str]:
        if not request or not request.client:
            return None
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.client.host

    @staticmethod
    def _user_agent(request: Optional[Request]) -> Optional[str]:
        if not request:
            return None
        user_agent = request.headers.get("user-agent")
        return user_agent[:500] if user_agent else None

    @staticmethod
    def _event_to_dict(event: ActivityEvent, user_lookup: Optional[dict[int, User]] = None) -> dict[str, Any]:
        user = user_lookup.get(event.user_id) if user_lookup and event.user_id else None
        return {
            "id": event.id,
            "event_name": event.event_name,
            "user_id": event.user_id,
            "user_email": user.email if user else None,
            "session_id": event.session_id,
            "page_path": event.page_path,
            "referrer_path": event.referrer_path,
            "funnel_step": event.funnel_step,
            "metadata": event.metadata_json or {},
            "created_at": event.created_at.isoformat() if event.created_at else None,
        }

    @staticmethod
    def log_event(
        db: Session,
        event_name: str,
        *,
        user_id: Optional[int] = None,
        session_id: Optional[str] = None,
        page_path: Optional[str] = None,
        referrer_path: Optional[str] = None,
        funnel_step: Optional[str] = None,
        metadata: Optional[dict[str, Any]] = None,
        request: Optional[Request] = None,
    ) -> Optional[ActivityEvent]:
        """Write an append-only event and update the best-effort session summary."""
        try:
            now = datetime.utcnow()
            ip_address = AnalyticsService._request_ip(request)
            user_agent = AnalyticsService._user_agent(request)

            event = ActivityEvent(
                event_name=event_name,
                user_id=user_id,
                session_id=session_id,
                page_path=page_path,
                referrer_path=referrer_path,
                funnel_step=funnel_step or event_name,
                metadata_json=metadata or {},
                ip_address=ip_address,
                user_agent=user_agent,
                created_at=now,
            )
            db.add(event)

            if session_id:
                session = db.query(UserSession).filter(UserSession.session_id == session_id).first()
                if not session:
                    session = UserSession(
                        session_id=session_id,
                        user_id=user_id,
                        started_at=now,
                        last_seen_at=now,
                        last_page_path=page_path,
                        referrer_path=referrer_path,
                        user_agent=user_agent,
                        ip_address=ip_address,
                    )
                    db.add(session)
                else:
                    if user_id and not session.user_id:
                        session.user_id = user_id
                    session.last_seen_at = now
                    if page_path:
                        session.last_page_path = page_path
                    if referrer_path:
                        session.referrer_path = referrer_path
                    if event_name == "logout":
                        session.ended_at = now
                        session.is_active = False

            if user_id:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    user.last_activity_at = now

            db.commit()
            db.refresh(event)
            return event
        except Exception as exc:
            db.rollback()
            logger.warning("Failed to log analytics event %s: %s", event_name, exc, exc_info=True)
            return None

    @staticmethod
    def log_admin_action(
        db: Session,
        *,
        admin_user_id: int,
        action: str,
        target_user_id: Optional[int] = None,
        metadata: Optional[dict[str, Any]] = None,
        request: Optional[Request] = None,
    ) -> None:
        try:
            db.add(
                AdminAuditLog(
                    admin_user_id=admin_user_id,
                    action=action,
                    target_user_id=target_user_id,
                    metadata_json=metadata or {},
                    ip_address=AnalyticsService._request_ip(request),
                )
            )
            db.commit()
        except Exception as exc:
            db.rollback()
            logger.warning("Failed to write admin audit log %s: %s", action, exc, exc_info=True)

    @staticmethod
    def dashboard_stats(db: Session) -> dict[str, Any]:
        now = datetime.utcnow()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)

        def user_count_since(since: datetime) -> int:
            return db.query(func.count(User.id)).filter(User.created_at >= since).scalar() or 0

        def active_count_since(since: datetime) -> int:
            event_count = (
                db.query(func.count(func.distinct(ActivityEvent.user_id)))
                .filter(ActivityEvent.user_id.isnot(None), ActivityEvent.created_at >= since)
                .scalar()
                or 0
            )
            if event_count:
                return event_count
            return db.query(func.count(User.id)).filter(User.last_activity_at >= since).scalar() or 0

        total_users = db.query(func.count(User.id)).scalar() or 0
        free_users = db.query(func.count(User.id)).filter(User.plan_tier == "starter").scalar() or 0
        paid_users = total_users - free_users
        resume_uploads = db.query(func.count(Resume.id)).scalar() or 0
        optimized_resumes = db.query(func.count(Resume.id)).filter(Resume.optimized_content.isnot(None)).scalar() or 0
        completed_events = (
            db.query(func.count(ActivityEvent.id))
            .filter(ActivityEvent.event_name == "optimization_completed")
            .scalar()
            or 0
        )
        downloads = (
            db.query(func.count(ActivityEvent.id))
            .filter(ActivityEvent.event_name.in_(["pdf_downloaded", "docx_downloaded"]))
            .scalar()
            or 0
        )

        funnel = AnalyticsService.funnel_summary(db)
        top_exit_pages = AnalyticsService.top_exit_pages(db, limit=1)
        most_common_drop_off_page = top_exit_pages[0]["page_path"] if top_exit_pages else None

        return {
            "total_users": total_users,
            "new_users": {
                "today": user_count_since(today),
                "seven_days": user_count_since(now - timedelta(days=7)),
                "thirty_days": user_count_since(now - timedelta(days=30)),
            },
            "active_users": {
                "today": active_count_since(today),
                "seven_days": active_count_since(now - timedelta(days=7)),
                "thirty_days": active_count_since(now - timedelta(days=30)),
            },
            "free_users": free_users,
            "paid_users": paid_users,
            "resume_uploads_count": resume_uploads,
            "resume_optimizations_count": max(optimized_resumes, completed_events),
            "downloads_count": downloads,
            "conversion_funnel": funnel,
            "most_common_drop_off_page": most_common_drop_off_page,
            "recent_activity_feed": AnalyticsService.recent_events(db, limit=10),
        }

    @staticmethod
    def list_users(
        db: Session,
        *,
        page: int = 1,
        per_page: int = 25,
        search: Optional[str] = None,
        plan_tier: Optional[str] = None,
        status_filter: Optional[str] = None,
        paid_filter: Optional[str] = None,
        signup_from: Optional[datetime] = None,
        signup_to: Optional[datetime] = None,
    ) -> dict[str, Any]:
        query = db.query(User)

        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(User.email.ilike(term), User.username.ilike(term), User.first_name.ilike(term), User.last_name.ilike(term))
            )
        if plan_tier:
            query = query.filter(User.plan_tier == plan_tier)
        if status_filter == "active":
            query = query.filter(User.is_active.is_(True))
        elif status_filter == "inactive":
            query = query.filter(User.is_active.is_(False))
        if paid_filter == "free":
            query = query.filter(User.plan_tier == "starter")
        elif paid_filter == "paid":
            query = query.filter(User.plan_tier != "starter")
        if signup_from:
            query = query.filter(User.created_at >= signup_from)
        if signup_to:
            query = query.filter(User.created_at <= signup_to)

        total = query.count()
        users = (
            query.order_by(User.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )

        user_ids = [user.id for user in users]
        resume_counts = dict(
            db.query(Resume.user_id, func.count(Resume.id))
            .filter(Resume.user_id.in_(user_ids))
            .group_by(Resume.user_id)
            .all()
        ) if user_ids else {}
        event_counts = dict(
            db.query(ActivityEvent.user_id, func.count(ActivityEvent.id))
            .filter(ActivityEvent.user_id.in_(user_ids))
            .group_by(ActivityEvent.user_id)
            .all()
        ) if user_ids else {}

        return {
            "items": [
                {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_active": user.is_active,
                    "is_admin": user.is_admin,
                    "plan_tier": user.plan_tier,
                    "paid_status": "paid" if user.plan_tier != "starter" else "free",
                    "created_at": user.created_at.isoformat() if user.created_at else None,
                    "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
                    "last_activity_at": user.last_activity_at.isoformat() if user.last_activity_at else None,
                    "resume_count": resume_counts.get(user.id, 0),
                    "event_count": event_counts.get(user.id, 0),
                }
                for user in users
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page if per_page else 0,
        }

    @staticmethod
    def user_detail(db: Session, user_id: int) -> Optional[dict[str, Any]]:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        recent_events = (
            db.query(ActivityEvent)
            .filter(ActivityEvent.user_id == user.id)
            .order_by(ActivityEvent.created_at.desc())
            .limit(25)
            .all()
        )
        sessions = (
            db.query(UserSession)
            .filter(UserSession.user_id == user.id)
            .order_by(UserSession.last_seen_at.desc())
            .limit(10)
            .all()
        )

        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "is_admin": user.is_admin,
                "plan_tier": user.plan_tier,
                "subscription_status": "active_paid" if user.plan_tier != "starter" else "free",
                "profile_headline": user.profile_headline,
                "location": user.location,
                "profile_completeness": user.profile_completeness,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
                "last_activity_at": user.last_activity_at.isoformat() if user.last_activity_at else None,
            },
            "counts": {
                "resumes": db.query(func.count(Resume.id)).filter(Resume.user_id == user.id).scalar() or 0,
                "optimizations": (
                    db.query(func.count(Resume.id))
                    .filter(Resume.user_id == user.id, Resume.optimized_content.isnot(None))
                    .scalar()
                    or 0
                ),
                "events": db.query(func.count(ActivityEvent.id)).filter(ActivityEvent.user_id == user.id).scalar() or 0,
                "sessions": db.query(func.count(UserSession.id)).filter(UserSession.user_id == user.id).scalar() or 0,
            },
            "recent_events": [AnalyticsService._event_to_dict(event) for event in recent_events],
            "sessions": [
                {
                    "session_id": session.session_id,
                    "started_at": session.started_at.isoformat() if session.started_at else None,
                    "last_seen_at": session.last_seen_at.isoformat() if session.last_seen_at else None,
                    "ended_at": session.ended_at.isoformat() if session.ended_at else None,
                    "last_page_path": session.last_page_path,
                    "referrer_path": session.referrer_path,
                    "is_active": session.is_active,
                }
                for session in sessions
            ],
        }

    @staticmethod
    def funnel_summary(db: Session, *, since: Optional[datetime] = None) -> list[dict[str, Any]]:
        query = db.query(ActivityEvent.event_name, func.count(ActivityEvent.id)).filter(ActivityEvent.event_name.in_(FUNNEL_EVENTS))
        if since:
            query = query.filter(ActivityEvent.created_at >= since)
        counts = dict(query.group_by(ActivityEvent.event_name).all())
        return [{"event_name": event_name, "count": counts.get(event_name, 0)} for event_name in FUNNEL_EVENTS]

    @staticmethod
    def top_exit_pages(db: Session, *, limit: int = 10) -> list[dict[str, Any]]:
        rows = (
            db.query(UserSession.last_page_path, func.count(UserSession.id))
            .filter(and_(UserSession.last_page_path.isnot(None), UserSession.last_page_path != ""))
            .group_by(UserSession.last_page_path)
            .order_by(func.count(UserSession.id).desc())
            .limit(limit)
            .all()
        )
        return [{"page_path": page_path, "sessions": count} for page_path, count in rows]

    @staticmethod
    def recent_events(db: Session, *, limit: int = 25) -> list[dict[str, Any]]:
        events = db.query(ActivityEvent).order_by(ActivityEvent.created_at.desc()).limit(limit).all()
        user_ids = {event.user_id for event in events if event.user_id}
        users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
        user_lookup = {user.id: user for user in users}
        return [AnalyticsService._event_to_dict(event, user_lookup) for event in events]

    @staticmethod
    def subscriptions_summary(db: Session) -> dict[str, Any]:
        plan_rows = db.query(User.plan_tier, func.count(User.id)).group_by(User.plan_tier).all()
        plan_counts = {plan or "starter": count for plan, count in plan_rows}
        total = sum(plan_counts.values())
        paid = sum(count for plan, count in plan_counts.items() if plan != "starter")
        return {
            "plan_counts": plan_counts,
            "free_users": plan_counts.get("starter", 0),
            "paid_users": paid,
            "total_users": total,
            "paid_conversion_rate": round((paid / total) * 100, 2) if total else 0,
            "notes": "Billing provider integration is not wired yet; subscription status is derived from users.plan_tier.",
        }

    @staticmethod
    def errors_summary(db: Session) -> dict[str, Any]:
        failed_events = (
            db.query(ActivityEvent.event_name, func.count(ActivityEvent.id))
            .filter(ActivityEvent.event_name.in_(["optimization_failed", "payment_failed"]))
            .group_by(ActivityEvent.event_name)
            .all()
        )
        ai_errors = (
            db.query(func.count(AIRequestLog.id))
            .filter(AIRequestLog.status.in_(["error", "failed"]))
            .scalar()
            or 0
        )
        return {
            "failed_event_counts": {name: count for name, count in failed_events},
            "ai_error_count": ai_errors,
            "todo": "Wire server exception aggregation here when centralized error reporting is added.",
        }
