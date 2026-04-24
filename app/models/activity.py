from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text

from app.core.database import Base


class ActivityEvent(Base):
    """Append-only product analytics event."""

    __tablename__ = "activity_events"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(80), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    session_id = Column(String(128), nullable=True, index=True)
    page_path = Column(String(500), nullable=True, index=True)
    referrer_path = Column(String(500), nullable=True)
    funnel_step = Column(String(80), nullable=True, index=True)
    metadata_json = Column("metadata", JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self) -> str:
        return f"<ActivityEvent(id={self.id}, event={self.event_name}, user_id={self.user_id})>"


class UserSession(Base):
    """Best-effort SaaS session summary derived from page views and events."""

    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(128), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    last_seen_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    ended_at = Column(DateTime, nullable=True)
    last_page_path = Column(String(500), nullable=True, index=True)
    referrer_path = Column(String(500), nullable=True)
    user_agent = Column(String(500), nullable=True)
    ip_address = Column(String(45), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    def __repr__(self) -> str:
        return f"<UserSession(session_id={self.session_id}, user_id={self.user_id})>"


class AdminAuditLog(Base):
    """Audit log for sensitive admin actions."""

    __tablename__ = "admin_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    target_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    metadata_json = Column("metadata", JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self) -> str:
        return f"<AdminAuditLog(action={self.action}, admin_user_id={self.admin_user_id})>"
