from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime

from app.core.database import Base


class Job(Base):
    """
    Job listing model representing a job posting with details,
    location, compensation, and required skills.
    """
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(String(5000), nullable=False)
    company = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=True, index=True)
    location = Column(String(255), nullable=False, index=True)
    experience_level = Column(String(50), nullable=True, default="mid")
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    required_skills = Column(String(1000), nullable=True, default="")
    job_type = Column(String(100), nullable=True, default="Full-time")
    remote = Column(Boolean, nullable=True, default=False)
    posted_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Job(id={self.id}, title={self.title}, company={self.company})>"

    def to_dict(self) -> dict:
        """Convert job instance to dictionary."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "company": self.company,
            "category": self.category,
            "location": self.location,
            "experience_level": self.experience_level,
            "salary_min": self.salary_min,
            "salary_max": self.salary_max,
            "required_skills": self.required_skills,
            "job_type": self.job_type,
            "remote": self.remote,
            "posted_date": self.posted_date.isoformat() if self.posted_date else None,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
