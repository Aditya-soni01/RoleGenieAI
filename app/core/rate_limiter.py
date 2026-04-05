app/core/rate_limiter.py

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

from app.models.ai_request_log import AIRequestLog

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Rate limiter for AI API calls using database log counts.
    
    Enforces limits on:
    - Requests per minute (burst protection)
    - Requests per day (daily quota)
    
    Uses AIRequestLog table to track usage without external dependencies.
    """

    def __init__(
        self,
        max_requests_per_minute: int = 10,
        max_requests_per_day: int = 100,
    ):
        """
        Initialize rate limiter with configurable limits.

        Args:
            max_requests_per_minute: Maximum API calls per minute per user
            max_requests_per_day: Maximum API calls per day per user
        """
        self.max_requests_per_minute = max_requests_per_minute
        self.max_requests_per_day = max_requests_per_day

    def check_rate_limit(
        self,
        user_id: int,
        db: Session,
    ) -> tuple[bool, dict]:
        """
        Check if user has exceeded rate limits.

        Args:
            user_id: ID of the user making the request
            db: Database session

        Returns:
            Tuple of (is_allowed: bool, details: dict)
            details contains: remaining_today, remaining_minute, reset_time
        """
        now = datetime.utcnow()
        one_minute_ago = now - timedelta(minutes=1)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        requests_last_minute = db.query(func.count(AIRequestLog.id)).filter(
            AIRequestLog.user_id == user_id,
            AIRequestLog.created_at >= one_minute_ago,
        ).scalar() or 0

        requests_today = db.query(func.count(AIRequestLog.id)).filter(
            AIRequestLog.user_id == user_id,
            AIRequestLog.created_at >= today_start,
        ).scalar() or 0

        remaining_minute = max(0, self.max_requests_per_minute - requests_last_minute)
        remaining_today = max(0, self.max_requests_per_day - requests_today)

        minute_limit_exceeded = requests_last_minute >= self.max_requests_per_minute
        daily_limit_exceeded = requests_today >= self.max_requests_per_day

        is_allowed = not (minute_limit_exceeded or daily_limit_exceeded)

        reset_minute = (now + timedelta(minutes=1)).isoformat()
        reset_day = (today_start + timedelta(days=1)).isoformat()

        details = {
            "is_allowed": is_allowed,
            "requests_last_minute": requests_last_minute,
            "requests_today": requests_today,
            "remaining_minute": remaining_minute,
            "remaining_today": remaining_today,
            "reset_minute": reset_minute,
            "reset_day": reset_day,
            "minute_limit_exceeded": minute_limit_exceeded,
            "daily_limit_exceeded": daily_limit_exceeded,
        }

        return is_allowed, details

    def log_request(
        self,
        user_id: int,
        request_type: str,
        db: Session,
        model_used: str = None,
        input_tokens: int = 0,
        output_tokens: int = 0,
        response_time_ms: float = 0,
    ) -> AIRequestLog:
        """
        Log an AI API request to the database.

        Args:
            user_id: ID of the user making the request
            request_type: Type of AI request (from AIRequestType enum)
            db: Database session
            model_used: Model identifier (e.g., claude-3-5-sonnet)
            input_tokens: Number of input tokens used
            output_tokens: Number of output tokens used
            response_time_ms: Response time in milliseconds

        Returns:
            Created AIRequestLog record
        """
        log_entry = AIRequestLog(
            user_id=user_id,
            request_type=request_type,
            model_used=model_used,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            response_time_ms=response_time_ms,
            created_at=datetime.utcnow(),
        )

        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)

        logger.info(
            f"Logged AI request for user {user_id}: type={request_type}, "
            f"tokens_in={input_tokens}, tokens_out={output_tokens}"
        )

        return log_entry

    def get_user_usage_stats(
        self,
        user_id: int,
        db: Session,
        days: int = 30,
    ) -> dict:
        """
        Get comprehensive usage statistics for a user.

        Args:
            user_id: ID of the user
            db: Database session
            days: Number of days to look back (default: 30)

        Returns:
            Dictionary with usage statistics
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        total_requests = db.query(func.count(AIRequestLog.id)).filter(
            AIRequestLog.user_id == user_id,
            AIRequestLog.created_at >= cutoff_date,
        ).scalar() or 0

        total_input_tokens = db.query(func.sum(AIRequestLog.input_tokens)).filter(
            AIRequestLog.user_id == user_id,
            AIRequestLog.created_at >= cutoff_date,
        ).scalar() or 0

        total_output_tokens = db.query(func.sum(AIRequestLog.output_tokens)).filter(
            AIRequestLog.user_id == user_id,
            AIRequestLog.created_at >= cutoff_date,
        ).scalar() or 0

        avg_response_time = db.query(func.avg(AIRequestLog.response_time_ms)).filter(
            AIRequestLog.user_id == user_id,
            AIRequestLog.created_at >= cutoff_date,
        ).scalar() or 0

        requests_by_type = db.query(
            AIRequestLog.request_type,
            func.count(AIRequestLog.id).label("count"),
        ).filter(
            AIRequestLog.user_id == user_id,
            AIRequestLog.created_at >= cutoff_date,
        ).group_by(AIRequestLog.request_type).all()

        type_breakdown = {
            request_type: count for request_type, count in requests_by_type
        }

        return {
            "user_id": user_id,
            "period_days": days,
            "total_requests": total_requests,
            "total_input_tokens": int(total_input_tokens),
            "total_output_tokens": int(total_output_tokens),
            "avg_response_time_ms": float(avg_response_time),
            "requests_by_type": type_breakdown,
        }