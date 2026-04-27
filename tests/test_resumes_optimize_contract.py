from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base, get_db
from app.main import app
from app.models.profile import UserExperience, UserProject
from app.models.resume import Resume
from app.models.user import User
from app.services.auth_service import AuthService, get_current_user


SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_resumes_optimize_contract.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function", autouse=True)
def setup_teardown():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def seeded_user_and_resume() -> tuple[int, int]:
    db = TestingSessionLocal()
    user = User(
        email="resume-contract@example.com",
        username="resume_contract_user",
        hashed_password=AuthService.hash_password("password123"),
        first_name="Resume",
        last_name="Tester",
        plan_tier="interview_cracker",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    exp = UserExperience(
        user_id=user.id,
        job_title="Backend Engineer",
        company="Acme Corp",
        location="Remote",
        start_date="Jan 2022",
        end_date="Mar 2025",
        is_current=False,
        description="Built backend services for high-traffic APIs.",
        order_index=0,
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)

    proj = UserProject(
        user_id=user.id,
        experience_id=exp.id,
        name="Billing Platform",
        description="Payments and invoicing platform.",
        technologies="Python, FastAPI, PostgreSQL",
        bullets=[
            "Designed and shipped billing APIs used by 20+ internal services.",
            "Reduced payment reconciliation time by automating daily ledger checks.",
        ],
    )
    db.add(proj)

    resume = Resume(
        user_id=user.id,
        file_name="resume.txt",
        original_content="Backend Engineer at Acme Corp\nWorked on billing systems and APIs.",
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    seeded_user_id = user.id
    seeded_resume_id = resume.id
    db.close()
    return seeded_user_id, seeded_resume_id


@pytest.fixture(scope="function")
def client(seeded_user_and_resume: tuple[int, int]) -> TestClient:
    user_id, _ = seeded_user_and_resume

    def override_current_user():
        db = TestingSessionLocal()
        try:
            return db.query(User).filter(User.id == user_id).first()
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_current_user
    return TestClient(app)


def test_optimize_returns_structured_resume_with_bullet_fallback(client: TestClient, seeded_user_and_resume, monkeypatch):
    _, resume_id = seeded_user_and_resume
    from app.routes import resumes as resumes_route

    def fake_stage1(**kwargs):
        return {
            "candidate_name": "Resume Tester",
            "ats_score_before": 45,
            "matched_hard_skills": ["FastAPI", "Python"],
            "matched_soft_skills": [],
            "missing_critical_skills": [],
            "missing_nice_to_have_skills": [],
            "transferable_skills": [],
            "experience_entries": [],
            "education_entries": [],
            "certifications": [],
            "projects": [],
            "gap_analysis": "Good fit",
            "reorder_strategy": "Lead with relevant backend work",
        }

    def fake_stage2(**kwargs):
        return {
            "full_name": "Resume Tester",
            "contact": {
                "email": "resume-contract@example.com",
                "phone": "",
                "location": "Remote",
                "linkedin": "",
                "portfolio": "",
            },
            "professional_summary": "Backend engineer focused on API platforms.",
            "technical_skills": ["Python", "FastAPI"],
            "professional_skills": ["Collaboration"],
            "experience": [
                {
                    "title": "Backend Engineer",
                    "company": "Acme Corp",
                    "location": "Remote",
                    "duration": "Jan 2022 - Mar 2025",
                    "bullets": [],
                    "projects": [],
                }
            ],
            "education": [],
            "certifications": [],
            "projects": [],
            "ats_score_after": 82,
            "keywords_added": ["FastAPI"],
            "key_improvements": ["Improved keyword alignment"],
        }

    monkeypatch.setattr(resumes_route.ai_service, "analyze_resume_job_fit_v2", fake_stage1)
    monkeypatch.setattr(resumes_route.ai_service, "generate_optimized_resume_v2", fake_stage2)

    response = client.post(
        f"/api/resumes/{resume_id}/optimize",
        params={
            "job_description": "Need a backend engineer with FastAPI and API design experience.",
            "job_title": "Senior Backend Engineer",
            "template_id": "template_2",
        },
    )
    assert response.status_code == 200

    payload = response.json()["data"]
    assert payload["templateId"] == "template_2"
    assert payload["template_id"] == "template_2"
    for key in [
        "personalInfo",
        "professionalSummary",
        "skills",
        "experience",
        "projects",
        "education",
        "certifications",
    ]:
        assert key in payload

    assert payload["experience"][0]["jobTitle"] == "Backend Engineer"
    assert len(payload["experience"][0]["bullets"]) > 0
    assert "billing APIs" in payload["experience"][0]["bullets"][0]

    assert payload["optimized"]["templateId"] == "template_2"
    assert len(payload["optimized"]["experience"][0]["bullets"]) > 0


def test_download_pdf_uses_saved_template_id(client: TestClient, seeded_user_and_resume, monkeypatch):
    _, resume_id = seeded_user_and_resume
    from app.routes import resumes as resumes_route

    def fake_stage1(**kwargs):
        return {"candidate_name": "Resume Tester", "ats_score_before": 50}

    def fake_stage2(**kwargs):
        return {
            "full_name": "Resume Tester",
            "contact": {"email": "resume-contract@example.com", "phone": "", "location": "Remote", "linkedin": "", "portfolio": ""},
            "professional_summary": "Summary",
            "technical_skills": ["Python"],
            "professional_skills": [],
            "experience": [{"title": "Backend Engineer", "company": "Acme Corp", "duration": "Jan 2022 - Mar 2025", "bullets": ["Built APIs"]}],
            "education": [],
            "certifications": [],
            "projects": [],
            "ats_score_after": 75,
            "keywords_added": [],
            "key_improvements": [],
        }

    monkeypatch.setattr(resumes_route.ai_service, "analyze_resume_job_fit_v2", fake_stage1)
    monkeypatch.setattr(resumes_route.ai_service, "generate_optimized_resume_v2", fake_stage2)

    optimize_res = client.post(
        f"/api/resumes/{resume_id}/optimize",
        params={
            "job_description": "Backend engineer role",
            "job_title": "Backend Engineer",
            "template_id": "template_2",
        },
    )
    assert optimize_res.status_code == 200

    captured = {}

    def fake_build_pdf(template_id, data):
        captured["template_id"] = template_id
        captured["data"] = data
        return b"%PDF-1.4 test"

    monkeypatch.setattr(resumes_route.template_service, "build_pdf", fake_build_pdf)

    download_res = client.get(f"/api/resumes/{resume_id}/download/pdf")
    assert download_res.status_code == 200
    assert captured["template_id"] == "template_2"
    assert captured["data"]["experience"][0]["achievements"]
