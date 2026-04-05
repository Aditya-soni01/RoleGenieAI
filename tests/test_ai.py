from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import logging
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.main import app
from app.core.database import Base, get_db
from app.models.user import User
from app.models.ai_request_log import AIRequestLog, AIRequestType
from app.core.config import settings
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)

# In-memory SQLite database for testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    """Override database dependency for tests."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_teardown():
    """Setup and teardown for each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user_token() -> tuple[str, dict]:
    """Create a test user and return auth token + user data."""
    db = TestingSessionLocal()
    
    user_data = {
        "email": "test@example.com",
        "password": "testpass123",
        "full_name": "Test User"
    }
    
    # Create user
    hashed_password = AuthService.hash_password(user_data["password"])
    user = User(
        email=user_data["email"],
        hashed_password=hashed_password,
        full_name=user_data["full_name"],
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Generate token
    token = AuthService.create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    db.close()
    return token, {"user_id": user.id, "email": user.email}


@pytest.fixture
def auth_headers(test_user_token) -> Dict[str, str]:
    """Get authorization headers with valid JWT token."""
    token, _ = test_user_token
    return {"Authorization": f"Bearer {token}"}


class TestAIEndpoints:
    """Test suite for AI-powered endpoints."""

    def test_resume_optimization_missing_auth(self):
        """Test resume optimization endpoint without authentication."""
        response = client.post(
            "/api/ai/resume/optimize",
            json={
                "resume_text": "Senior Software Engineer...",
                "job_description": "Looking for SWE..."
            }
        )
        assert response.status_code == 401

    @patch("app.services.ai_service.AIService.optimize_resume")
    def test_resume_optimization_success(self, mock_optimize, auth_headers, test_user_token):
        """Test successful resume optimization with mocked Claude response."""
        _, user_data = test_user_token
        
        mock_response = {
            "optimized_resume": "Senior Software Engineer with 10+ years...",
            "keywords_added": ["Python", "FastAPI", "AWS"],
            "ats_score": 87,
            "suggestions": ["Add more quantifiable metrics", "Highlight leadership"]
        }
        mock_optimize.return_value = mock_response
        
        response = client.post(
            "/api/ai/resume/optimize",
            json={
                "resume_text": "Senior Software Engineer...",
                "job_description": "Looking for SWE with Python experience",
                "job_title": "Senior Software Engineer"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["optimized_resume"] == "Senior Software Engineer with 10+ years..."
        assert "Python" in data["keywords_added"]
        assert data["ats_score"] == 87

    @patch("app.services.ai_service.AIService.generate_cover_letter")
    def test_cover_letter_generation_success(self, mock_generate, auth_headers, test_user_token):
        """Test successful cover letter generation with mocked Claude response."""
        _, user_data = test_user_token
        
        mock_response = {
            "cover_letter": "Dear Hiring Manager,\n\nI am excited to apply for...",
            "tone": "professional",
            "length": 350
        }
        mock_generate.return_value = mock_response
        
        response = client.post(
            "/api/ai/cover-letter/generate",
            json={
                "user_name": "John Doe",
                "user_title": "Senior Software Engineer",
                "user_summary": "10 years of experience...",
                "job_title": "Staff Engineer",
                "company_name": "TechCorp",
                "job_description": "Looking for experienced staff engineer..."
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "cover_letter" in data
        assert "Dear Hiring Manager" in data["cover_letter"]

    @patch("app.services.ai_service.AIService.calculate_match_score")
    def test_job_match_score_success(self, mock_match, auth_headers, test_user_token):
        """Test job match score calculation with mocked Claude response."""
        _, user_data = test_user_token
        
        mock_response = {
            "match_percentage": 82,
            "skill_match": {
                "python": 95,
                "fastapi": 85,
                "docker": 75,
                "missing": ["Kubernetes"]
            },
            "experience_match": 88,
            "recommendation": "Strong match - apply immediately"
        }
        mock_match.return_value = mock_response
        
        response = client.post(
            "/api/ai/job/match-score",
            json={
                "resume_text": "Senior SWE with Python...",
                "job_title": "Staff Engineer",
                "job_description": "Looking for Staff Engineer...",
                "company_name": "TechCorp",
                "required_skills": ["Python", "FastAPI", "Docker"]
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["match_percentage"] == 82
        assert "skill_match" in data
        assert data["recommendation"] == "Strong match - apply immediately"

    @patch("app.services.ai_service.AIService.optimize_resume")
    def test_ai_request_logging(self, mock_optimize, auth_headers, test_user_token):
        """Verify AI requests are logged to database."""
        _, user_data = test_user_token
        user_id = user_data["user_id"]
        
        mock_optimize.return_value = {
            "optimized_resume": "Optimized text",
            "keywords_added": ["skill1"],
            "ats_score": 80,
            "suggestions": []
        }
        
        response = client.post(
            "/api/ai/resume/optimize",
            json={
                "resume_text": "Original text",
                "job_description": "Job desc",
                "job_title": "Engineer"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        
        # Verify log entry was created
        db = TestingSessionLocal()
        log_entry = db.query(AIRequestLog).filter_by(user_id=user_id).first()
        db.close()
        
        assert log_entry is not None
        assert log_entry.request_type == AIRequestType.RESUME_OPTIMIZE.value
        assert log_entry.response_status == "success"

    def test_rate_limiting_enforcement(self, auth_headers, test_user_token):
        """Test that rate limiting is enforced on AI endpoints."""
        _, user_data = test_user_token
        user_id = user_data["user_id"]
        
        db = TestingSessionLocal()
        
        # Create mock request logs to simulate hitting rate limit
        for _ in range(12):  # Exceed default limit of 10 per minute
            log = AIRequestLog(
                user_id=user_id,
                request_type=AIRequestType.RESUME_OPTIMIZE.value,
                model_used="claude-3-5-sonnet-20241022",
                input_tokens=500,
                output_tokens=300,
                response_status="success",
                created_at=datetime.utcnow()
            )
            db.add(log)
        db.commit()
        db.close()
        
        # Next request should be rate limited
        response = client.post(
            "/api/ai/resume/optimize",
            json={
                "resume_text": "Text",
                "job_description": "Desc",
                "job_title": "Engineer"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 429

    @patch("app.services.ai_service.AIService.optimize_resume")
    def test_resume_optimization_missing_fields(self, mock_optimize, auth_headers):
        """Test resume optimization with missing required fields."""
        response = client.post(
            "/api/ai/resume/optimize",
            json={
                "resume_text": "Text"
                # Missing job_description and job_title
            },
            headers=auth_headers
        )
        
        assert response.status_code == 422

    @patch("app.services.ai_service.AIService.generate_cover_letter")
    def test_cover_letter_invalid_input(self, mock_generate, auth_headers):
        """Test cover letter generation with invalid input."""
        response = client.post(
            "/api/ai/cover-letter/generate",
            json={
                "user_name": "",  # Empty name
                "user_title": "Engineer",
                "job_title": "Senior Engineer",
                "company_name": "TechCorp"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 422

    @patch("app.services.ai_service.AIService.optimize_resume")
    def test_ai_service_timeout_handling(self, mock_optimize, auth_headers):
        """Test graceful handling of AI service timeout."""
        import asyncio
        mock_optimize.side_effect = asyncio.TimeoutError("Claude API timeout")
        
        response = client.post(
            "/api/ai/resume/optimize",
            json={
                "resume_text": "Text",
                "job_description": "Desc",
                "job_title": "Engineer"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 504

    @patch("app.services.ai_service.AIService.calculate_match_score")
    def test_match_score_invalid_skills(self, mock_match, auth_headers):
        """Test match score with invalid skills list."""
        response = client.post(
            "/api/ai/job/match-score",
            json={
                "resume_text": "Text",
                "job_title": "Engineer",
                "job_description": "Desc",
                "company_name": "Corp",
                "required_skills": []  # Empty skills
            },
            headers=auth_headers
        )
        
        assert response.status_code == 422

    def test_ai_endpoints_without_token(self):
        """Test that all AI endpoints reject requests without token."""
        endpoints = [
            ("/api/ai/resume/optimize", "POST"),
            ("/api/ai/cover-letter/generate", "POST"),
            ("/api/ai/job/match-score", "POST"),
        ]
        
        for endpoint, method in endpoints:
            if method == "POST":
                response = client.post(
                    endpoint,
                    json={"test": "data"}
                )
            
            assert response.status_code == 401

    @patch("app.services.ai_service.AIService.optimize_resume")
    def test_ai_response_validation(self, mock_optimize, auth_headers):
        """Test that AI responses are properly validated against schemas."""
        # Return response with missing required fields
        mock_optimize.return_value = {
            "optimized_resume": "Text"
            # Missing other required fields
        }
        
        response = client.post(
            "/api/ai/resume/optimize",
            json={
                "resume_text": "Text",
                "job_description": "Desc",
                "job_title": "Engineer"
            },
            headers=auth_headers
        )
        
        # Should fail validation or return 500
        assert response.status_code in [500, 422]

    @patch("app.services.ai_service.AIService.optimize_resume")
    def test_concurrent_ai_requests(self, mock_optimize, auth_headers, test_user_token):
        """Test handling of concurrent AI requests."""
        _, user_data = test_user_token
        
        mock_optimize.return_value = {
            "optimized_resume": "Text",
            "keywords_added": ["skill"],
            "ats_score": 85,
            "suggestions": []
        }
        
        # Simulate 3 concurrent requests
        responses = []
        for i in range(3):
            response = client.post(
                "/api/ai/resume/optimize",
                json={
                    "resume_text": f"Text {i}",
                    "job_description": "Desc",
                    "job_title": "Engineer"
                },
                headers=auth_headers
            )
            responses.append(response)
        
        # All should succeed
        for resp in responses:
            assert resp.status_code == 200
        
        # Verify all logged
        db = TestingSessionLocal()
        logs = db.query(AIRequestLog).filter_by(
            user_id=user_data["user_id"]
        ).all()
        db.close()
        
        assert len(logs) == 3

    @patch("app.services.ai_service.AIService.optimize_resume")
    def test_ai_request_token_tracking(self, mock_optimize, auth_headers, test_user_token):
        """Test that token usage is properly tracked."""
        _, user_data = test_user_token
        
        mock_optimize.return_value = {
            "optimized_resume": "Text",
            "keywords_added": ["skill"],
            "ats_score": 85,
            "suggestions": []
        }
        
        response = client.post(
            "/api/ai/resume/optimize",
            json={
                "resume_text": "Text",
                "job_description": "Desc",
                "job_title": "Engineer"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        
        # Verify token counts are logged
        db = TestingSessionLocal()
        log = db.query(AIRequestLog).filter_by(
            user_id=user_data["user_id"]
        ).first()
        db.close()
        
        assert log.input_tokens > 0
        assert log.output_tokens > 0