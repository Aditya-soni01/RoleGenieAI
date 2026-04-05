from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
import logging

from app.core.database import get_db
from app.schemas.job import JobResponse, JobFilterParams
from app.services.job_service import JobService
from app.services.auth_service import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=List[JobResponse])
def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[JobResponse]:
    """List all jobs with pagination."""
    try:
        jobs = JobService.list_jobs(db=db, skip=skip, limit=limit)
        logger.info(f"User {current_user.id} listed {len(jobs)} jobs")
        return jobs
    except Exception as e:
        logger.error(f"Error listing jobs: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to list jobs")


@router.get("/filter", response_model=List[JobResponse])
def filter_jobs(
    title: Optional[str] = Query(None),
    company: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    salary_min: Optional[float] = Query(None, ge=0),
    salary_max: Optional[float] = Query(None, ge=0),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[JobResponse]:
    """Filter jobs by various criteria."""
    try:
        filter_params = JobFilterParams(
            title=title,
            company=company,
            location=location,
            experience_level=experience_level,
            skill=skill,
            salary_min=salary_min,
            salary_max=salary_max,
        )
        jobs = JobService.filter_jobs(db=db, filter_params=filter_params, skip=skip, limit=limit)
        return jobs
    except Exception as e:
        logger.error(f"Error filtering jobs: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to filter jobs")


@router.get("/search/keyword", response_model=List[JobResponse])
def search_jobs(
    q: str = Query(..., min_length=1, max_length=255),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[JobResponse]:
    """Search jobs by keyword."""
    try:
        jobs = JobService.search_jobs(db=db, query=q, skip=skip, limit=limit)
        return jobs
    except Exception as e:
        logger.error(f"Error searching jobs: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to search jobs")


@router.get("/{job_id}", response_model=JobResponse)
def get_job_detail(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JobResponse:
    """Get detailed information about a specific job."""
    job = JobService.get_job_by_id(db=db, job_id=job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job with ID {job_id} not found")
    return job


@router.post("/{job_id}/score", response_model=dict)
def score_job_match(
    job_id: int,
    user_skills: List[str] = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Score how well a user's skills match a specific job."""
    job = JobService.get_job_by_id(db=db, job_id=job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job with ID {job_id} not found")
    return JobService.calculate_skill_match(job=job, user_skills=user_skills)
