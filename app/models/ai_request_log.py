from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Enum
from sqlalchemy.dialects.sqlite import JSON
import enum
from app.core.database import Base


class AIRequestType(str, enum.Enum):
    """Enum for types of AI requests."""
    RESUME_OPTIMIZE = "resume_optimize"
    COVER_LETTER = "cover_letter"
    JOB_MATCH = "job_match"
    CONVERSATION = "conversation"


class AIRequestLog(Base):
    """
    SQLAlchemy model for logging AI API requests per user.
    
    Used for:
    - Rate limiting enforcement
    - Usage analytics and reporting
    - Audit trail of AI interactions
    - Cost tracking per user
    """

    __tablename__ = "ai_request_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    request_type = Column(String(50), nullable=False)
    request_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    response_timestamp = Column(DateTime, nullable=True)
    status = Column(String(20), default="pending", nullable=False)
    
    # Request/Response details
    input_text = Column(Text, nullable=False)
    output_text = Column(Text, nullable=True)
    
    # Metrics
    input_tokens = Column(Integer, nullable=True)
    output_tokens = Column(Integer, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    cost_usd = Column(Float, nullable=True)
    
    # Error tracking
    error_message = Column(Text, nullable=True)
    error_code = Column(String(50), nullable=True)
    
    # Metadata
    metadata = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    def __repr__(self) -> str:
        return f"<AIRequestLog(id={self.id}, user_id={self.user_id}, type={self.request_type}, status={self.status})>"

    def to_dict(self) -> dict:
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "request_type": self.request_type,
            "request_timestamp": self.request_timestamp.isoformat() if self.request_timestamp else None,
            "response_timestamp": self.response_timestamp.isoformat() if self.response_timestamp else None,
            "status": self.status,
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "processing_time_ms": self.processing_time_ms,
            "cost_usd": self.cost_usd,
            "error_message": self.error_message,
        }
    
    @property
    def total_tokens(self) -> int:
        """Calculate total tokens used for this request."""
        input_t = self.input_tokens or 0
        output_t = self.output_tokens or 0
        return input_t + output_t
    
    @property
    def is_successful(self) -> bool:
        """Check if request was successful."""
        return self.status == "success"
    
    @property
    def duration_seconds(self) -> float:
        """Calculate duration in seconds."""
        if self.processing_time_ms:
            return self.processing_time_ms / 1000.0
        return 0.0