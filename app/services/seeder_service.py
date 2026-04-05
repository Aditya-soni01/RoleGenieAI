from sqlalchemy.orm import Session
import logging

from app.models.job import Job

logger = logging.getLogger(__name__)


class SeederService:
    """
    Service for seeding the database with mock data on application startup.
    Checks if jobs table is empty and populates it with mock job listings.
    """

    @staticmethod
    def seed_jobs(db: Session) -> None:
        """
        Seed the jobs table with mock data if it's empty.

        Args:
            db: Database session for performing database operations
        """
        try:
            job_count = db.query(Job).count()

            if job_count > 0:
                logger.info(f"Database already seeded with {job_count} jobs")
                return

            from app.data.mock_jobs import MOCK_JOBS

            for job_data in MOCK_JOBS:
                db_job = Job(
                    title=job_data["title"],
                    company=job_data["company"],
                    location=job_data["location"],
                    description=job_data["description"],
                    category=job_data.get("category"),
                    required_skills=job_data.get("required_skills", ""),
                    salary_min=job_data.get("salary_min"),
                    salary_max=job_data.get("salary_max"),
                    experience_level=job_data.get("experience_level", "mid"),
                    job_type=job_data.get("job_type", "Full-time"),
                    remote=job_data.get("remote", False),
                )
                db.add(db_job)

            db.commit()
            logger.info(f"Successfully seeded {len(MOCK_JOBS)} jobs into database")

        except Exception as e:
            db.rollback()
            logger.error(f"Error seeding jobs: {str(e)}")
            raise
