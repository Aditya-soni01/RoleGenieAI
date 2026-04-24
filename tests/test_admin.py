from datetime import datetime, timedelta
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.models.activity import ActivityEvent
from app.models.resume import Resume
from app.models.user import User
from app.services.auth_service import AuthService

SQLALCHEMY_TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    app.dependency_overrides[get_db] = lambda: db_session
    yield TestClient(app)
    app.dependency_overrides.clear()


def create_user(db: Session, *, email: str, is_admin: bool = False, plan_tier: str = "starter") -> User:
    user = User(
        email=email,
        username=email.split("@")[0],
        hashed_password=AuthService.hash_password("password123"),
        first_name="Test",
        last_name="User",
        skills=[],
        is_active=True,
        is_admin=is_admin,
        plan_tier=plan_tier,
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def auth_headers(user: User) -> dict[str, str]:
    token = AuthService.create_access_token(data={"sub": str(user.id), "email": user.email})
    return {"Authorization": f"Bearer {token}"}


def test_admin_routes_require_authentication(client: TestClient):
    response = client.get("/api/admin/dashboard")
    assert response.status_code == 401


def test_non_admin_is_blocked_from_admin_api(client: TestClient, db_session: Session):
    user = create_user(db_session, email="user@example.com")
    response = client.get("/api/admin/dashboard", headers=auth_headers(user))
    assert response.status_code == 403
    assert response.json()["detail"] == "Admin privileges required"


def test_dashboard_stats_endpoint_works(client: TestClient, db_session: Session):
    admin = create_user(db_session, email="admin@example.com", is_admin=True)
    user = create_user(db_session, email="paid@example.com", plan_tier="job_seeker")
    db_session.add(
        Resume(
            user_id=user.id,
            file_name="resume.txt",
            original_content="Original resume content",
            optimized_content="{}",
        )
    )
    db_session.add(
        ActivityEvent(
            user_id=user.id,
            event_name="pdf_downloaded",
            session_id="session-1",
            page_path="/resume",
            created_at=datetime.utcnow(),
        )
    )
    db_session.commit()

    response = client.get("/api/admin/dashboard", headers=auth_headers(admin))

    assert response.status_code == 200
    data = response.json()
    assert data["total_users"] == 2
    assert data["paid_users"] == 1
    assert data["resume_uploads_count"] == 1
    assert data["resume_optimizations_count"] == 1
    assert data["downloads_count"] == 1


def test_user_list_filtering_and_pagination(client: TestClient, db_session: Session):
    admin = create_user(db_session, email="admin@example.com", is_admin=True)
    create_user(db_session, email="free@example.com")
    create_user(db_session, email="paid@example.com", plan_tier="interview_cracker")

    response = client.get(
        "/api/admin/users",
        params={"page": 1, "per_page": 1, "paid_filter": "paid"},
        headers=auth_headers(admin),
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["email"] == "paid@example.com"
    assert data["pages"] == 1


def test_activity_event_write_path_accepts_anonymous_and_authenticated_events(
    client: TestClient,
    db_session: Session,
):
    response = client.post(
        "/api/analytics/events",
        json={
            "event_name": "page_view",
            "session_id": "anon-session",
            "page_path": "/",
            "metadata": {"source": "test"},
        },
    )
    assert response.status_code == 202
    assert db_session.query(ActivityEvent).filter_by(session_id="anon-session").count() == 1

    user = create_user(db_session, email="tracked@example.com")
    response = client.post(
        "/api/analytics/events",
        json={"event_name": "pricing_viewed", "session_id": "user-session", "page_path": "/subscription"},
        headers=auth_headers(user),
    )

    assert response.status_code == 202
    event = db_session.query(ActivityEvent).filter_by(session_id="user-session").first()
    assert event is not None
    assert event.user_id == user.id
    assert user.last_activity_at is not None


def test_user_list_signup_date_filter(client: TestClient, db_session: Session):
    admin = create_user(db_session, email="admin@example.com", is_admin=True)
    old_user = create_user(db_session, email="old@example.com")
    old_user.created_at = datetime.utcnow() - timedelta(days=40)
    db_session.commit()
    create_user(db_session, email="new@example.com")

    response = client.get(
        "/api/admin/users",
        params={"signup_from": (datetime.utcnow() - timedelta(days=7)).isoformat()},
        headers=auth_headers(admin),
    )

    assert response.status_code == 200
    emails = {item["email"] for item in response.json()["items"]}
    assert "new@example.com" in emails
    assert "old@example.com" not in emails
