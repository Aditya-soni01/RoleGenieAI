tests/test_jobs.py
from datetime import datetime
from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.main import app
from app.core.database import Base, get_db
from app.models.user import User
from app.models.job import Job
from app.services.auth_service import AuthService
from app.data.mock_jobs import MOCK_JOBS


# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    """Override get_db dependency for testing."""
    database = TestingSessionLocal()
    try:
        yield database
    finally:
        database.close()


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    yield from override_get_db()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> TestClient:
    """Create a test client with overridden database."""
    app.dependency_overrides[get_db] = lambda: db_session
    return TestClient(app)


@pytest.fixture(scope="function")
def test_user(db_session: Session) -> User:
    """Create a test user."""
    user = User(
        email="testuser@example.com",
        username="testuser",
        hashed_password=AuthService.hash_password("password123"),
        first_name="Test",
        last_name="User",
        skills=["Python", "FastAPI", "PostgreSQL"],
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def test_token(client: TestClient) -> str:
    """Get a valid JWT token for testing."""
    response = client.post(
        "/auth/register",
        json={
            "email": "tokenuser@example.com",
            "username": "tokenuser",
            "password": "password123",
            "first_name": "Token",
            "last_name": "User",
        },
    )
    assert response.status_code == 201
    return response.json()["access_token"]


@pytest.fixture(scope="function")
def seed_jobs(db_session: Session) -> None:
    """Seed the database with mock jobs."""
    for job_data in MOCK_JOBS:
        job = Job(
            title=job_data["title"],
            description=job_data["description"],
            company=job_data["company"],
            location=job_data["location"],
            salary_min=job_data.get("salary_min"),
            salary_max=job_data.get("salary_max"),
            experience_level=job_data.get("experience_level", "mid"),
            required_skills=job_data.get("required_skills", []),
            job_type=job_data.get("job_type", "Full-time"),
            remote=job_data.get("remote", False),
        )
        db_session.add(job)
    db_session.commit()


class TestJobListing:
    """Tests for job listing endpoints."""

    def test_list_jobs_requires_authentication(self, client: TestClient, seed_jobs):
        """Test that unauthenticated requests are rejected."""
        response = client.get("/jobs")
        assert response.status_code == 401

    def test_list_jobs_success(self, client: TestClient, test_token: str, seed_jobs):
        """Test successful job listing retrieval."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get("/jobs", headers=headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) > 0

    def test_list_jobs_pagination(self, client: TestClient, test_token: str, seed_jobs):
        """Test job listing with pagination."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get("/jobs?skip=0&limit=5", headers=headers)
        assert response.status_code == 200
        jobs = response.json()
        assert len(jobs) <= 5

    def test_list_jobs_invalid_limit(self, client: TestClient, test_token: str, seed_jobs):
        """Test job listing with invalid limit parameter."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get("/jobs?limit=101", headers=headers)
        assert response.status_code == 422

    def test_list_jobs_invalid_skip(self, client: TestClient, test_token: str, seed_jobs):
        """Test job listing with negative skip parameter."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get("/jobs?skip=-1", headers=headers)
        assert response.status_code == 422


class TestJobFiltering:
    """Tests for job filtering functionality."""

    def test_filter_by_title(self, client: TestClient, test_token: str, seed_jobs):
        """Test filtering jobs by title."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get("/jobs?title=Python", headers=headers)
        assert response.status_code == 200
        jobs = response.json()
        assert all("Python" in job["title"] for job in jobs)

    def test_filter_by_location(self, client: TestClient, test_token: str, seed_jobs):
        """Test filtering jobs by location."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get("/jobs?location=San+Francisco", headers=headers)
        assert response.status_code == 200
        jobs = response.json()
        assert all("San Francisco" in job["location"] for job in jobs)

    def test_filter_by_experience_level(self, client: TestClient, test_token: str, seed_jobs):
        """Test filtering jobs by experience level."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get("/jobs?experience_level=senior", headers=headers)
        assert response.status_code == 200
        jobs = response.json()
        assert all(job["experience_level"] == "senior" for job in jobs)

    def test_filter_by_salary_range(self, client: TestClient, test_token: str, seed_jobs):
        """Test filtering jobs by salary range."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get("/jobs?min_salary=100000&max_salary=200000", headers=headers)
        assert response.status_code == 200
        jobs = response.json()
        for job in jobs:
            if job["salary_min"] and job["salary_max"]:
                assert job["salary_min"] >= 100000
                assert job["salary_max"] <= 200000

    def test_filter_by_remote(self, client: TestClient, test_token: str, seed_jobs):
        """Test filtering jobs by remote status."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get("/jobs?remote=true", headers=headers)
        assert response.status_code == 200
        jobs = response.json()
        assert all(job["remote"] is True for job in jobs)

    def test_filter_by_job_type(self, client: TestClient, test_token: str, seed_jobs):
        """Test filtering jobs by job type."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get("/jobs?job_type=Full-time", headers=headers)
        assert response.status_code == 200
        jobs = response.json()
        assert all(job["job_type"] == "Full-time" for job in jobs)

    def test_combined_filters(self, client: TestClient, test_token: str, seed_jobs):
        """Test combining multiple filters."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get(
            "/jobs?experience_level=senior&remote=true&min_salary=150000",
            headers=headers,
        )
        assert response.status_code == 200
        jobs = response.json()
        for job in jobs:
            assert job["experience_level"] == "senior"
            assert job["remote"] is True
            if job["salary_min"]:
                assert job["salary_min"] >= 150000

    def test_filter_no_results(self, client: TestClient, test_token: str, seed_jobs):
        """Test filtering that returns no results."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get("/jobs?title=NonexistentJobTitle", headers=headers)
        assert response.status_code == 200
        jobs = response.json()
        assert len(jobs) == 0


class TestJobScoring:
    """Tests for job matching and scoring based on user skills."""

    def test_score_jobs_by_skills(self, client: TestClient, test_token: str, seed_jobs):
        """Test scoring jobs based on user skills."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get("/jobs/score", headers=headers)
        assert response.status_code == 200
        jobs = response.json()
        assert isinstance(jobs, list)

    def test_score_jobs_returns_match_percentage(
        self, client: TestClient, test_token: str, seed_jobs
    ):
        """Test that scored jobs include match percentage."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get("/jobs/score", headers=headers)
        assert response.status_code == 200
        jobs = response.json()
        for job in jobs:
            assert "match_percentage" in job
            assert 0 <= job["match_percentage"] <= 100

    def test_score_jobs_sorted_by_match(
        self, client: TestClient, test_token: str, seed_jobs
    ):
        """Test that scored jobs are sorted by match percentage."""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.get("/jobs/score", headers=headers)
        assert response.status_code == 200
        jobs = response.json()
        match_percentages = [job["match_percentage"] for job in jobs]
        assert match_percentages == sorted(match_percentages, reverse=True)

    def test_score_with_user_skills(self, db_session: Session, client: TestClient):
        """Test scoring with user having specific skills."""
        headers = {"Authorization": f"Bearer {test_token}"}
        # Create user with specific skills
        user = User(
            email="skilled@example.com",
            username="skilled",
            hashed_password=AuthService.hash_password("password123"),
            first_name="Skilled",
            last_name="User",
            skills=["Python", "FastAPI", "PostgreSQL", "Docker"],
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()

        # Seed jobs
        for job_data in MOCK_JOBS[:3]:
            job = Job(
                title=job_data["title"],
                description=job_data["description"],
                company=job_data["company"],
                location=job_data["location"],
                salary_min=job_data.get("salary_min"),
                salary_max=job_data.get("salary_max"),
                experience_level=job_data.get("experience_level", "mid"),
                required_skills=job_data.get("required_skills", []),
                job_type=job_data.get("job_type", "Full-time"),
                remote=job_data.get("remote", False),
            )
            db_session.add(job)
        db_session.commit()

        token = AuthService.create_access_token(user.id)
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/jobs/score", headers=headers)
        assert response.status_code == 200
        jobs = response.json()
        assert len(jobs) > 0

    def test_score_no_user_skills(self, db_session: Session, client: TestClient):
        """Test scoring when user has no skills."""
        user = User(
            email="noskill@example.com",
            username="noskill",
            hashed_password=AuthService.hash_password("password123"),
            first_name="No",
            last_name="Skill",
            skills=[],
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()

        for job_data in MOCK_JOBS[:3]:
            job = Job(
                title=job_data["title"],
                description=job_data["description"],
                company=job_data["company"],
                location=job_data["location"],
                salary_min=job_data.get("salary_min"),
                salary_max=job_data.get("salary_max"),
                experience_level=job_data.get("experience_level", "mid"),
                required_skills=job_data.get("required_skills", []),
                job_type=job_data.get("job_type", "Full-time"),
                remote=job_data.get("remote", False),
            )
            db_session.add(job)
        db_session.commit()

        token = AuthService.create_access_token(user.id)
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/jobs/score", headers=headers)
        assert response.status_code == 200
        jobs = response.json()
        assert all(job["match_percentage"] == 0 for job in jobs)


class TestJobSeeder:
    """Tests for job seeding functionality."""

    def test_seeder_populates_database(self, db_session: Session):
        """Test that seeder successfully populates the database."""
        from app.services.seeder_service import SeederService

        job_count_before = db_session.query(Job).count()
        SeederService.seed_jobs(db_session)
        job_count_after = db_session.query(Job).count()
        assert job_count_after > job_count_before

    def test_seeder_does_not_duplicate(self, db_session: Session):
        """Test that seeder doesn't duplicate jobs on multiple calls."""
        from app.services.seeder_service import SeederService

        SeederService.seed_jobs(db_session)
        count_after_first = db_session.query(Job).count()

        SeederService.seed_jobs(db_session)
        count_after_second = db_session.query(Job).count()

        assert count_after_first == count_after_second

    def test_seeded_jobs_have_required_fields(self, db_session: Session):
        """Test that seeded jobs have all required fields."""
        from app.services.seeder_service import SeederService

        SeederService.seed_jobs(db_session)
        jobs = db_session.query(Job).all()

        assert len(jobs) > 0
        for job in jobs:
            assert job.title is not None
            assert job.company is not None
            assert job.location is not None
            assert job.description is not None

    def test_seeded_jobs_match_mock_data(self, db_session: Session):
        """Test that seeded jobs match the mock data."""