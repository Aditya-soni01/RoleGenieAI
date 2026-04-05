from datetime import datetime
import logging
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.ai_request_log import AIRequestLog, AIRequestType
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """
    Service layer for AI-powered job assistant features.
    
    Handles:
    - Resume optimization with ATS keyword injection
    - Cover letter generation tailored to jobs
    - Job-resume match scoring and analysis
    - Conversation history management
    - Integration with Anthropic Claude API
    - Request logging and rate limiting
    """

    def __init__(self, db: Session):
        """
        Initialize AI Service with database session.

        Args:
            db: SQLAlchemy database session
        """
        self.db = db
        self.client = self._get_anthropic_client()
        self.rate_limiter = self._init_rate_limiter()

    def _get_anthropic_client(self):
        """
        Initialize Anthropic Claude client.
        
        Returns:
            Anthropic client instance or None if API key not configured
        """
        try:
            from anthropic import Anthropic
            api_key = settings.ANTHROPIC_API_KEY
            if not api_key:
                logger.warning("ANTHROPIC_API_KEY not configured")
                return None
            return Anthropic(api_key=api_key)
        except ImportError:
            logger.warning("anthropic package not installed")
            return None

    def _init_rate_limiter(self):
        """
        Initialize rate limiter for API calls.
        
        Returns:
            RateLimiter instance
        """
        from app.core.rate_limiter import RateLimiter
        return RateLimiter(
            max_requests_per_minute=settings.AI_MAX_REQUESTS_PER_MINUTE,
            max_requests_per_day=settings.AI_MAX_REQUESTS_PER_DAY,
        )

    def check_rate_limit(self, user_id: int) -> tuple[bool, Optional[str]]:
        """
        Check if user has exceeded rate limits.

        Args:
            user_id: User ID to check

        Returns:
            Tuple of (is_allowed: bool, error_message: Optional[str])
        """
        is_allowed, error_msg = self.rate_limiter.check_limits(
            self.db,
            user_id
        )
        return is_allowed, error_msg

    def log_ai_request(
        self,
        user_id: int,
        request_type: AIRequestType,
        model_used: str,
        input_tokens: int,
        output_tokens: int,
        response_time_ms: float,
    ) -> AIRequestLog:
        """
        Log an AI API request to database for rate limiting and analytics.

        Args:
            user_id: User who made the request
            request_type: Type of AI request (enum)
            model_used: Model name (e.g., "claude-3-sonnet-20240229")
            input_tokens: Tokens consumed for input
            output_tokens: Tokens consumed for output
            response_time_ms: API response time in milliseconds

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
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)
        return log_entry

    def call_claude_api(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 2000,
    ) -> dict:
        """
        Make a request to Claude API.

        Args:
            prompt: User prompt/request
            system_prompt: Optional system context
            max_tokens: Maximum tokens in response

        Returns:
            Dict with content, usage, model info
            
        Raises:
            ValueError: If API client not initialized
            Exception: If API call fails
        """
        if not self.client:
            raise ValueError(
                "Anthropic client not initialized. "
                "Check ANTHROPIC_API_KEY configuration."
            )

        try:
            import time
            start_time = time.time()

            messages = [{"role": "user", "content": prompt}]
            kwargs = {
                "model": settings.ANTHROPIC_MODEL,
                "max_tokens": max_tokens,
                "messages": messages,
            }

            if system_prompt:
                kwargs["system"] = system_prompt

            response = self.client.messages.create(**kwargs)

            response_time_ms = (time.time() - start_time) * 1000

            return {
                "content": response.content[0].text,
                "usage": {
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                },
                "model": response.model,
                "response_time_ms": response_time_ms,
            }

        except Exception as e:
            logger.error(f"Claude API call failed: {str(e)}")
            raise

    def optimize_resume(
        self,
        user_id: int,
        resume_text: str,
        job_description: str,
        job_title: str,
    ) -> dict:
        """
        Optimize resume for ATS and job-specific keywords.

        Args:
            user_id: User making the request
            resume_text: Current resume content
            job_description: Target job description
            job_title: Target job title

        Returns:
            Dict with optimized_resume, suggestions, and usage metrics
        """
        # Check rate limit
        is_allowed, error_msg = self.check_rate_limit(user_id)
        if not is_allowed:
            raise ValueError(error_msg)

        # Generate prompt
        from app.prompts.resume_prompts import ResumePrompts
        prompt = ResumePrompts.get_ats_optimization_prompt(
            resume_text=resume_text,
            job_description=job_description,
            job_title=job_title,
        )

        system_prompt = (
            "You are an expert resume writer and ATS optimization specialist. "
            "Provide practical, actionable suggestions for improving resumes. "
            "Format your response as JSON with keys: optimized_resume, keywords_added, improvements"
        )

        # Call Claude API
        result = self.call_claude_api(
            prompt=prompt,
            system_prompt=system_prompt,
            max_tokens=3000,
        )

        # Log the request
        self.log_ai_request(
            user_id=user_id,
            request_type=AIRequestType.RESUME_OPTIMIZE,
            model_used=result["model"],
            input_tokens=result["usage"]["input_tokens"],
            output_tokens=result["usage"]["output_tokens"],
            response_time_ms=result["response_time_ms"],
        )

        return {
            "optimized_content": result["content"],
            "tokens_used": result["usage"]["input_tokens"] + result["usage"]["output_tokens"],
            "response_time_ms": result["response_time_ms"],
        }

    def generate_cover_letter(
        self,
        user_id: int,
        user_name: str,
        user_title: str,
        user_summary: str,
        job_title: str,
        company_name: str,
        job_description: str,
        key_requirements: list[str],
    ) -> dict:
        """
        Generate a tailored cover letter for a specific job.

        Args:
            user_id: User making the request
            user_name: Applicant's full name
            user_title: Current job title
            user_summary: Professional summary
            job_title: Target job title
            company_name: Target company name
            job_description: Full job description
            key_requirements: List of key job requirements

        Returns:
            Dict with generated_letter and usage metrics
        """
        # Check rate limit
        is_allowed, error_msg = self.check_rate_limit(user_id)
        if not is_allowed:
            raise ValueError(error_msg)

        # Generate prompt
        from app.prompts.cover_letter_prompts import CoverLetterPrompts
        prompt = CoverLetterPrompts.get_cover_letter_generation_prompt(
            user_name=user_name,
            user_title=user_title,
            user_summary=user_summary,
            job_title=job_title,
            company_name=company_name,
            job_description=job_description,
            key_requirements=key_requirements,
        )

        system_prompt = (
            "You are an expert cover letter writer. "
            "Write compelling, professional cover letters that highlight relevant skills "
            "and experience. Format the output as a complete, ready-to-send cover letter."
        )

        # Call Claude API
        result = self.call_claude_api(
            prompt=prompt,
            system_prompt=system_prompt,
            max_tokens=2000,
        )

        # Log the request
        self.log_ai_request(
            user_id=user_id,
            request_type=AIRequestType.COVER_LETTER,
            model_used=result["model"],
            input_tokens=result["usage"]["input_tokens"],
            output_tokens=result["usage"]["output_tokens"],
            response_time_ms=result["response_time_ms"],
        )

        return {
            "cover_letter": result["content"],
            "tokens_used": result["usage"]["input_tokens"] + result["usage"]["output_tokens"],
            "response_time_ms": result["response_time_ms"],
        }

    def analyze_job_match(
        self,
        user_id: int,
        resume_text: str,
        job_title: str,
        job_description: str,
        company_name: str,
        required_skills: list[str],
    ) -> dict:
        """
        Analyze job-resume match and provide detailed scoring.

        Args:
            user_id: User making the request
            resume_text: User's resume content
            job_title: Target job title
            job_description: Full job description
            company_name: Company name
            required_skills: List of required skills

        Returns:
            Dict with match_score, breakdown, and recommendations
        """
        # Check rate limit
        is_allowed, error_msg = self.check_rate_limit(user_id)
        if not is_allowed:
            raise ValueError(error_msg)

        # Generate prompt
        from app.prompts.match_score_prompts import MatchScorePrompts
        prompt = MatchScorePrompts.get_match_score_analysis_prompt(
            resume_text=resume_text,
            job_title=job_title,
            job_description=job_description,
            company_name=company_name,
            required_skills=required_skills,
        )

        system_prompt = (
            "You are an expert job market analyst. "
            "Analyze the alignment between a resume and job posting. "
            "Provide a match score (0-100), detailed breakdown by category, and actionable recommendations. "
            "Format your response as JSON with keys: match_score, skills_match, experience_match, "
            "qualifications_match, recommendations"
        )

        # Call Claude API
        result = self.call_claude_api(
            prompt=prompt,
            system_prompt=system_prompt,
            max_tokens=2500,
        )

        # Log the request
        self.log_ai_request(
            user_id=user_id,
            request_type=AIRequestType.JOB_MATCH,
            model_used=result["model"],
            input_tokens=result["usage"]["input_tokens"],
            output_tokens=result["usage"]["output_tokens"],
            response_time_ms=result["response_time_ms"],
        )

        return {
            "analysis": result["content"],
            "tokens_used": result["usage"]["input_tokens"] + result["usage"]["output_tokens"],
            "response_time_ms": result["response_time_ms"],
        }

    def get_user_stats(self, user_id: int) -> dict:
        """
        Get AI usage statistics for a user.

        Args:
            user_id: User ID

        Returns:
            Dict with usage stats by request type and time period
        """
        # Today's requests
        today = datetime.utcnow().date()
        today_count = self.db.query(func.count(AIRequestLog.id)).filter(
            AIRequestLog.user_id == user_id,
            func.date(AIRequestLog.created_at) == today,
        ).scalar() or 0

        # By request type
        by_type = self.db.query(
            AIRequestLog.request_type,
            func.count(AIRequestLog.id).label("count"),
        ).filter(
            AIRequestLog.user_id == user_id,
        ).group_by(AIRequestLog.request_type).all()

        stats_by_type = {
            request_type: count for request_type, count in by_type
        }

        # Total tokens used today
        today_tokens = self.db.query(
            func.sum(AIRequestLog.input_tokens + AIRequestLog.output_tokens)
        ).filter(
            AIRequestLog.user_id == user_id,
            func.date(AIRequestLog.created_at) == today,
        ).scalar() or 0

        return {
            "today_requests": today_count,
            "total_tokens_today": today_tokens,
            "requests_by_type": stats_by_type,
            "rate_limit_remaining": self._get_remaining_quota(user_id),
        }

    def _get_remaining_quota(self, user_id: int) -> dict:
        """
        Calculate remaining quota for rate limits.

        Args:
            user_id: User ID

        Returns:
            Dict with remaining per minute and per day
        """
        from datetime import timedelta
        from app.core.rate_limiter import RateLimiter

        rl = RateLimiter(
            settings.AI_MAX_REQUESTS_PER_MINUTE,
            settings.AI_MAX_REQUESTS_PER_DAY,
        )

        # Count requests in last minute
        one_minute_ago = datetime.utcnow() - timedelta(minutes=1)
        minute_count = self.db.query(func.count(AIRequestLog.id)).filter(
            AIRequestLog.user_id == user_id,
            AIRequestLog.created_at >= one_minute_ago,
        ).scalar() or 0

        # Count requests today
        today = datetime.utcnow().date()
        day_count = self.db.query(func.count(AIRequestLog.id)).filter(
            AIRequestLog.user_id == user_id,
            func.date(AIRequestLog.created_at) == today,
        ).scalar() or 0

        return {
            "remaining_per_minute": max(
                0,
                settings.AI_MAX_REQUESTS_PER_MINUTE - minute_count
            ),
            "remaining_per_day": max(
                0,
                settings.AI_MAX_REQUESTS_PER_DAY - day_count
            ),
        }