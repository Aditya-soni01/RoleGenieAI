from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
import logging

from app.models.job import Job
from app.schemas.job import JobCreate, JobUpdate, JobFilterRequest

logger = logging.getLogger(__name__)


class JobService:
    """
    Service layer for Job CRUD operations, filtering, pagination,
    and skill-based job matching.
    """

    @staticmethod
    def create_job(db: Session, job_data: JobCreate) -> Job:
        db_job = Job(
            title=job_data.title,
            description=job_data.description,
            company=job_data.company,
            location=job_data.location,
            salary_min=job_data.salary_min,
            salary_max=job_data.salary_max,
            experience_level=job_data.experience_level,
            required_skills=job_data.required_skills,
            job_type=job_data.job_type,
            remote=job_data.remote,
            category=job_data.category,
        )
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        logger.info(f"Created job: {db_job.id} - {db_job.title}")
        return db_job

    @staticmethod
    def get_job_by_id(db: Session, job_id: int) -> Optional[Job]:
        return db.query(Job).filter(Job.id == job_id).first()

    @staticmethod
    def list_jobs(db: Session, skip: int = 0, limit: int = 10) -> List[Job]:
        """Return a list of jobs with pagination (no total count)."""
        return db.query(Job).offset(skip).limit(limit).all()

    @staticmethod
    def get_all_jobs(db: Session, skip: int = 0, limit: int = 10):
        """Return (jobs, total) tuple."""
        total = db.query(Job).count()
        jobs = db.query(Job).offset(skip).limit(limit).all()
        return jobs, total

    @staticmethod
    def filter_jobs(
        db: Session,
        filter_params: Optional[JobFilterRequest] = None,
        skip: int = 0,
        limit: int = 10,
    ) -> List[Job]:
        """Filter jobs by criteria from a JobFilterRequest object."""
        query = db.query(Job)

        if filter_params:
            if filter_params.title:
                query = query.filter(Job.title.ilike(f"%{filter_params.title}%"))
            if filter_params.company:
                query = query.filter(Job.company.ilike(f"%{filter_params.company}%"))
            if filter_params.location:
                query = query.filter(Job.location.ilike(f"%{filter_params.location}%"))
            if filter_params.experience_level:
                query = query.filter(Job.experience_level == filter_params.experience_level)
            if filter_params.skill:
                query = query.filter(Job.required_skills.ilike(f"%{filter_params.skill}%"))
            if filter_params.salary_min is not None:
                query = query.filter(
                    or_(
                        Job.salary_min >= filter_params.salary_min,
                        Job.salary_max >= filter_params.salary_min,
                    )
                )
            if filter_params.salary_max is not None:
                query = query.filter(
                    or_(
                        Job.salary_min <= filter_params.salary_max,
                        Job.salary_max <= filter_params.salary_max,
                    )
                )

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def search_jobs(
        db: Session,
        query: str,
        skip: int = 0,
        limit: int = 10,
    ) -> List[Job]:
        """Full-text search across job title, description, and company."""
        pattern = f"%{query}%"
        return (
            db.query(Job)
            .filter(
                or_(
                    Job.title.ilike(pattern),
                    Job.description.ilike(pattern),
                    Job.company.ilike(pattern),
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def calculate_skill_match(job: Job, user_skills: List[str]) -> dict:
        """
        Return match_score (0-100), matched_skills, and missing_skills
        for a given job and list of user skills.
        """
        required = [s.strip() for s in (job.required_skills or "").split(",") if s.strip()]
        if not required:
            return {"match_score": 100.0, "matched_skills": [], "missing_skills": []}

        user_lower = {s.lower() for s in user_skills}
        matched = [s for s in required if s.lower() in user_lower]
        missing = [s for s in required if s.lower() not in user_lower]
        score = round((len(matched) / len(required)) * 100, 2)
        return {"match_score": score, "matched_skills": matched, "missing_skills": missing}

    @staticmethod
    def calculate_skill_match_score(
        user_skills: List[str],
        job_required_skills: List[str],
    ) -> float:
        """Calculate match percentage (0-100) between user skills and job requirements."""
        if not job_required_skills:
            return 100.0
        user_lower = [s.lower() for s in user_skills]
        matched = sum(1 for s in job_required_skills if s.lower() in user_lower)
        return round((matched / len(job_required_skills)) * 100, 2)

    @staticmethod
    def rank_jobs_by_skill_match(jobs: List[Job], user_skills: List[str]):
        required_lists = [
            [s.strip() for s in (j.required_skills or "").split(",") if s.strip()]
            for j in jobs
        ]
        scored = [
            (job, JobService.calculate_skill_match_score(user_skills, req))
            for job, req in zip(jobs, required_lists)
        ]
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored

    @staticmethod
    def update_job(db: Session, job_id: int, job_data: JobUpdate) -> Optional[Job]:
        db_job = db.query(Job).filter(Job.id == job_id).first()
        if not db_job:
            return None
        for field, value in job_data.model_dump(exclude_unset=True).items():
            setattr(db_job, field, value)
        db.commit()
        db.refresh(db_job)
        return db_job

    @staticmethod
    def delete_job(db: Session, job_id: int) -> bool:
        db_job = db.query(Job).filter(Job.id == job_id).first()
        if not db_job:
            return False
        db.delete(db_job)
        db.commit()
        return True

    @staticmethod
    def bulk_create_jobs(db: Session, jobs_data: List[dict]) -> List[Job]:
        db_jobs = [Job(**d) for d in jobs_data]
        db.add_all(db_jobs)
        db.commit()
        for j in db_jobs:
            db.refresh(j)
        return db_jobs
